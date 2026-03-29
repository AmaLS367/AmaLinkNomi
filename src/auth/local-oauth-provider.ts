import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Response } from 'express';
import type {
  OAuthClientInformationFull,
  OAuthTokens,
} from '@modelcontextprotocol/sdk/shared/auth.js';
import type {
  AuthorizationParams,
  OAuthServerProvider,
} from '@modelcontextprotocol/sdk/server/auth/provider.js';
import type { OAuthRegisteredClientsStore } from '@modelcontextprotocol/sdk/server/auth/clients.js';
import {
  InvalidGrantError,
  InvalidRequestError,
  InvalidTokenError,
} from '@modelcontextprotocol/sdk/server/auth/errors.js';
import { AuthError } from '../shared/errors';
import { authenticateBearerToken, type AuthenticatedUser } from './token-auth';
import { getEnv, type AppEnv } from '../config/env';

type RegisteredClientPayload = Omit<OAuthClientInformationFull, 'client_id'>;

type AuthorizationRequestPayload = {
  clientId: string;
  redirectUri: string;
  state?: string;
  scopes: string[];
  codeChallenge: string;
  resource?: string;
  exp: number;
};

type AuthorizationCodePayload = {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  codeChallenge: string;
  resource?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  exp: number;
};

export const OAUTH_SCOPES_SUPPORTED = ['openid', 'email', 'profile'];
const AUTHORIZATION_TTL_MS = 10 * 60 * 1000;
const CODE_TTL_MS = 2 * 60 * 1000;

export interface LocalOAuthProviderOptions {
  env?: AppEnv;
  authenticateUser?: (authorizationHeader?: string | null) => Promise<AuthenticatedUser>;
}

export class StatelessOAuthClientsStore implements OAuthRegisteredClientsStore {
  async getClient(clientId: string): Promise<OAuthClientInformationFull | undefined> {
    try {
      const payload = verifySignedToken<RegisteredClientPayload>(clientId);
      return {
        ...payload,
        client_id: clientId,
      };
    } catch {
      return undefined;
    }
  }

  async registerClient(
    client: Omit<OAuthClientInformationFull, 'client_id' | 'client_id_issued_at'>
  ): Promise<OAuthClientInformationFull> {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload: RegisteredClientPayload = {
      ...client,
      client_id_issued_at: issuedAt,
    };

    const clientId = signPayload(payload);
    return {
      ...payload,
      client_id: clientId,
    };
  }
}

export class LocalOAuthProvider implements OAuthServerProvider {
  readonly clientsStore = new StatelessOAuthClientsStore();
  private readonly env: AppEnv;
  private readonly authenticateUser: (authorizationHeader?: string | null) => Promise<AuthenticatedUser>;

  constructor(options: LocalOAuthProviderOptions = {}) {
    this.env = options.env ?? getEnv();
    this.authenticateUser = options.authenticateUser ?? authenticateBearerToken;
  }

  async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    const authorizationId = signPayload<AuthorizationRequestPayload>({
      clientId: client.client_id,
      redirectUri: params.redirectUri,
      state: params.state,
      scopes: params.scopes ?? [],
      codeChallenge: params.codeChallenge,
      resource: params.resource?.href,
      exp: Date.now() + AUTHORIZATION_TTL_MS,
    }, this.env);

    res.redirect(302, `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`);
  }

  async challengeForAuthorizationCode(client: OAuthClientInformationFull, authorizationCode: string): Promise<string> {
    const payload = verifySignedToken<AuthorizationCodePayload>(authorizationCode, this.env);
    ensureClientMatch(client, payload.clientId);
    return payload.codeChallenge;
  }

  async exchangeAuthorizationCode(
    client: OAuthClientInformationFull,
    authorizationCode: string,
    _codeVerifier?: string,
    redirectUri?: string,
    resource?: URL
  ): Promise<OAuthTokens> {
    const payload = verifySignedToken<AuthorizationCodePayload>(authorizationCode, this.env);
    ensureClientMatch(client, payload.clientId);

    if (redirectUri && redirectUri !== payload.redirectUri) {
      throw new InvalidGrantError('redirect_uri does not match the issued authorization code.');
    }

    if (resource && payload.resource && resource.href !== payload.resource) {
      throw new InvalidGrantError('resource does not match the issued authorization code.');
    }

    return {
      access_token: payload.accessToken,
      refresh_token: payload.refreshToken,
      token_type: 'bearer',
      expires_in: payload.expiresAt ? Math.max(payload.expiresAt - Math.floor(Date.now() / 1000), 1) : undefined,
      scope: payload.scopes.join(' '),
    };
  }

  async exchangeRefreshToken(
    client: OAuthClientInformationFull,
    refreshToken: string,
    _scopes?: string[],
    _resource?: URL
  ): Promise<OAuthTokens> {
    if (!refreshToken) {
      throw new InvalidRequestError('refresh_token is required.');
    }

    const supabaseTokens = await refreshSupabaseSession(refreshToken, this.env);
    await this.authenticateUser(`Bearer ${supabaseTokens.access_token}`);
    await this.clientsStore.getClient(client.client_id);

    return supabaseTokens;
  }

  async verifyAccessToken(token: string) {
    const user = await this.authenticateUser(`Bearer ${token}`);
    const expiresAt = typeof user.claims.exp === 'number' ? user.claims.exp : undefined;
    return {
      token,
      clientId: 'supabase-session',
      scopes: OAUTH_SCOPES_SUPPORTED,
      expiresAt,
      extra: {
        userId: user.id,
        email: user.email,
      },
    };
  }
}

export function buildAuthorizationCode(input: {
  authorizationId: string;
  accessToken: string;
  refreshToken?: string;
  env?: AppEnv;
}): AuthorizationCodePayload & { token: string } {
  const env = input.env ?? getEnv();
  const authorization = verifySignedToken<AuthorizationRequestPayload>(input.authorizationId, env);
  const user = parseUserFromToken(input.accessToken);
  const expiresAt = typeof user.exp === 'number' ? user.exp : undefined;

  const payload: AuthorizationCodePayload = {
    clientId: authorization.clientId,
    redirectUri: authorization.redirectUri,
    scopes: authorization.scopes,
    codeChallenge: authorization.codeChallenge,
    resource: authorization.resource,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    expiresAt,
    exp: Date.now() + CODE_TTL_MS,
  };

  return {
    ...payload,
    token: signPayload(payload, env),
  };
}

export function buildConsentRedirect(input: {
  authorizationId: string;
  decision: 'approve' | 'deny';
  accessToken?: string;
  refreshToken?: string;
  env?: AppEnv;
}): string {
  const env = input.env ?? getEnv();
  const authorization = verifySignedToken<AuthorizationRequestPayload>(input.authorizationId, env);
  const redirectTarget = new URL(authorization.redirectUri);

  if (authorization.state) {
    redirectTarget.searchParams.set('state', authorization.state);
  }

  if (input.decision === 'deny') {
    redirectTarget.searchParams.set('error', 'access_denied');
    redirectTarget.searchParams.set('error_description', 'The user denied access to AmaNomiBridge.');
    return redirectTarget.href;
  }

  if (!input.accessToken) {
    throw new InvalidRequestError('An authenticated access token is required to approve access.');
  }

  const authorizationCode = buildAuthorizationCode({
    authorizationId: input.authorizationId,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    env,
  });

  redirectTarget.searchParams.set('code', authorizationCode.token);
  return redirectTarget.href;
}

export function getAuthorizationSummary(authorizationId: string, env = getEnv()) {
  const payload = verifySignedToken<AuthorizationRequestPayload>(authorizationId, env);
  return {
    clientId: payload.clientId,
    redirectUri: payload.redirectUri,
    scopes: payload.scopes,
    resource: payload.resource ?? null,
  };
}

function refreshSupabaseSession(refreshToken: string, env: AppEnv = getEnv()): Promise<OAuthTokens> {
  const url = `${env.SUPABASE_URL.replace(/\/$/, '')}/auth/v1/token?grant_type=refresh_token`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      throw new AuthError('Refresh token was rejected by Supabase.');
    }

    const payload = (await response.json()) as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    };

    if (!payload.access_token || !payload.token_type) {
      throw new AuthError('Supabase refresh response did not include a usable access token.');
    }

    return {
      access_token: payload.access_token,
      refresh_token: payload.refresh_token,
      expires_in: payload.expires_in,
      token_type: payload.token_type,
      scope: OAUTH_SCOPES_SUPPORTED.join(' '),
    };
  });
}

function parseUserFromToken(token: string): { exp?: unknown } {
  const [, payload] = token.split('.');
  if (!payload) {
    throw new InvalidTokenError('Access token is not a JWT.');
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: unknown };
  } catch {
    throw new InvalidTokenError('Access token payload is malformed.');
  }
}

function ensureClientMatch(client: OAuthClientInformationFull, clientId: string) {
  if (client.client_id !== clientId) {
    throw new InvalidGrantError('Authorization artifact was not issued to this client.');
  }
}

function signPayload<T extends object>(payload: T, env: AppEnv = getEnv()): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', getSigningSecret(env)).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function verifySignedToken<T extends object>(token: string, env: AppEnv = getEnv()): T {
  const [body, signature] = token.split('.');
  if (!body || !signature) {
    throw new InvalidRequestError('Malformed OAuth token.');
  }

  const expectedSignature = createHmac('sha256', getSigningSecret(env)).update(body).digest('base64url');
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new InvalidGrantError('OAuth token signature is invalid.');
  }

  let payload: T;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    throw new InvalidRequestError('OAuth token payload is malformed.');
  }

  const expiresAt = (payload as { exp?: unknown }).exp;
  if (typeof expiresAt === 'number' && expiresAt < Date.now()) {
    throw new InvalidGrantError('OAuth token has expired.');
  }

  return payload;
}

function getSigningSecret(env: AppEnv = getEnv()): string {
  return `${env.SUPABASE_SERVICE_ROLE_KEY}:ama-nomi-bridge:oauth`;
}

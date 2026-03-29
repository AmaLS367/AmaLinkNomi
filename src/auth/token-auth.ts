import { getEnv } from '../config/env';
import { AuthError } from '../shared/errors';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  accessToken: string;
  claims: Record<string, unknown>;
}

type JoseModule = {
  createRemoteJWKSet(url: URL): unknown;
  jwtVerify(
    token: string,
    jwks: unknown,
    options: { issuer: string; audience: string }
  ): Promise<{ payload: Record<string, unknown> }>;
};

let cachedJoseModule: Promise<JoseModule> | null = null;
let cachedJwks: unknown = null;
let cachedJwksUrl: string | null = null;

export function extractBearerToken(authorizationHeader?: string | null): string | null {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.slice('Bearer '.length).trim() || null;
}

export async function authenticateBearerToken(authorizationHeader?: string | null): Promise<AuthenticatedUser> {
  const token = extractBearerToken(authorizationHeader);
  if (!token) {
    throw new AuthError('Authentication required for this request.');
  }

  const env = getEnv();
  const jose = await getJoseModule();
  const jwks = getJwks(jose, env.SUPABASE_JWKS_URL);
  const verification = await jose.jwtVerify(token, jwks, {
    issuer: env.SUPABASE_JWT_ISSUER,
    audience: env.SUPABASE_JWT_AUDIENCE,
  }).catch(() => {
    throw new AuthError('Invalid bearer token.');
  });

  const subject = verification.payload.sub;
  if (typeof subject !== 'string' || !subject) {
    throw new AuthError('Bearer token is missing a user subject.');
  }

  return {
    id: subject,
    email: typeof verification.payload.email === 'string' ? verification.payload.email : null,
    accessToken: token,
    claims: verification.payload,
  };
}

function getJwks(jose: JoseModule, jwksUrl: string) {
  if (cachedJwks && cachedJwksUrl === jwksUrl) {
    return cachedJwks;
  }

  cachedJwks = jose.createRemoteJWKSet(new URL(jwksUrl));
  cachedJwksUrl = jwksUrl;
  return cachedJwks;
}

function getJoseModule(): Promise<JoseModule> {
  if (!cachedJoseModule) {
    cachedJoseModule = import('jose') as Promise<JoseModule>;
  }

  return cachedJoseModule;
}

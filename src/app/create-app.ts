import express from 'express';
import { authorizationHandler } from '@modelcontextprotocol/sdk/server/auth/handlers/authorize.js';
import { clientRegistrationHandler } from '@modelcontextprotocol/sdk/server/auth/handlers/register.js';
import { tokenHandler } from '@modelcontextprotocol/sdk/server/auth/handlers/token.js';
import { getPublicEnv, getEnv, type AppEnv } from '../config/env';
import { authenticateBearerToken, type AuthenticatedUser } from '../auth/token-auth';
import {
  buildAuthorizationServerMetadata,
  buildProtectedResourceMetadata,
  getRequestOrigin,
} from '../auth/oauth-metadata';
import {
  buildConsentRedirect,
  getAuthorizationSummary,
  LocalOAuthProvider,
} from '../auth/local-oauth-provider';
import { logger } from '../shared/logger';
import { UserNomiCredentialsStore } from '../storage/user-nomi-credentials-store';
import { NomiApiClient } from '../nomi/nomi-client';
import { ValidationError } from '../shared/errors';
import { renderConsentPage } from '../ui/render-consent';
import { isGuideSlug, renderShell } from '../ui/render-shell';
import { handleMcpRequest } from '../adapters/vercel/handler';

type PublicEnv = Pick<AppEnv, 'SUPABASE_URL' | 'SUPABASE_ANON_KEY' | 'APP_BASE_URL'>;
type CredentialStore = Pick<UserNomiCredentialsStore, 'getStatus' | 'upsertApiKey' | 'deleteApiKey'>;

export interface CreateAppOptions {
  env?: AppEnv;
  publicEnv?: PublicEnv;
  authenticateUser?: (authorizationHeader?: string | null) => Promise<AuthenticatedUser>;
  credentialsStore?: CredentialStore;
  oauthProvider?: LocalOAuthProvider;
  createNomiClient?: (input: { apiKey: string; baseUrl: string }) => Pick<NomiApiClient, 'listNomis'>;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const env = options.env ?? getEnv();
  const defaultPublicEnv = options.env
    ? {
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
        APP_BASE_URL: env.APP_BASE_URL,
      }
    : getPublicEnv();
  const publicEnv = {
    ...defaultPublicEnv,
    ...options.publicEnv,
  };
  const authenticateUser = options.authenticateUser ?? authenticateBearerToken;
  const store = options.credentialsStore ?? new UserNomiCredentialsStore();
  const oauthProvider =
    options.oauthProvider ??
    new LocalOAuthProvider({
      env,
      authenticateUser,
    });
  const createNomiClient =
    options.createNomiClient ?? ((input: { apiKey: string; baseUrl: string }) => new NomiApiClient(input));

  app.use(express.json());
  app.use((req, res, next) => {
    if (req.method !== 'GET' || !env.APP_BASE_URL || !shouldRedirectToCanonicalHost(req.path)) {
      next();
      return;
    }

    const requestOrigin = getRequestOrigin(req, { APP_BASE_URL: undefined });
    if (isLocalOrigin(requestOrigin) || requestOrigin === env.APP_BASE_URL.replace(/\/$/, '')) {
      next();
      return;
    }

    res.redirect(307, new URL(req.originalUrl || req.url, env.APP_BASE_URL).href);
  });

  app.get('/', (_req, res) => {
    res.status(200).type('html').send(renderShell('home'));
  });

  app.get('/settings', (_req, res) => {
    res.status(200).type('html').send(renderShell('settings'));
  });

  app.get('/guides', (_req, res) => {
    res.status(200).type('html').send(renderShell('guides'));
  });

  app.get('/guides/:guide', (req, res) => {
    const guide = req.params.guide;
    if (!isGuideSlug(guide)) {
      res.status(404).type('html').send(renderShell('guides'));
      return;
    }

    res.status(200).type('html').send(renderShell('guides', guide));
  });

  app.get('/status', (_req, res) => {
    res.status(200).type('html').send(renderShell('status'));
  });

  app.get('/api/public-config', (_req, res) => {
    res.json({
      supabaseUrl: publicEnv.SUPABASE_URL,
      supabaseAnonKey: publicEnv.SUPABASE_ANON_KEY,
      appBaseUrl: publicEnv.APP_BASE_URL ?? null,
    });
  });

  app.get('/.well-known/oauth-protected-resource/api/mcp', (req, res) => {
    res.json(buildProtectedResourceMetadata(req, env));
  });

  app.get('/.well-known/oauth-authorization-server', (req, res) => {
    res.json(buildAuthorizationServerMetadata(req, env));
  });

  app.use('/authorize', (req, _res, next) => {
    logger.info('OAuth authorize start', {
      method: req.method,
      hasClientId: Boolean(req.query.client_id ?? req.body?.client_id),
      redirectUriHost: getHostFromUnknown(req.query.redirect_uri ?? req.body?.redirect_uri),
    });
    next();
  }, authorizationHandler({ provider: oauthProvider, rateLimit: false }));
  app.use('/token', (req, _res, next) => {
    logger.info('OAuth token exchange start', {
      method: req.method,
      grantType: req.body?.grant_type ?? null,
      hasClientId: Boolean(req.body?.client_id),
    });
    next();
  }, tokenHandler({ provider: oauthProvider, rateLimit: false }));
  app.use(
    '/register',
    (req, _res, next) => {
      logger.info('OAuth client registration start', {
        method: req.method,
        redirectUriCount: Array.isArray(req.body?.redirect_uris) ? req.body.redirect_uris.length : 0,
      });
      next();
    },
    clientRegistrationHandler({
      clientsStore: oauthProvider.clientsStore,
      rateLimit: false,
    })
  );

  app.get('/oauth/consent', (req, res) => {
    const authorizationId = typeof req.query.authorization_id === 'string' ? req.query.authorization_id : null;
    logger.info('OAuth consent page requested', {
      hasAuthorizationId: Boolean(authorizationId),
      path: req.path,
    });

    if (!authorizationId) {
      res.status(200).type('html').send(renderConsentPage({ authorizationId: null, error: 'Missing authorization request.' }));
      return;
    }

    try {
      const authorization = getAuthorizationSummary(authorizationId, env);
      res.status(200).type('html').send(
        renderConsentPage({
          authorizationId,
          redirectUri: authorization.redirectUri,
          resource: authorization.resource,
          scopes: authorization.scopes,
          clientId: authorization.clientId,
        })
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid authorization request.';
      res.status(200).type('html').send(renderConsentPage({ authorizationId: null, error: message }));
    }
  });

  app.post('/oauth/consent', async (req, res) => {
    try {
      const authorizationId = typeof req.body?.authorizationId === 'string' ? req.body.authorizationId : '';
      const decision = req.body?.decision === 'deny' ? 'deny' : req.body?.decision === 'approve' ? 'approve' : null;

      if (!authorizationId || !decision) {
        throw new ValidationError('authorizationId and a valid decision are required.');
      }

      let accessToken: string | undefined;
      if (decision === 'approve') {
        const user = await authenticateUser(req.headers.authorization);
        accessToken = user.accessToken;
      }

      const redirectUrl = buildConsentRedirect({
        authorizationId,
        decision,
        accessToken,
        refreshToken: typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined,
        env,
      });

      logger.info('OAuth consent decision recorded', {
        decision,
        redirectHost: new URL(redirectUrl).host,
        hasRefreshToken: typeof req.body?.refreshToken === 'string' && req.body.refreshToken.length > 0,
      });

      res.json({ redirectUrl });
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.get('/api/me/nomi-key/status', async (req, res) => {
    try {
      const user = await authenticateUser(req.headers.authorization);
      const status = await store.getStatus(user.id);
      res.json(status);
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.put('/api/me/nomi-key', async (req, res) => {
    try {
      const user = await authenticateUser(req.headers.authorization);
      const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey.trim() : '';
      if (!apiKey) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'apiKey is required.' } });
        return;
      }

      const client = createNomiClient({
        apiKey,
        baseUrl: env.NOMI_API_BASE_URL,
      });
      await client.listNomis();

      const status = await store.upsertApiKey(user.id, apiKey);
      res.json(status);
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.delete('/api/me/nomi-key', async (req, res) => {
    try {
      const user = await authenticateUser(req.headers.authorization);
      await store.deleteApiKey(user.id);
      res.status(204).end();
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.all('/api/mcp', async (req, res) => {
    await handleMcpRequest(req, res, req.body);
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}

function shouldRedirectToCanonicalHost(path: string): boolean {
  return path === '/' || path === '/settings' || path.startsWith('/guides') || path === '/status' || path === '/oauth/consent';
}

function isLocalOrigin(origin: string): boolean {
  return origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1');
}

function sendRouteError(res: express.Response, error: unknown) {
  if (error instanceof Error) {
    logger.warn('Route error', { error: error.message });
  }

  if (typeof (error as { statusCode?: unknown })?.statusCode === 'number') {
    const typedError = error as { statusCode: number; code?: string; message?: string };
    res.status(typedError.statusCode).json({
      error: {
        code: typedError.code ?? 'ERROR',
        message: typedError.message ?? 'Unexpected error.',
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error.',
    },
  });
}

function getHostFromUnknown(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

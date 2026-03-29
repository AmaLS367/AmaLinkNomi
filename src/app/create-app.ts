import express from 'express';
import { getPublicEnv, getEnv } from '../config/env';
import { authenticateBearerToken, type AuthenticatedUser } from '../auth/token-auth';
import { buildAuthorizationServerMetadata, buildProtectedResourceMetadata } from '../auth/oauth-metadata';
import { logger } from '../shared/logger';
import { UserNomiCredentialsStore } from '../storage/user-nomi-credentials-store';
import { NomiApiClient } from '../nomi/nomi-client';
import { renderShell } from '../ui/render-shell';
import { handleMcpRequest } from '../adapters/vercel/handler';

export function createApp() {
  const app = express();
  const env = getEnv();
  const store = new UserNomiCredentialsStore();

  app.use(express.json());

  app.get('/', (_req, res) => {
    res.status(200).type('html').send(renderShell('home'));
  });

  app.get('/settings', (_req, res) => {
    res.status(200).type('html').send(renderShell('settings'));
  });

  app.get('/status', (_req, res) => {
    res.status(200).type('html').send(renderShell('status'));
  });

  app.get('/api/public-config', (_req, res) => {
    const publicEnv = getPublicEnv();
    res.json({
      supabaseUrl: publicEnv.SUPABASE_URL,
      supabaseAnonKey: publicEnv.SUPABASE_ANON_KEY,
    });
  });

  app.get('/.well-known/oauth-protected-resource/api/mcp', (req, res) => {
    res.json(buildProtectedResourceMetadata(req));
  });

  app.get('/.well-known/oauth-authorization-server', (_req, res) => {
    res.json(buildAuthorizationServerMetadata());
  });

  app.get('/api/me/nomi-key/status', async (req, res) => {
    try {
      const user = await authenticateHttpRequest(req.headers.authorization);
      const status = await store.getStatus(user.id);
      res.json(status);
    } catch (error) {
      sendRouteError(res, error);
    }
  });

  app.put('/api/me/nomi-key', async (req, res) => {
    try {
      const user = await authenticateHttpRequest(req.headers.authorization);
      const apiKey = typeof req.body?.apiKey === 'string' ? req.body.apiKey.trim() : '';
      if (!apiKey) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'apiKey is required.' } });
        return;
      }

      const client = new NomiApiClient({
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
      const user = await authenticateHttpRequest(req.headers.authorization);
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

async function authenticateHttpRequest(authorizationHeader?: string | null): Promise<AuthenticatedUser> {
  return authenticateBearerToken(authorizationHeader);
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

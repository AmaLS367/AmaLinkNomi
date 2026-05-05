import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { once } from 'node:events';
import type { AppEnv } from '../src/config/env';
import { createApp } from '../src/app/create-app';
import { renderShell } from '../src/ui/render-shell';

const fakeAccessToken = buildJwt({
  sub: 'user-123',
  email: 'tester@example.com',
  exp: Math.floor(Date.now() / 1000) + 3600,
});

const fakeEnv: AppEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  NOMI_API_BASE_URL: 'https://api.nomi.ai',
  NOMI_API_KEY: '7f9c3f69-385f-4a22-afe7-d7b50852cd06',
  APP_BASE_URL: 'https://ama-link-nomi.vercel.app',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  SUPABASE_JWT_ISSUER: 'https://example.supabase.co/auth/v1',
  SUPABASE_JWKS_URL: 'https://example.supabase.co/auth/v1/.well-known/jwks.json',
  SUPABASE_JWT_AUDIENCE: 'authenticated',
  NOMI_KEY_ENCRYPTION_KEY: 'test-encryption-key',
};

test('authorization server metadata uses same-origin OAuth endpoints without real env secrets', async () => {
  const ctx = await startAppServer();

  try {
    const response = await fetch(`${ctx.origin}/.well-known/oauth-authorization-server`);
    assert.equal(response.status, 200);

    const payload = await response.json();
    assert.equal(payload.issuer, ctx.origin);
    assert.equal(payload.authorization_endpoint, `${ctx.origin}/authorize`);
    assert.equal(payload.token_endpoint, `${ctx.origin}/token`);
    assert.equal(payload.registration_endpoint, `${ctx.origin}/register`);
  } finally {
    await ctx.close();
  }
});

test('oauth consent page bootstraps PKCE callback exchange and Google sign-in', async () => {
  const ctx = await startAppServer();

  try {
    const response = await fetch(`${ctx.origin}/oauth/consent?authorization_id=test-flow`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/i);

    const html = await response.text();
    assert.match(html, /exchangeCodeForSession/);
    assert.match(html, /detectSessionInUrl:\s*false/);
    assert.match(html, /Continue with Google/);
    assert.match(html, /AmaNomiBridge/);
  } finally {
    await ctx.close();
  }
});

test('onboarding shell exposes Google login alongside magic links', () => {
  const html = renderShell('home');
  assert.match(html, /Continue with Google/);
  assert.match(html, /signInWithOAuth/);
  assert.match(html, /detectSessionInUrl:\s*false/);
});

test('guides shell exposes connector setup steps', () => {
  const html = renderShell('guides');
  assert.match(html, /data-view-link="guides"/);
  assert.match(html, /href="\/guides\/chatgpt"/);
  assert.match(html, /href="\/guides\/claude"/);
  assert.match(html, /href="\/guides\/nomi-key"/);
  assert.match(html, /href="\/guides\/system"/);
});

test('guide detail shell renders a single active guide panel', () => {
  const html = renderShell('guides', 'chatgpt');
  assert.match(html, /data-guide="chatgpt"/);
  assert.match(html, /id="guide-chatgpt" class="guide-panel "/);
  assert.match(html, /id="guides-index" class="guide-panel hidden"/);
  assert.match(html, /Connect AmaLink Nomi in ChatGPT/);
});

test('public config exposes the canonical app url and preview hosts redirect to it', async () => {
  const ctx = await startAppServer();

  try {
    const configResponse = await fetch(`${ctx.origin}/api/public-config`);
    assert.equal(configResponse.status, 200);
    const config = await configResponse.json();
    assert.equal(config.appBaseUrl, fakeEnv.APP_BASE_URL);

    const previewResponse = await fetch(`${ctx.origin}/settings?from=preview`, {
      headers: {
        'x-forwarded-host': 'ama-link-nomi-ifbd3ltk5-amas-projects-57827094.vercel.app',
        'x-forwarded-proto': 'https',
      },
      redirect: 'manual',
    });

    assert.equal(previewResponse.status, 307);
    assert.equal(
      previewResponse.headers.get('location'),
      'https://ama-link-nomi.vercel.app/settings?from=preview'
    );

    const guidesResponse = await fetch(`${ctx.origin}/guides`);
    assert.equal(guidesResponse.status, 200);
    assert.match(await guidesResponse.text(), /id="guides-view"/);

    const guideDetailResponse = await fetch(`${ctx.origin}/guides/chatgpt`);
    assert.equal(guideDetailResponse.status, 200);
    assert.match(await guideDetailResponse.text(), /data-guide="chatgpt"/);
  } finally {
    await ctx.close();
  }
});

test('local OAuth flow completes with stubbed authentication and returns tokens', async () => {
  const ctx = await startAppServer();

  try {
    const registrationResponse = await fetch(`${ctx.origin}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Claude',
        redirect_uris: ['https://claude.ai/api/mcp/auth_callback'],
        token_endpoint_auth_method: 'client_secret_post',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        scope: 'openid email profile',
      }),
    });

    assert.equal(registrationResponse.status, 201);
    const client = await registrationResponse.json();
    assert.equal(client.client_name, 'Claude');
    assert.equal(typeof client.client_id, 'string');
    assert.equal(typeof client.client_secret, 'string');

    const verifier = 'local-pkce-verifier';
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const authorizeUrl = new URL('/authorize', ctx.origin);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('client_id', client.client_id);
    authorizeUrl.searchParams.set('redirect_uri', 'https://claude.ai/api/mcp/auth_callback');
    authorizeUrl.searchParams.set('code_challenge', challenge);
    authorizeUrl.searchParams.set('code_challenge_method', 'S256');
    authorizeUrl.searchParams.set('scope', 'openid email profile');
    authorizeUrl.searchParams.set('state', 'test-state');
    authorizeUrl.searchParams.set('resource', `${ctx.origin}/api/mcp`);

    const authorizeResponse = await fetch(authorizeUrl, { redirect: 'manual' });
    assert.equal(authorizeResponse.status, 302);
    const consentLocation = authorizeResponse.headers.get('location');
    assert.ok(consentLocation);
    assert.match(consentLocation, /^\/oauth\/consent\?authorization_id=/);

    const consentUrl = new URL(consentLocation, ctx.origin);
    const authorizationId = consentUrl.searchParams.get('authorization_id');
    assert.ok(authorizationId);

    const consentPostResponse = await fetch(`${ctx.origin}/oauth/consent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fakeAccessToken}`,
      },
      body: JSON.stringify({
        authorizationId,
        decision: 'approve',
        refreshToken: 'refresh-token-123',
      }),
    });

    assert.equal(consentPostResponse.status, 200);
    const consentPayload = await consentPostResponse.json();
    const callbackUrl = new URL(consentPayload.redirectUrl);
    assert.equal(callbackUrl.origin, 'https://claude.ai');
    assert.equal(callbackUrl.pathname, '/api/mcp/auth_callback');
    assert.equal(callbackUrl.searchParams.get('state'), 'test-state');
    const authorizationCode = callbackUrl.searchParams.get('code');
    assert.ok(authorizationCode);

    const tokenResponse = await fetch(`${ctx.origin}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: client.client_id,
        client_secret: client.client_secret,
        code: authorizationCode,
        code_verifier: verifier,
        redirect_uri: 'https://claude.ai/api/mcp/auth_callback',
        resource: `${ctx.origin}/api/mcp`,
      }),
    });

    assert.equal(tokenResponse.status, 200);
    const tokenPayload = await tokenResponse.json();
    assert.equal(tokenPayload.access_token, fakeAccessToken);
    assert.equal(tokenPayload.refresh_token, 'refresh-token-123');
    assert.equal(tokenPayload.token_type, 'bearer');
    assert.equal(tokenPayload.scope, 'openid email profile');
  } finally {
    await ctx.close();
  }
});

async function startAppServer() {
  const server = createServer(
    createApp({
      env: fakeEnv,
      publicEnv: {
        SUPABASE_URL: fakeEnv.SUPABASE_URL,
        SUPABASE_ANON_KEY: fakeEnv.SUPABASE_ANON_KEY,
      },
      authenticateUser: async (authorizationHeader) => {
        if (authorizationHeader !== `Bearer ${fakeAccessToken}`) {
          throw new Error('Unexpected authorization header in test');
        }

        return {
          id: 'user-123',
          email: 'tester@example.com',
          accessToken: fakeAccessToken,
          claims: {
            sub: 'user-123',
            email: 'tester@example.com',
            exp: Math.floor(Date.now() / 1000) + 3600,
          },
        };
      },
      credentialsStore: {
        getStatus: async () => ({
          configured: false,
          last4: null,
          validatedAt: null,
          updatedAt: null,
        }),
        upsertApiKey: async () => ({
          configured: true,
          last4: 'cd06',
          validatedAt: new Date(0).toISOString(),
          updatedAt: new Date(0).toISOString(),
        }),
        deleteApiKey: async () => undefined,
      },
    })
  );
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const { port } = server.address() as AddressInfo;
  const origin = `http://127.0.0.1:${port}`;

  return {
    origin,
    close: () => closeServer(server),
  };
}

function closeServer(server: Server) {
  return new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

function buildJwt(payload: Record<string, unknown>) {
  return [
    Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url'),
    Buffer.from(JSON.stringify(payload)).toString('base64url'),
    'signature',
  ].join('.');
}

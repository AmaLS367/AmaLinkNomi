import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { once } from 'node:events';
import { createApp } from '../src/app/create-app';

test('authorization server metadata uses same-origin OAuth endpoints', async () => {
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

test('oauth consent page is publicly reachable', async () => {
  const ctx = await startAppServer();

  try {
    const response = await fetch(`${ctx.origin}/oauth/consent?authorization_id=test-flow`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/i);

    const html = await response.text();
    assert.match(html, /Consent|Approve|AmaNomiBridge/i);
  } finally {
    await ctx.close();
  }
});

async function startAppServer() {
  const server = createServer(createApp());
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

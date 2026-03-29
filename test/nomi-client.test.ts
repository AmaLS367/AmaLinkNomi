import test from 'node:test';
import assert from 'node:assert/strict';
import { NomiApiClient } from '../src/nomi/nomi-client';

test('NomiApiClient sends raw API key in Authorization header', async () => {
  const calls: Array<{ url: string; init?: RequestInit }> = [];

  const originalFetch = global.fetch;
  global.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(input), init });

    return new Response(JSON.stringify({ nomis: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;

  try {
    const client = new NomiApiClient({
      apiKey: 'nomi-user-key',
      baseUrl: 'https://api.nomi.ai',
    });

    await client.listNomis();

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.init?.headers && (calls[0].init.headers as Record<string, string>).Authorization, 'nomi-user-key');
  } finally {
    global.fetch = originalFetch;
  }
});

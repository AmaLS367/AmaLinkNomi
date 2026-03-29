import test from 'node:test';
import assert from 'node:assert/strict';
import { getMcpAuthRequirement } from '../src/auth/mcp-auth';

test('initialize stays public', () => {
  const result = getMcpAuthRequirement({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {},
  });

  assert.equal(result, 'public');
});

test('tools/list stays public', () => {
  const result = getMcpAuthRequirement({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  });

  assert.equal(result, 'public');
});

test('tools/call requires authentication', () => {
  const result = getMcpAuthRequirement({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'list_nomis',
      arguments: {},
    },
  });

  assert.equal(result, 'authenticated');
});

export type McpAuthRequirement = 'public' | 'authenticated';

const PUBLIC_METHODS = new Set([
  'initialize',
  'notifications/initialized',
  'tools/list',
  'ping',
]);

export function getMcpAuthRequirement(body: unknown): McpAuthRequirement {
  const messages = Array.isArray(body) ? body : [body];

  for (const message of messages) {
    const method = extractMethod(message);
    if (method === 'tools/call') {
      return 'authenticated';
    }

    if (method && !PUBLIC_METHODS.has(method)) {
      return 'public';
    }
  }

  return 'public';
}

function extractMethod(message: unknown): string | null {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const candidate = (message as { method?: unknown }).method;
  return typeof candidate === 'string' ? candidate : null;
}

import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { AppRuntime } from '../app/runtime';
import { logger } from '../shared/logger';

export function listNomisHandler(runtime: AppRuntime) {
  return async (): Promise<CallToolResult> => {
  logger.info('Tool: list_nomis');
  try {
    const nomiClient = await runtime.getNomiClient();
    const data = await nomiClient.listNomis();
    logger.info('Tool: list_nomis success', { count: data.nomis.length });
    return { content: [{ type: 'text', text: JSON.stringify(data.nomis, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Tool: list_nomis failed', { error: message });
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
  };
}

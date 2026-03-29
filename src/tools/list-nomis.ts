import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { nomiClient } from '../nomi/nomi-client';
import { logger } from '../shared/logger';

export async function listNomisHandler(): Promise<CallToolResult> {
  logger.info('Tool: list_nomis');
  try {
    const data = await nomiClient.listNomis();
    logger.info('Tool: list_nomis success', { count: data.nomis.length });
    return { content: [{ type: 'text', text: JSON.stringify(data.nomis, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Tool: list_nomis failed', { error: message });
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
}

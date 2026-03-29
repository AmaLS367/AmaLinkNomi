import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { AppRuntime } from '../app/runtime';
import { logger } from '../shared/logger';

export function getNomiHandler(runtime: AppRuntime) {
  return async (args: { nomi_id: string }): Promise<CallToolResult> => {
    logger.info('Tool: get_nomi', { nomi_id: args.nomi_id });
    try {
      const nomiClient = await runtime.getNomiClient();
      const nomi = await nomiClient.getNomi(args.nomi_id);
      logger.info('Tool: get_nomi success', { nomi_id: args.nomi_id });
      return { content: [{ type: 'text', text: JSON.stringify(nomi, null, 2) }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Tool: get_nomi failed', { nomi_id: args.nomi_id, error: message });
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  };
}

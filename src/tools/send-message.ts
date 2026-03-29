import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { AppRuntime } from '../app/runtime';
import { logger } from '../shared/logger';

export function sendMessageHandler(runtime: AppRuntime) {
  return async (args: { nomi_id: string; message: string }): Promise<CallToolResult> => {
    logger.info('Tool: send_message', { nomi_id: args.nomi_id, message_length: args.message.length });
    try {
      const nomiClient = await runtime.getNomiClient();
      const result = await nomiClient.sendMessage(args.nomi_id, args.message);
      logger.info('Tool: send_message success', { nomi_id: args.nomi_id });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Tool: send_message failed', { nomi_id: args.nomi_id, error: message });
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  };
}

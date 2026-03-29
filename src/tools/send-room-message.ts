import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { nomiClient } from '../nomi/nomi-client';
import { logger } from '../shared/logger';

export async function sendRoomMessageHandler(args: { room_id: string; message: string }): Promise<CallToolResult> {
  logger.info('Tool: send_room_message', { room_id: args.room_id, message_length: args.message.length });
  try {
    const result = await nomiClient.sendRoomMessage(args.room_id, args.message);
    logger.info('Tool: send_room_message success', { room_id: args.room_id });
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Tool: send_room_message failed', { room_id: args.room_id, error: message });
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
}

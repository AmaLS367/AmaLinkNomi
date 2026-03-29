import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { nomiClient } from '../nomi/nomi-client';
import { logger } from '../shared/logger';

export async function listRoomsHandler(): Promise<CallToolResult> {
  logger.info('Tool: list_rooms');
  try {
    const data = await nomiClient.listRooms();
    logger.info('Tool: list_rooms success', { count: data.rooms.length });
    return { content: [{ type: 'text', text: JSON.stringify(data.rooms, null, 2) }] };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Tool: list_rooms failed', { error: message });
    return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
  }
}

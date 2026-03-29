import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { AppRuntime } from '../app/runtime';
import { logger } from '../shared/logger';

export function listRoomsHandler(runtime: AppRuntime) {
  return async (): Promise<CallToolResult> => {
    logger.info('Tool: list_rooms');
    try {
      const nomiClient = await runtime.getNomiClient();
      const data = await nomiClient.listRooms();
      logger.info('Tool: list_rooms success', { count: data.rooms.length });
      return { content: [{ type: 'text', text: JSON.stringify(data.rooms, null, 2) }] };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      logger.error('Tool: list_rooms failed', { error: message });
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  };
}

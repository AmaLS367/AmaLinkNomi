import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppRuntime } from '../app/runtime';
import { listNomisHandler } from './list-nomis';
import { getNomiHandler } from './get-nomi';
import { sendMessageHandler } from './send-message';
import { listRoomsHandler } from './list-rooms';
import { sendRoomMessageHandler } from './send-room-message';

export function registerAllTools(server: McpServer, runtime: AppRuntime): void {
  server.registerTool(
    'list_nomis',
    {
      description: 'List all Nomi characters associated with your account',
      annotations: { readOnlyHint: true },
    },
    listNomisHandler(runtime)
  );

  server.registerTool(
    'get_nomi',
    {
      description: 'Get details for a specific Nomi by ID',
      inputSchema: { nomi_id: z.string().min(1, 'nomi_id is required') },
      annotations: { readOnlyHint: true },
    },
    getNomiHandler(runtime)
  );

  server.registerTool(
    'send_message',
    {
      description: 'Send a message to a Nomi and receive their reply',
      inputSchema: {
        nomi_id: z.string().min(1, 'nomi_id is required'),
        message: z.string().min(1, 'message cannot be empty').max(800, 'message exceeds 800 character limit'),
      },
    },
    sendMessageHandler(runtime)
  );

  server.registerTool(
    'list_rooms',
    {
      description: 'List all rooms associated with your account',
      annotations: { readOnlyHint: true },
    },
    listRoomsHandler(runtime)
  );

  server.registerTool(
    'send_room_message',
    {
      description: 'Send a message in a specific room',
      inputSchema: {
        room_id: z.string().min(1, 'room_id is required'),
        message: z.string().min(1, 'message cannot be empty').max(800, 'message exceeds 800 character limit'),
      },
    },
    sendRoomMessageHandler(runtime)
  );
}

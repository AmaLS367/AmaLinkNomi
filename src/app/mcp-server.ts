import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { AppRuntime } from './runtime';
import { registerAllTools } from '../tools/index';

export function createMcpServer(runtime: AppRuntime): McpServer {
  const server = new McpServer({
    name: 'AmaNomiBridge',
    version: '1.0.0',
  });
  registerAllTools(server, runtime);
  return server;
}

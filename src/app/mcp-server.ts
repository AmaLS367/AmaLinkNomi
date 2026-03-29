import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerAllTools } from '../tools/index';

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'AmaNomiBridge',
    version: '1.0.0',
  });
  registerAllTools(server);
  return server;
}

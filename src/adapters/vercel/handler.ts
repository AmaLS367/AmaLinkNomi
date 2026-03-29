import { IncomingMessage, ServerResponse } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { authenticateRequest } from '../../auth/authenticate-request';
import { createMcpServer } from '../../app/mcp-server';
import { AppError } from '../../shared/errors';
import { sendError } from '../../shared/http';
import { logger } from '../../shared/logger';

export async function handleMcpRequest(
  req: IncomingMessage,
  res: ServerResponse,
  parsedBody: unknown
): Promise<void> {
  logger.info('Incoming MCP request', { method: req.method, url: req.url });

  try {
    const authHeader = req.headers['authorization'] as string | undefined;
    const apiKeyHeader = req.headers['x-api-key'] as string | undefined;
    authenticateRequest(authHeader, apiKeyHeader);

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const mcpServer = createMcpServer();
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, parsedBody);
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 401) {
      logger.warn('Authentication failed');
    } else {
      logger.error('Request handling error', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    sendError(res, err);
  }
}

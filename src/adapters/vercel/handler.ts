import { IncomingMessage, ServerResponse } from 'http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { getMcpAuthRequirement } from '../../auth/mcp-auth';
import { buildWwwAuthenticateHeader } from '../../auth/oauth-metadata';
import { authenticateBearerToken } from '../../auth/token-auth';
import { createAppRuntime } from '../../app/runtime';
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
    const authRequirement = getMcpAuthRequirement(parsedBody);
    const authUser =
      authRequirement === 'authenticated'
        ? await authenticateBearerToken(req.headers['authorization'] as string | undefined)
        : null;

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const mcpServer = createMcpServer(createAppRuntime(authUser));
    await mcpServer.connect(transport);
    await transport.handleRequest(req, res, parsedBody);
  } catch (err) {
    if (err instanceof AppError && err.statusCode === 401) {
      res.setHeader('WWW-Authenticate', buildWwwAuthenticateHeader(req));
      logger.warn('Authentication failed');
    } else {
      logger.error('Request handling error', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
    sendError(res, err);
  }
}

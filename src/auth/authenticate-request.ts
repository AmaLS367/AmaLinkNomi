import { env } from '../config/env';
import { AppError } from '../shared/errors';

/**
 * Validates incoming authentication token (Bearer or X-API-Key)
 */
export function authenticateRequest(authHeader?: string | null, xApiKeyHeader?: string | null): void {
  const token = xApiKeyHeader || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (!token) {
    throw new AppError('Authentication required. Missing Bearer token or X-API-Key.', 'UNAUTHORIZED', 401);
  }

  if (token !== env.MCP_AUTH_TOKEN) {
    throw new AppError('Invalid authentication token.', 'UNAUTHORIZED', 401);
  }
}

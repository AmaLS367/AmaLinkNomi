import { ServerResponse } from 'http';
import { AppError } from './errors';
import { logger } from './logger';

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(payload);
}

export function sendError(res: ServerResponse, err: unknown): void {
  if (res.headersSent) return;

  if (err instanceof AppError) {
    sendJson(res, err.statusCode, { error: { code: err.code, message: err.message } });
  } else {
    logger.error('Unexpected error', { error: err instanceof Error ? err.message : String(err) });
    sendJson(res, 500, { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  }
}

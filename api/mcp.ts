import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleMcpRequest } from '../src/adapters/vercel/handler';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await handleMcpRequest(req, res, req.body);
}

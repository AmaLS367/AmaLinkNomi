import express from 'express';
import { env } from '../config/env';
import { handleMcpRequest } from '../adapters/vercel/handler';
import { logger } from '../shared/logger';

const app = express();
app.use(express.json());

app.post('/api/mcp', async (req, res) => {
  await handleMcpRequest(req, res, req.body);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const port = parseInt(env.PORT, 10);
app.listen(port, () => {
  logger.info(`AmaNomiBridge running`, { port, env: env.NODE_ENV });
});

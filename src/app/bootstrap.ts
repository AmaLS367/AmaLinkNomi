import { getEnv } from '../config/env';
import { createApp } from './create-app';
import { logger } from '../shared/logger';

const app = createApp();
const port = parseInt(getEnv().PORT, 10);
app.listen(port, () => {
  logger.info(`AmaNomiBridge running`, { port, env: getEnv().NODE_ENV });
});

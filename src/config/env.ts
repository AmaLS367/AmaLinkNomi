import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NOMI_API_KEY: z.string().min(1, 'NOMI_API_KEY is required'),
  MCP_AUTH_TOKEN: z.string().min(1, 'MCP_AUTH_TOKEN is required'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NOMI_API_BASE_URL: z.string().default('https://api.nomi.ai'),
  PORT: z.string().default('3000'),
});

export const env = envSchema.parse(process.env);

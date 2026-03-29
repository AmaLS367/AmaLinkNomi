import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  NOMI_API_BASE_URL: z.string().url().default('https://api.nomi.ai'),
  NOMI_API_KEY: z.string().min(1).optional(),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  SUPABASE_JWT_ISSUER: z.string().url().optional(),
  SUPABASE_JWKS_URL: z.string().url().optional(),
  SUPABASE_JWT_AUDIENCE: z.string().default('authenticated'),
  NOMI_KEY_ENCRYPTION_KEY: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema> & {
  SUPABASE_JWT_ISSUER: string;
  SUPABASE_JWKS_URL: string;
};

let cachedEnv: AppEnv | null = null;

export function getEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.parse(process.env);
  const issuer = parsed.SUPABASE_JWT_ISSUER ?? `${parsed.SUPABASE_URL.replace(/\/$/, '')}/auth/v1`;
  const jwksUrl = parsed.SUPABASE_JWKS_URL ?? `${issuer.replace(/\/$/, '')}/.well-known/jwks.json`;

  cachedEnv = {
    ...parsed,
    SUPABASE_JWT_ISSUER: issuer,
    SUPABASE_JWKS_URL: jwksUrl,
  };

  return cachedEnv;
}

export function getPublicEnv(): Pick<AppEnv, 'SUPABASE_URL' | 'SUPABASE_ANON_KEY'> {
  const env = getEnv();

  return {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY,
  };
}

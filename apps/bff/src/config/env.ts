import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: process.env.BFF_ENV_PATH || '.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  CLERK_SECRET_KEY: z.string(),
  CLERK_PUBLISHABLE_KEY: z.string().optional(),
  DATABASE_URL: z.string(),
  ALLOWED_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export const isDev = env.NODE_ENV !== 'production';
export const corsOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim())
  : [];

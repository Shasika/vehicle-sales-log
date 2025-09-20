import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  MONGODB_URI: z.string().min(1, 'MongoDB URI is required'),
  NEXTAUTH_SECRET: z.string().min(32, 'NextAuth secret must be at least 32 characters'),
  NEXTAUTH_URL: z.string().url('Valid NextAuth URL is required'),
  UPLOAD_DIR: z.string().default('./public/uploads'),
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  APP_NAME: z.string().default('Vehicle Sales Log'),
  DEFAULT_TIMEZONE: z.string().default('UTC'),
});

function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment configuration');
  }
}

export const env = validateEnv();
export type Env = z.infer<typeof envSchema>;
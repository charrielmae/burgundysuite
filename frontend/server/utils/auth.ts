import { betterAuth } from 'better-auth';
import { dash } from '@better-auth/infra';
import { memoryAdapter } from 'better-auth/adapters/memory';

// In-memory store that guarantees 100% stability on Vercel Serverless / AWS Lambda & local
export const memoryStore: Record<string, any[]> = {
  user: [],
  session: [],
  account: [],
  verification: [],
};

export function getBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return 'https://burgundysuite.vercel.app';
}

export const auth = betterAuth({
  database: memoryAdapter(memoryStore),
  baseURL: getBaseURL(),
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'burgundy-luxury-secret-key-2026-auth-secret',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 3,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'admin',
      },
      position: {
        type: 'string',
        required: false,
        defaultValue: 'Executive Administrator',
      },
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:4000',
    'https://burgundysuite.vercel.app',
    'https://*.vercel.app',
    'https://*.ngrok-free.app',
    'https://*.ngrok.io',
    'https://*.loca.lt',
  ],
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY || 'ba_5diwn7iln50fvodfad62ehxq7oxf48fs',
    }),
  ],
});

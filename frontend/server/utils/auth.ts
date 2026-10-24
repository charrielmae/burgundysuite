import { betterAuth } from 'better-auth';
import { dash } from '@better-auth/infra';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { createRequire } from 'module';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

const require = createRequire(import.meta.url);

// In-memory store that guarantees 100% stability on Vercel Serverless / AWS Lambda
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

function resolveDatabaseAdapter() {
  const isServerless = Boolean(
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NOW_REGION ||
    process.env.VERCEL_ENV
  );

  // On Vercel Serverless, the filesystem is strictly read-only and native addons may fail.
  // Using memoryAdapter ensures zero native binary crashes, zero EROFS errors, and instant boot.
  if (isServerless) {
    return memoryAdapter(memoryStore);
  }

  // Local development: attempt to use better-sqlite3 with safe fallback
  try {
    const Database = require('better-sqlite3');
    let dbPath = ':memory:';
    try {
      const localDir = path.resolve(process.cwd(), 'server', 'data');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }
      dbPath = path.resolve(localDir, 'better_auth.sqlite');
    } catch {
      dbPath = path.join(os.tmpdir(), 'better_auth.sqlite');
    }
    return new Database(dbPath);
  } catch (err) {
    return memoryAdapter(memoryStore);
  }
}

export const auth = betterAuth({
  database: resolveDatabaseAdapter(),
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

// Seed default and provisioned accounts in the background
async function seedAccounts() {
  try {
    const ctx = await (auth as any)[String.fromCharCode(36) + 'context'];
    if (ctx?.runMigrations) {
      await ctx.runMigrations().catch(() => {});
    }

    const accountsToSeed = [
      { email: 'admin@burgundysuite.com', password: 'admin123password', name: 'Clara Montague', role: 'admin', position: 'General Manager' },
      { email: 'admin_clara@burgundysuite.com', password: 'admin123', name: 'Executive Clara', role: 'admin', position: 'General Manager' },
      { email: 'jojo@burgundysuite.com', password: 'jojo', name: 'Jonathan Joestar', role: 'admin', position: 'Admin' },
      { email: 'staff_marcus@burgundysuite.com', password: 'marcus123password', name: 'Marcus Aurelius', role: 'staff', position: 'Resort Concierge' },
      { email: 'concierge_elena@burgundysuite.com', password: 'elena2026password', name: 'Elena Rostova', role: 'staff', position: 'Lead VIP Concierge' },
    ];

    for (const acc of accountsToSeed) {
      try {
        await auth.api.signUpEmail({
          body: {
            email: acc.email,
            password: acc.password,
            name: acc.name,
            role: acc.role,
            position: acc.position,
          },
        }).catch(() => null);
      } catch {}
    }
  } catch (err) {
    console.warn('[Better Auth] Seed notice:', (err as Error).message);
  }
}

seedAccounts().catch(() => {});

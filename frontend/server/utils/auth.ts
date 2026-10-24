import { betterAuth } from 'better-auth';
import { dash } from '@better-auth/infra';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';

// Resolve database file path (persisted in server/data or data/)
const dbDir = path.resolve(process.cwd(), 'server', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.resolve(dbDir, 'better_auth.sqlite');

const sqlite = new Database(dbPath);

export const auth = betterAuth({
  database: sqlite,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || 'burgundy-luxury-secret-key-2026-auth-secret',
  emailAndPassword: {
    enabled: true,
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
    'http://localhost:4000',
    'https://*.ngrok-free.app',
    'https://*.ngrok.io',
    'https://*.loca.lt',
    'https://*.vercel.app',
  ],
  plugins: [
    dash({
      apiKey: process.env.BETTER_AUTH_API_KEY || 'ba_5diwn7iln50fvodfad62ehxq7oxf48fs',
    }),
  ],
});

// Auto-run schema migrations and seed initial executive accounts if not present
(async () => {
  try {
    const ctx = await (auth as any)[String.fromCharCode(36) + 'context'];
    if (ctx?.runMigrations) {
      await ctx.runMigrations();
    }

    // Seed default admin accounts if empty
    try {
      const existingUser = await auth.api.signInEmail({
        body: { email: 'admin@burgundysuite.com', password: 'admin123password' },
      }).catch(() => null);

      if (!existingUser) {
        await auth.api.signUpEmail({
          body: {
            email: 'admin@burgundysuite.com',
            password: 'admin123password',
            name: 'Clara Montague',
          },
        }).catch(() => null);

        await auth.api.signUpEmail({
          body: {
            email: 'admin_clara@burgundysuite.com',
            password: 'admin123',
            name: 'Executive Clara',
          },
        }).catch(() => null);
      }
    } catch {}
  } catch (err) {
    console.error('[Better Auth] Migration / Seed notice:', (err as Error).message);
  }
})();

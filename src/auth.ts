import NextAuth from 'next-auth';
import { D1Adapter, up } from '@auth/d1-adapter';
import { getD1Database } from '@/lib/cloudflare-d1';

// Resolve D1 database instance (native Cloudflare Worker binding or REST client adapter)
const db = getD1Database();

let migrated = false;

/**
 * Migration handler to ensure NextAuth tables exist in Cloudflare D1
 */
export async function migrationHandle(d1 = db) {
  if (!migrated) {
    try {
      await up(d1);
      migrated = true;
    } catch (e: any) {
      console.log('[Auth D1 Migration]:', e?.cause?.message || e?.message);
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [],
  adapter: D1Adapter(db),
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
});

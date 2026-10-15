import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { D1Adapter, up } from '@auth/d1-adapter';
import { getD1Database } from '@/lib/cloudflare-d1';
import { authenticateAdminWithCloudflare } from '@/lib/cloudflare-auth';

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
  adapter: D1Adapter(db),
  providers: [
    Credentials({
      name: 'Burgundy Admin & Staff Credentials',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'admin_clara' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await authenticateAdminWithCloudflare(
          String(credentials.username),
          String(credentials.password)
        );

        if (!user) {
          return null;
        }

        return {
          id: String(user.user_id),
          name: `${user.first_name} ${user.last_name}`,
          email: `${user.user_name}@burgundysuite.com`,
          role: user.user_role,
          position: user.position,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.position = (user as any).position;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = token.role;
        (session.user as any).position = token.position;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});

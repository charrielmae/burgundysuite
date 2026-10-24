import { createAuthClient } from 'better-auth/vue';
import { sentinelClient } from '@better-auth/infra/client';

const getClientBaseURL = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return 'https://burgundysuite.vercel.app';
};

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [
    sentinelClient({
      autoSolveChallenge: true,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

import { createAuthClient } from 'better-auth/vue';
import { sentinelClient } from '@better-auth/infra/client';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  plugins: [
    sentinelClient({
      autoSolveChallenge: true,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;

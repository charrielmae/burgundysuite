import { authClient } from '../lib/auth-client';

export interface AdminUser {
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'staff';
  first_name: string;
  last_name: string;
  position: string;
  contact_number: string;
  email?: string;
}

export function useAuth() {
  const adminUser = useState<AdminUser | null>('auth_admin_user', () => null);
  const isAuthenticated = useState<boolean>('auth_is_authenticated', () => false);
  const isLoading = useState<boolean>('auth_is_loading', () => true);
  const { request } = useApi();

  const fetchSession = async () => {
    isLoading.value = true;
    try {
      // 1. Optimistic session restoration from localStorage for instant loading
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('burgundy_admin_user');
        const cachedToken = localStorage.getItem('burgundy_admin_token');
        if (cachedUser && cachedToken) {
          try {
            adminUser.value = JSON.parse(cachedUser);
            isAuthenticated.value = true;
          } catch {}
        }
      }

      // 2. Check Better Auth active session
      try {
        const baSession = await authClient.getSession();
        if (baSession?.data?.user) {
          const u = baSession.data.user as any;
          const mappedUser: AdminUser = {
            user_id: 1,
            user_name: u.name || u.email?.split('@')[0] || 'admin',
            user_role: u.role || 'admin',
            first_name: u.name?.split(' ')[0] || 'Executive',
            last_name: u.name?.split(' ').slice(1).join(' ') || 'Admin',
            position: u.position || 'General Manager',
            contact_number: '+63 917 555 8822',
            email: u.email,
          };
          adminUser.value = mappedUser;
          isAuthenticated.value = true;
          if (typeof window !== 'undefined') {
            localStorage.setItem('burgundy_admin_user', JSON.stringify(mappedUser));
            if (baSession.data.session?.token) {
              localStorage.setItem('burgundy_admin_token', baSession.data.session.token);
            }
          }
          return;
        }
      } catch (baErr) {
        // Better Auth session check failed, fall through to custom session check
      }

      // 3. Fallback: Custom session API (/api/auth/me)
      const res = await request<{ success: boolean; authenticated: boolean; data: AdminUser | null; token?: string }>(
        '/api/auth/me'
      );
      if (res && res.authenticated && res.data) {
        adminUser.value = res.data;
        isAuthenticated.value = true;
        if (typeof window !== 'undefined') {
          if (res.token) localStorage.setItem('burgundy_admin_token', res.token);
          localStorage.setItem('burgundy_admin_user', JSON.stringify(res.data));
        }
      } else {
        if (typeof window !== 'undefined' && !localStorage.getItem('burgundy_admin_token')) {
          adminUser.value = null;
          isAuthenticated.value = false;
        }
      }
    } catch (err) {
      if (typeof window !== 'undefined' && !localStorage.getItem('burgundy_admin_token')) {
        adminUser.value = null;
        isAuthenticated.value = false;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (identifier: string, password: string, turnstileToken?: string) => {
    isLoading.value = true;
    try {
      const cleanIdentifier = identifier.trim();
      const email = cleanIdentifier.includes('@')
        ? cleanIdentifier
        : `${cleanIdentifier.toLowerCase()}@burgundysuite.com`;

      // 1. Primary: Direct Auth API (/api/auth/login) - validates against live Cloudflare D1 database & staff accounts
      try {
        const res = await request<{ success: boolean; data: AdminUser; token?: string; message: string }>(
          '/api/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({ username: cleanIdentifier, password, turnstileToken }),
          }
        );

        if (res?.success && res?.data) {
          if (typeof window !== 'undefined') {
            if (res.token) {
              localStorage.setItem('burgundy_admin_token', res.token);
            }
            localStorage.setItem('burgundy_admin_user', JSON.stringify(res.data));
          }
          adminUser.value = res.data;
          isAuthenticated.value = true;
          return { success: true, user: res.data };
        }
      } catch (loginErr: any) {
        // If 401 Unauthorized, we know credentials were rejected by D1/server
        if (loginErr?.statusCode === 401 || loginErr?.message?.includes('Invalid credentials')) {
          return { success: false, error: 'Invalid credentials. Please verify your username and password.' };
        }
      }

      // 2. Fallback: Better Auth Sentinel client signIn
      try {
        const baRes = await authClient.signIn.email({
          email,
          password,
        });

        if (baRes?.data?.user) {
          const u = baRes.data.user as any;
          const mappedUser: AdminUser = {
            user_id: 1,
            user_name: u.name || cleanIdentifier,
            user_role: u.role || 'admin',
            first_name: u.name?.split(' ')[0] || cleanIdentifier,
            last_name: u.name?.split(' ').slice(1).join(' ') || 'Executive',
            position: u.position || 'Executive Management',
            contact_number: '+63 917 555 8822',
            email: u.email,
          };

          if (typeof window !== 'undefined') {
            const token = (baRes.data as any)?.token || (baRes.data as any)?.session?.token;
            if (token) {
              localStorage.setItem('burgundy_admin_token', token);
            }
            localStorage.setItem('burgundy_admin_user', JSON.stringify(mappedUser));
          }
          adminUser.value = mappedUser;
          isAuthenticated.value = true;
          return { success: true, user: mappedUser };
        }
      } catch (baErr) {}

      return { success: false, error: 'Authentication failed. Please verify credentials.' };
    } catch (err) {
      return { success: false, error: (err as Error).message || 'Authentication error.' };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await Promise.allSettled([
        authClient.signOut(),
        request('/api/auth/logout', { method: 'POST' }).catch(() => null),
      ]);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('burgundy_admin_token');
        localStorage.removeItem('burgundy_admin_user');
      }
      adminUser.value = null;
      isAuthenticated.value = false;
    }
  };

  return {
    adminUser,
    isAuthenticated,
    isLoading,
    fetchSession,
    login,
    logout,
    authClient,
  };
}

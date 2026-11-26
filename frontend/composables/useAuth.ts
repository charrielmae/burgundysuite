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

  const getStorageKeys = (portal?: 'admin' | 'staff') => {
    const scope = portal === 'staff' ? 'staff' : 'admin';
    return {
      userKey: `burgundy_${scope}_user`,
      tokenKey: `burgundy_${scope}_token`,
    };
  };

  const fetchSession = async (expectedRole?: 'admin' | 'staff') => {
    isLoading.value = true;
    const { userKey, tokenKey } = getStorageKeys(expectedRole);

    try {
      // 1. Optimistic session restoration from portal-scoped localStorage
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem(userKey);
        const cachedToken = localStorage.getItem(tokenKey);
        if (cachedUser && cachedToken) {
          try {
            const parsed = JSON.parse(cachedUser);
            if (!expectedRole || parsed?.user_role === expectedRole) {
              adminUser.value = parsed;
              isAuthenticated.value = true;
              localStorage.setItem('burgundy_admin_token', cachedToken);
            } else {
              adminUser.value = null;
              isAuthenticated.value = false;
            }
          } catch {}
        } else {
          adminUser.value = null;
          isAuthenticated.value = false;
        }
      }

      // 2. Check Custom Session API (/api/auth/me)
      const activeToken =
        typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
      const res = await request<{ success: boolean; authenticated: boolean; data: AdminUser | null; token?: string }>(
        '/api/auth/me',
        activeToken ? { headers: { Authorization: `Bearer ${activeToken}`, 'X-Admin-Token': activeToken } } : {}
      );

      if (res && res.authenticated && res.data) {
        if (expectedRole && res.data.user_role !== expectedRole) {
          adminUser.value = null;
          isAuthenticated.value = false;
          return;
        }
        adminUser.value = res.data;
        isAuthenticated.value = true;
        if (typeof window !== 'undefined') {
          if (res.token) {
            localStorage.setItem(tokenKey, res.token);
            localStorage.setItem('burgundy_admin_token', res.token);
          }
          localStorage.setItem(userKey, JSON.stringify(res.data));
        }
        return;
      }

      // 3. Fallback: Better Auth active session (strictly checked against expectedRole)
      try {
        const baSession = await authClient.getSession();
        if (baSession?.data?.user) {
          const u = baSession.data.user as any;
          const role: 'admin' | 'staff' = u.role === 'staff' ? 'staff' : 'admin';
          if (expectedRole && role !== expectedRole) {
            return;
          }
          const mappedUser: AdminUser = {
            user_id: 1,
            user_name: u.name || u.email?.split('@')[0] || 'admin',
            user_role: role,
            first_name: u.name?.split(' ')[0] || 'Executive',
            last_name: u.name?.split(' ').slice(1).join(' ') || 'Admin',
            position: u.position || 'General Manager',
            contact_number: '+63 917 555 8822',
            email: u.email,
          };
          adminUser.value = mappedUser;
          isAuthenticated.value = true;
          if (typeof window !== 'undefined') {
            localStorage.setItem(userKey, JSON.stringify(mappedUser));
            if (baSession.data.session?.token) {
              localStorage.setItem(tokenKey, baSession.data.session.token);
              localStorage.setItem('burgundy_admin_token', baSession.data.session.token);
            }
          }
          return;
        }
      } catch {}

      if (typeof window !== 'undefined' && !localStorage.getItem(tokenKey)) {
        adminUser.value = null;
        isAuthenticated.value = false;
      }
    } catch {
      if (typeof window !== 'undefined' && !localStorage.getItem(tokenKey)) {
        adminUser.value = null;
        isAuthenticated.value = false;
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Note: login() intentionally does NOT toggle page-level isLoading so that
  // AdminLoginGate / StaffLoginGate stays mounted and displays validation errors.
  const login = async (
    identifier: string,
    password: string,
    turnstileToken?: string,
    portal?: 'admin' | 'staff'
  ) => {
    try {
      const cleanIdentifier = identifier.trim();
      const { userKey, tokenKey } = getStorageKeys(portal);

      const res = await request<{ success: boolean; data: AdminUser; token?: string; message: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username: cleanIdentifier, password, turnstileToken, portal }),
        }
      );

      if (res?.success && res?.data) {
        if (typeof window !== 'undefined') {
          if (res.token) {
            localStorage.setItem(tokenKey, res.token);
            localStorage.setItem('burgundy_admin_token', res.token);
          }
          localStorage.setItem(userKey, JSON.stringify(res.data));
        }
        adminUser.value = res.data;
        isAuthenticated.value = true;
        return { success: true, user: res.data };
      }

      return { success: false, error: 'Authentication failed. Please verify credentials.' };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Invalid credentials. Please verify your username and password.',
      };
    }
  };

  const logout = async (portal?: 'admin' | 'staff') => {
    const scope = portal || (adminUser.value?.user_role === 'staff' ? 'staff' : 'admin');
    const { userKey, tokenKey } = getStorageKeys(scope);
    try {
      await Promise.allSettled([
        authClient.signOut(),
        request('/api/auth/logout', { method: 'POST' }).catch(() => null),
      ]);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(tokenKey);
        localStorage.removeItem(userKey);
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

export interface AdminUser {
  user_id: number;
  user_name: string;
  user_role: 'admin' | 'staff';
  first_name: string;
  last_name: string;
  position: string;
  contact_number: string;
}

export function useAuth() {
  const adminUser = useState<AdminUser | null>('auth_admin_user', () => null);
  const isAuthenticated = useState<boolean>('auth_is_authenticated', () => false);
  const isLoading = useState<boolean>('auth_is_loading', () => true);
  const { request } = useApi();

  const fetchSession = async () => {
    isLoading.value = true;
    try {
      // Optimistic session restoration from localStorage for instant loading
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
        // Only clear if server says unauthenticated and no valid token stored
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

  const login = async (username: string, password: string, turnstileToken?: string) => {
    isLoading.value = true;
    try {
      const res = await request<{ success: boolean; data: AdminUser; token?: string; message: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username, password, turnstileToken }),
        }
      );
      if (res.success && res.data) {
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
      return { success: false, error: 'Authentication failed' };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
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
  };
}

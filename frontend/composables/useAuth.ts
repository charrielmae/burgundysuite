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
      const res = await request<{ success: boolean; authenticated: boolean; data: AdminUser | null }>(
        '/api/auth/me'
      );
      if (res && res.authenticated && res.data) {
        adminUser.value = res.data;
        isAuthenticated.value = true;
      } else {
        adminUser.value = null;
        isAuthenticated.value = false;
      }
    } catch {
      adminUser.value = null;
      isAuthenticated.value = false;
    } finally {
      isLoading.value = false;
    }
  };

  const login = async (username: string, password: string, turnstileToken?: string) => {
    isLoading.value = true;
    try {
      const res = await request<{ success: boolean; data: AdminUser; message: string }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ username, password, turnstileToken }),
        }
      );
      if (res.success && res.data) {
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

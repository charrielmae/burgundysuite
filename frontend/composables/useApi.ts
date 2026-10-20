export function useApi() {
  const config = useRuntimeConfig();

  const request = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // If endpoint starts with /, prefix with nitro proxy or base
    const url = endpoint.startsWith('http')
      ? endpoint
      : endpoint.startsWith('/api')
      ? endpoint
      : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    // Attach admin token from localStorage if available (supports cookie-less / serverless proxies)
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('burgundy_admin_token');
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
          headers.set('X-Admin-Token', token);
        }
      } catch {}
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures HTTP-only session cookies are sent
    });

    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text || `HTTP ${response.status}: ${response.statusText}` };
    }

    if (!response.ok) {
      throw new Error(data.message || data.error || data.statusMessage || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data as T;
  };

  return { request };
}

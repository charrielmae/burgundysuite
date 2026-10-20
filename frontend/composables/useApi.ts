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

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Ensures HTTP-only session cookies are sent
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data as T;
  };

  return { request };
}

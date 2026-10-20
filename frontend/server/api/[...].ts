export default defineEventHandler((event) => {
  const backendBase = (process.env.BACKEND_URL || 'http://127.0.0.1:4000').replace(/\/+$/, '');
  const path = event.path.startsWith('/') ? event.path : `/${event.path}`;
  return proxyRequest(event, `${backendBase}${path}`);
});

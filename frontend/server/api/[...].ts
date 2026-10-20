export default defineEventHandler((event) => {
  const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:4000';
  return proxyRequest(event, `${backendUrl}${event.path}`);
});

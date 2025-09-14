export function isDataRequest(request: Request) {
  return new URL(request.url).pathname.startsWith('/api/');
}

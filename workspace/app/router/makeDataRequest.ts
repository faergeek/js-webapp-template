export async function makeDataRequest(
  request: Request,
  { isIndex }: { isIndex?: boolean } = {},
) {
  const url = new URL(request.url);
  url.pathname = `/api${url.pathname}`;
  if (isIndex) url.searchParams.set('index', '');

  return fetch(url, {
    body:
      request.method === 'GET' || request.method === 'HEAD'
        ? undefined
        : await request.blob(),
    cache: request.cache,
    credentials: request.credentials,
    headers: request.headers,
    integrity: request.integrity,
    keepalive: request.keepalive,
    method: request.method,
    mode: request.mode === 'navigate' ? undefined : request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal,
    window: null,
  });
}

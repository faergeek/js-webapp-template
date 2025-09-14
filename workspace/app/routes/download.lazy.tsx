import type { LoaderFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant';

export async function loader({ request }: LoaderFunctionArgs) {
  invariant(__ENTRY_TARGET__ !== 'webPage');

  const url = new URL(request.url);
  const urlParam = url.searchParams.get('url');

  return urlParam
    ? fetch(urlParam, { signal: request.signal })
    : Response.redirect(new URL('/', request.url));
}

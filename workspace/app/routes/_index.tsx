import type { LoaderFunctionArgs } from 'react-router';

import type { MemeTemplate } from '../_core/memegen';
import { MEMEGEN_BASE_URL } from '../_core/memegen';
import { makeDataRequest } from '../router/makeDataRequest';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  if (q === '') {
    url.searchParams.delete('q');
    return Response.redirect(url, 301);
  }

  if (__ENTRY_TARGET__ === 'webPage') {
    return makeDataRequest(request, { isIndex: true });
  }

  const memegenUrl = new URL('/templates', MEMEGEN_BASE_URL);
  if (q) memegenUrl.searchParams.set('filter', q);

  const response = await fetch(memegenUrl, { signal: request.signal });
  if (!response.ok) throw response;

  const json: MemeTemplate[] = await response.json();

  const map = new Map<string, MemeTemplate[]>();

  for (const meme of json) {
    const key = meme.id;
    let value = map.get(key);

    if (!value) {
      value = [];
      map.set(key, value);
    }

    value.push(meme);
  }

  return Array.from(map).flatMap(([id, templates]) =>
    templates.map((template, index) => ({ key: `${id}-${index}`, template })),
  );
}

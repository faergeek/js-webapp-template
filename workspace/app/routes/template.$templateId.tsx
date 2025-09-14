import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import invariant from 'tiny-invariant';

import type { MemeTemplate } from '../_core/memegen';
import { MEME_IMAGE_EXTENSIONS, MEMEGEN_BASE_URL } from '../_core/memegen';
import { csrfTokenContext } from '../router/csrfToken';
import { isDataRequest } from '../router/isDataRequest';
import { makeDataRequest } from '../router/makeDataRequest';

export async function loader({ context, params, request }: LoaderFunctionArgs) {
  if (__ENTRY_TARGET__ === 'webPage') return makeDataRequest(request);

  const { templateId } = params;
  invariant(templateId);

  const response = await fetch(
    new URL(`/templates/${templateId}`, MEMEGEN_BASE_URL),
    { signal: request.signal },
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Response(
        `Meme template "${templateId}" doesn't seem to exist.`,
        {
          status: response.status,
          statusText: response.statusText,
        },
      );
    }

    throw response;
  }

  const template = (await response.json()) as MemeTemplate;

  const csrfToken = context.get(csrfTokenContext);

  return { csrfToken, template };
}

export async function action({ params, request }: ActionFunctionArgs) {
  let searchParams: string[][];

  if (__ENTRY_TARGET__ === 'webPage') {
    const response = await makeDataRequest(request);
    if (!response.ok) throw response;
    searchParams = await response.json();
  } else {
    const formData = await request.formData();
    const extension = formData.get('extension');

    invariant(
      typeof extension === 'string' &&
        MEME_IMAGE_EXTENSIONS.includes(extension),
    );

    const text = formData.getAll('text').map(item => {
      invariant(typeof item === 'string');
      return item;
    });

    const { templateId } = params;
    invariant(templateId);
    const url = new URL(`/templates/${templateId}`, MEMEGEN_BASE_URL);

    const response = await fetch(url, {
      method: 'post',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ extension, text }),
      signal: request.signal,
    });

    if (!response.ok) throw response;
    const json = (await response.json()) as { url: string };

    searchParams = [
      ['templateId', templateId],
      ...text
        .map(value => (value ? ['text', value] : null))
        .filter(pair => pair != null),
      ['url', json.url],
    ];

    if (isDataRequest(request)) return searchParams;
  }

  return Response.redirect(
    new URL(`/created?${new URLSearchParams(searchParams)}`, request.url),
  );
}

import type { LoaderFunctionArgs } from 'react-router';

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  const templateId = url.searchParams.get('templateId');
  const text = url.searchParams.getAll('text');

  return imageUrl && templateId
    ? { url: imageUrl, templateId, text }
    : Response.redirect(new URL('/', request.url));
}

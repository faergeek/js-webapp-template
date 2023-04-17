import { isAbortError } from './errors';

export function handleFetchError(err: unknown) {
  if (isAbortError(err)) {
    throw err;
  }

  return new Response(
    "Looks like you're offline at the moment and there's no enough data to view this page.",
    {
      status: 408,
      statusText: 'Offline',
    }
  );
}

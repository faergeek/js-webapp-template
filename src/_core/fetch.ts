import { isAbortError } from './errors';

export function handleFetchError(err: unknown) {
  if (isAbortError(err)) {
    throw err;
  }

  return new Response(
    "Looks like you're offline at the moment and there's not enough data available for offline usage.",
    {
      status: 408,
      statusText: 'Offline',
    }
  );
}

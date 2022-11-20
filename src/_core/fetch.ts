export function handleFetchError(err: unknown) {
  if (err instanceof DOMException && err.name === 'AbortError') {
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

export function isAbortError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError';
}

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { createBrowserRouter, HydrationState } from 'react-router';
import invariant from 'tiny-invariant';

interface EntryContext {
  css: string[];
  js: string[];
  nonce: string;
  routerState: HydrationState;
}

const EntryContext = createContext<EntryContext | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  css: string[];
  js: string[];
  nonce: string;
  router: ReturnType<typeof createBrowserRouter>;
}

export function Entry({ children, css, js, nonce, router }: ProviderProps) {
  const [{ actionData, errors, loaderData }, setRouterState] = useState(
    router.state,
  );

  useEffect(() => {
    router.subscribe(setRouterState);
  }, [router]);

  const value = useMemo(
    (): EntryContext => ({
      css,
      routerState: { actionData, errors, loaderData },
      nonce,
      js,
    }),
    [actionData, css, errors, js, loaderData, nonce],
  );

  return (
    <EntryContext.Provider value={value}>{children}</EntryContext.Provider>
  );
}

export function useEntryContext() {
  const value = useContext(EntryContext);
  invariant(value, 'You must render EntryProvider higher in  the tree');
  return value;
}

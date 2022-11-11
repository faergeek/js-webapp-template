import { HydrationState, Router } from '@remix-run/router';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';

interface EntryContext {
  css: string[];
  js: string[];
  routerState: HydrationState;
}

const EntryContext = createContext<EntryContext | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  css: string[];
  js: string[];
  router: Router;
}

export function Entry({ children, css, js, router }: ProviderProps) {
  const [{ actionData, errors, loaderData }, setRouterState] = useState(
    router.state
  );

  useEffect(() => {
    router.subscribe(setRouterState);
  }, [router]);

  const value = useMemo(
    (): EntryContext => ({
      css,
      routerState: { actionData, errors, loaderData },
      js,
    }),
    [actionData, css, errors, js, loaderData]
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

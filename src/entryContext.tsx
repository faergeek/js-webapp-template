import { HydrationState } from '@remix-run/router';
import { createContext, useContext, useMemo } from 'react';
import invariant from 'tiny-invariant';

interface EntryContext {
  css: string[];
  hydrationState: HydrationState;
  js: string[];
}

const EntryContext = createContext<EntryContext | null>(null);

interface ProviderProps {
  children: React.ReactNode;
  css: string[];
  hydrationState: HydrationState;
  js: string[];
}

export function EntryProvider({
  children,
  css,
  hydrationState,
  js,
}: ProviderProps) {
  const value = useMemo(
    (): EntryContext => ({
      css,
      hydrationState,
      js,
    }),
    [css, hydrationState, js]
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

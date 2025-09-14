import { createContext, useContext } from 'react';
import invariant from 'tiny-invariant';

export interface ShellContextValue {
  css: string[];
  nonce: string;
}

export type BrowserGlobals = Partial<{
  __SHELL_CONTEXT__: ShellContextValue;
}>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Window extends BrowserGlobals {}
}

const ShellContext = createContext<ShellContextValue | null>(null);

export const ShellContextProvider = ShellContext.Provider;

export function useShellContext() {
  const value = useContext(ShellContext);
  invariant(value);
  return value;
}

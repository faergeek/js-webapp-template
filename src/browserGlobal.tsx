import { HydrationState } from '@remix-run/router';
import * as serializeJavascript from 'serialize-javascript';

type BrowserGlobals = Partial<{
  __ENTRY_CONTEXT__: {
    css: string[];
    js: string[];
    routerState: HydrationState;
  };
}>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends BrowserGlobals {}
}

interface Props<K extends keyof BrowserGlobals> {
  name: K;
  value: BrowserGlobals[K];
}

export function BrowserGlobal<K extends keyof BrowserGlobals>({
  name,
  value,
}: Props<K>) {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `${name}=${serializeJavascript(value, { isJSON: true })}`,
      }}
    />
  );
}
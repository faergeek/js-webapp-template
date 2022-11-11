import { StrictMode } from 'react';

import { Meta } from './_core/meta';
import { BrowserGlobal } from './browserGlobal';
import { useEntryContext } from './entry';

export function Document({ children }: { children: React.ReactNode }) {
  const { css, js, routerState } = useEntryContext();

  return (
    <StrictMode>
      <html lang="en" suppressHydrationWarning>
        <head suppressHydrationWarning>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="theme-color" content="#96c" />
          <Meta />

          {css.map(href => (
            <link key={href} rel="stylesheet" href={href} />
          ))}

          {js.map(src => (
            <script key={src} defer src={src} />
          ))}
        </head>

        <body suppressHydrationWarning>
          {children}

          <BrowserGlobal
            name="__ENTRY_CONTEXT__"
            value={{ css, js, routerState }}
          />
        </body>
      </html>
    </StrictMode>
  );
}

import { ScrollRestoration } from 'react-router-dom';

import { Meta } from './_core/meta';
import { BrowserGlobal } from './browserGlobal';
import { useEntryContext } from './entry';

export function Document({ children }: { children: React.ReactNode }) {
  const { css, js, nonce, routerState } = useEntryContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="#639" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <Meta />

        {css.map(href => (
          <link key={href} rel="stylesheet" href={href} />
        ))}

        {js.map(src => (
          <script
            key={src}
            defer
            nonce={nonce}
            src={src}
            suppressHydrationWarning
          />
        ))}
      </head>

      <body suppressHydrationWarning>
        {children}

        {typeof window !== 'undefined' && <ScrollRestoration />}

        <BrowserGlobal
          name="__ENTRY_CONTEXT__"
          nonce={nonce}
          value={{ css, js, nonce, routerState }}
        />
      </body>
    </html>
  );
}

import { StrictMode } from 'react';
import { Outlet } from 'react-router-dom';

import { BrowserGlobal } from './browserGlobal';
import { useEntryContext } from './entryContext';

export function Document() {
  const { css, hydrationState, js } = useEntryContext();

  return (
    <StrictMode>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <title>JS WebApp Template</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="theme-color" content="#96c" />

          {css.map(href => (
            <link key={href} rel="stylesheet" href={href} />
          ))}

          {js.map(src => (
            <script key={src} defer src={src} />
          ))}
        </head>

        <body>
          <Outlet />

          <BrowserGlobal
            name="__ENTRY_CONTEXT__"
            value={{ css, hydrationState, js }}
          />
        </body>
      </html>
    </StrictMode>
  );
}

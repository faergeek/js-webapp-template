/// <reference types="@faergeek/make-webpack-config/module" />
/// <reference types="@workspace/app/virtual-routes" />
import '@workspace/app/setPublicPath';
import './index.css';

import { routes, ShellContextProvider } from '@workspace/app';
import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, matchRoutes, RouterProvider } from 'react-router';
import invariant from 'tiny-invariant';

const { __SHELL_CONTEXT__ } = window;
invariant(__SHELL_CONTEXT__);
__webpack_nonce__ = __SHELL_CONTEXT__.nonce;

const lazyMatches = matchRoutes(routes, location)?.filter(m => m.route.lazy);

if (lazyMatches && lazyMatches.length !== 0) {
  await Promise.all(
    lazyMatches.map(m =>
      m.route.lazy?.().then(lazyResolved => {
        delete m.route.lazy;
        Object.assign(m.route, lazyResolved);
      }),
    ),
  );
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <ShellContextProvider value={__SHELL_CONTEXT__}>
        <RouterProvider router={createBrowserRouter(routes)} />
      </ShellContextProvider>
    </StrictMode>,
  );
});

if ('serviceWorker' in navigator) {
  let reg = await navigator.serviceWorker.register(
    `${__webpack_public_path__}sw.js`,
    { scope: '/' },
  );

  if (import.meta.webpackHot) {
    import.meta.webpackHot.addStatusHandler(async status => {
      if (status !== 'check') return;

      await reg.unregister();

      navigator.serviceWorker.register('/sw.js').then(newReg => {
        reg = newReg;
      });
    });
  }
}

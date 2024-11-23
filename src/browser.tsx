import './browser.css';

import { StrictMode } from 'react';
import type { Root } from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import invariant from 'tiny-invariant';

import { Entry } from './entry';
import { routes } from './routes';

const { __ENTRY_CONTEXT__ } = window;
invariant(__ENTRY_CONTEXT__);
const { css, js, nonce, routerState } = __ENTRY_CONTEXT__;
__webpack_nonce__ = nonce;

let root: Root | undefined;

(function render() {
  const router = createBrowserRouter(routes, {
    hydrationData: routerState,
  });

  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept(['./routes'], async () => {
      router.dispose();
      render();
    });
  }

  const el = (
    <StrictMode>
      <Entry css={css} js={js} nonce={nonce} router={router}>
        <RouterProvider router={router} />
      </Entry>
    </StrictMode>
  );

  if (root) {
    root.render(el);

    if (import.meta.webpackHot) {
      router.navigate(router.state.location, {
        replace: true,
        preventScrollReset: true,
      });
    }
  } else {
    root = hydrateRoot(document, el);
  }
})();

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

import { ErrorResponse } from '@remix-run/router';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import invariant from 'tiny-invariant';

import { Entry } from './entry';
import { routes } from './routes';

const { __ENTRY_CONTEXT__ } = window;
invariant(__ENTRY_CONTEXT__);

const { css, js, nonce, routerState } = __ENTRY_CONTEXT__;

__webpack_nonce__ = nonce;

const router = createBrowserRouter(routes, {
  hydrationData: {
    ...routerState,
    errors:
      routerState.errors &&
      Object.fromEntries(
        Object.entries(routerState.errors).map(([key, value]) => [
          key,
          value && 'data' in value && 'status' in value && 'statusText' in value
            ? new ErrorResponse(value.status, value.statusText, value.data)
            : value,
        ])
      ),
  },
});

export function BrowserRoot() {
  return (
    <Entry css={css} js={js} nonce={nonce} router={router}>
      <RouterProvider router={router} />
    </Entry>
  );
}

if (import.meta.webpackHot) {
  interface HotData {
    shouldRevalidate?: boolean;
  }

  const hotData: HotData | undefined = import.meta.webpackHot.data;

  if (hotData?.shouldRevalidate) {
    router.revalidate();
  }

  import.meta.webpackHot.accept(() => {
    __ENTRY_CONTEXT__.routerState = router.state;
  });

  import.meta.webpackHot.dispose((data: HotData) => {
    data.shouldRevalidate = true;
  });
}

import { ErrorResponse, invariant } from '@remix-run/router';
import { RouteData } from '@remix-run/router/dist/utils';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { EntryProvider } from './entryContext';
import { routes } from './routes';

const { __ENTRY_CONTEXT__ } = window;

invariant(__ENTRY_CONTEXT__);

const { css, hydrationState, js } = __ENTRY_CONTEXT__;

function hydrateErrors(errors: RouteData | null | undefined) {
  return (
    errors &&
    Object.fromEntries(
      Object.entries(errors).map(([key, value]) => [
        key,
        value && 'data' in value && 'status' in value && 'statusText' in value
          ? new ErrorResponse(value.status, value.statusText, value.data)
          : value,
      ])
    )
  );
}

const router = createBrowserRouter(routes, {
  hydrationData: {
    ...hydrationState,
    errors: hydrateErrors(hydrationState.errors),
  },
});

import.meta.webpackHot?.dispose(() => {
  __ENTRY_CONTEXT__.hydrationState = router.state;
});

export function BrowserRoot() {
  const { actionData, errors, loaderData } = router.state;

  return (
    <EntryProvider
      css={css}
      hydrationState={{ actionData, errors, loaderData }}
      js={js}
    >
      <RouterProvider router={router} />
    </EntryProvider>
  );
}

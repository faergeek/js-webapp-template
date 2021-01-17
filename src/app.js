import * as React from 'react';

import { Layout } from './layout';
import { RouterProvider, useRouterState } from './routerContext';

function RouterView() {
  const { response } = useRouterState();

  return React.createElement(response.body);
}

export function App({ router }) {
  return (
    <RouterProvider router={router}>
      <Layout>
        <RouterView />
      </Layout>
    </RouterProvider>
  );
}

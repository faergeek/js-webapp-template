import { h } from 'preact';

import { Layout } from './layout';
import { RouterProvider, useRouterState } from './routerContext';

function RouterView() {
  const { response } = useRouterState();

  return h(response.body);
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

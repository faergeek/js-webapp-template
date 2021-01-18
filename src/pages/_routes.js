import { prepareRoutes } from '@curi/router';

export const routes = prepareRoutes([
  {
    name: 'home',
    path: '',
    resolve: () => import('./home'),
    respond: ({ resolved }) => ({ body: resolved.default }),
  },
  {
    name: 'about',
    path: 'about',
    resolve: () => import('./about'),
    respond: ({ resolved }) => ({ body: resolved.default }),
  },
  {
    name: '404',
    path: '(.*)',
    resolve: () => import('./_404'),
    respond: ({ resolved }) => ({
      meta: { status: 404 },
      body: resolved.default,
    }),
  },
]);

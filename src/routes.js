import { prepareRoutes } from '@curi/router';

import { NotFoundPage } from './404';
import { HomePage } from './home';

export const routes = prepareRoutes([
  {
    name: 'home',
    path: '',
    respond: () => ({ body: HomePage }),
  },

  {
    name: '404',
    path: '(.*)',
    respond: () => ({ meta: { status: 404 }, body: NotFoundPage }),
  },
]);

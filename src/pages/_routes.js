import { prepareRoutes } from '@curi/router';

import { NotFoundPage } from './_404';
import { AboutPage } from './about';
import { HomePage } from './home';

export const routes = prepareRoutes([
  {
    name: 'home',
    path: '',
    respond: () => ({ body: HomePage }),
  },
  {
    name: 'about',
    path: 'about',
    respond: () => ({ body: AboutPage }),
  },
  {
    name: '404',
    path: '(.*)',
    respond: () => ({ meta: { status: 404 }, body: NotFoundPage }),
  },
]);

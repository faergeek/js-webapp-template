import { Outlet } from 'react-router';
import type { VirtualNonIndexRouteObject } from 'virtual:routes';
import children from 'virtual:routes';

import { ErrorBoundary, Shell } from './shell';

interface RootRouteObject extends VirtualNonIndexRouteObject {
  element: React.ReactElement;
  errorElement: React.ReactElement;
}

export const routes: RootRouteObject[] = [
  {
    element: (
      <Shell>
        <Outlet />
      </Shell>
    ),
    errorElement: (
      <Shell>
        <ErrorBoundary />
      </Shell>
    ),
    children,
  },
];

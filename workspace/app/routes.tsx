/// <reference types="@faergeek/fs-routes/types" />
import { Outlet } from 'react-router';
import type { VirtualNonIndexRouteObject } from 'virtual:@faergeek/fs-routes';
import children from 'virtual:@faergeek/fs-routes';

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

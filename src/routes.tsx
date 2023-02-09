import {
  type IndexRouteObject,
  type NonIndexRouteObject,
  Outlet,
} from 'react-router-dom';

import { type MetaDescriptor, type MetaFunctionArgs } from './_core/meta';
import { Document } from './document';
import { Layout } from './layout/layout';
import { errorMeta, ErrorPage } from './pages/_error';
import { createdLoader, createdMeta, CreatedPage } from './pages/created';
import { homeLoader, homeMeta, HomePage } from './pages/home';
import {
  templateAction,
  templateLoader,
  templateMeta,
  TemplatePage,
} from './pages/template';

interface AppRouteParams {
  meta?: // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ((args: MetaFunctionArgs<any>) => MetaDescriptor | void) | MetaDescriptor;
}

type AppIndexRouteObject = IndexRouteObject & AppRouteParams;

type AppNonIndexRouteObject = Omit<NonIndexRouteObject, 'children' | 'id'> & {
  children?: AppRouteObject[];
} & AppRouteParams;

type AppRouteObject = AppIndexRouteObject | AppNonIndexRouteObject;

function convertRoutes(routes: AppRouteObject[], parentPath: number[] = []) {
  return routes.map((route, index) => {
    const treePath = [...parentPath, index];
    const id = treePath.join('-');

    const hasErrorBoundary = route.errorElement != null;

    if (route.index) {
      return { ...route, hasErrorBoundary, id };
    }

    const pathOrLayoutRoute: AppNonIndexRouteObject & { id: string } = {
      ...route,
      hasErrorBoundary,
      id,
      children: route.children
        ? convertRoutes(route.children, treePath)
        : undefined,
    };

    return pathOrLayoutRoute;
  });
}

const title = 'Memes';
const description = 'Generate memes from provided templates';

export const routes = convertRoutes([
  {
    path: '/',
    meta: {
      'application-name': 'JS WebApp Template',
      title,
      description,
      'og:title': title,
      'og:description': description,
      'og:image':
        'https://api.memegen.link/images/buzz/memes/memes_everywhere.jpg?width=1200&height=630',
      'og:image:width': '1200',
      'og:image:height': '630',
      'twitter:card': 'summary_large_image',
    },
    element: (
      <Document>
        <Outlet />
      </Document>
    ),
    errorElement: (
      <Document>
        <ErrorPage />
      </Document>
    ),
    children: [
      {
        meta: errorMeta,
        element: (
          <Layout>
            <Outlet />
          </Layout>
        ),
        errorElement: (
          <Layout>
            <ErrorPage />
          </Layout>
        ),
        children: [
          {
            index: true,
            loader: homeLoader,
            meta: homeMeta,
            element: <HomePage />,
          },
          {
            path: 'template/:templateId',
            loader: templateLoader,
            meta: templateMeta,
            action: templateAction,
            element: <TemplatePage />,
          },
          {
            path: 'created',
            loader: createdLoader,
            meta: createdMeta,
            element: <CreatedPage />,
          },
          {
            path: '*',
            loader: () => {
              throw new Response("The page you're looking for doesn't exist.", {
                status: 404,
                statusText: 'Page Not Found',
              });
            },
            element: null,
          },
        ],
      },
    ],
  },
]);

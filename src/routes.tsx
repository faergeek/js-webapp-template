import type { IndexRouteObject, NonIndexRouteObject } from 'react-router';
import { Outlet } from 'react-router';

import type { MetaDescriptor, MetaFunctionArgs } from './_core/meta';
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
  handle?: {
    meta:
      | ((
          args: // eslint-disable-next-line @typescript-eslint/no-explicit-any
          MetaFunctionArgs<any>,
        ) => MetaDescriptor | void)
      | MetaDescriptor;
  };
}

type AppIndexRouteObject = IndexRouteObject & AppRouteParams;

type AppNonIndexRouteObject = Omit<NonIndexRouteObject, 'children'> & {
  children?: AppRouteObject[];
} & AppRouteParams;

type AppRouteObject = AppIndexRouteObject | AppNonIndexRouteObject;

export const routes: AppRouteObject[] = [
  {
    path: '/',
    handle: {
      meta() {
        const title = 'Memes';
        const description = 'Generate memes from provided templates';

        return {
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
        };
      },
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
        handle: {
          meta: errorMeta,
        },
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
            handle: {
              meta: homeMeta,
            },
            element: <HomePage />,
          },
          {
            path: 'template/:templateId',
            loader: templateLoader,
            handle: {
              meta: templateMeta,
            },
            action: templateAction,
            element: <TemplatePage />,
          },
          {
            path: 'created',
            loader: createdLoader,
            handle: {
              meta: createdMeta,
            },
            element: <CreatedPage />,
          },
          {
            path: '*',
            loader() {
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
];

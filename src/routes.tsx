import { RouteObject } from 'react-router-dom';

import { Document } from './document';
import { Layout } from './layout/layout';
import { ErrorPage } from './pages/_error';
import { createdLoader, CreatedPage } from './pages/created';
import { homeLoader, HomePage } from './pages/home';
import { templateAction, templateLoader, TemplatePage } from './pages/template';

export const routes: RouteObject[] = [
  {
    element: <Document />,
    children: [
      {
        path: '/',
        element: <Layout />,
        errorElement: <ErrorPage />,
        children: [
          {
            errorElement: <ErrorPage />,
            children: [
              {
                index: true,
                loader: homeLoader,
                element: <HomePage />,
              },
              {
                path: 'template/:templateId',
                loader: templateLoader,
                action: templateAction,
                element: <TemplatePage />,
              },
              {
                path: 'created',
                loader: createdLoader,
                element: <CreatedPage />,
              },
              {
                path: '*',
                loader: () => {
                  throw new Response('', {
                    status: 404,
                    statusText: 'Page Not Found',
                  });
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

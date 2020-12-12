import { createRouter } from '@curi/router';
import { createReusable } from '@hickory/in-memory';
import * as express from 'express';
import * as nocache from 'nocache';

import { renderHtml } from './nodeRenderHtml';
import { routes } from './routes';

export function createRequestHandler({
  getAssetUrl,
  publicDir,
  webpackDevMiddleware,
  webpackHotMiddleware,
}) {
  const reusable = createReusable();

  const app = express();

  if (process.env.NODE_ENV !== 'production') {
    app.use(webpackDevMiddleware, webpackHotMiddleware);
  }

  return app
    .use('/', express.static(publicDir, { maxAge: '1y' }))
    .use(nocache(), (req, res) => {
      const router = createRouter(reusable, routes, {
        history: { location: { url: req.originalUrl } },
      });

      router.once(({ response }) => {
        const status = (response.meta && response.meta.status) || 200;

        res
          .status(status)
          .set('Content-Type', 'text/html')
          .end(renderHtml({ getAssetUrl, response, router }));
      });
    });
}

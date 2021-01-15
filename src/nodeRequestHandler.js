import { createRouter } from '@curi/router';
import { createReusable } from '@hickory/in-memory';
import * as express from 'express';
import * as nocache from 'nocache';
import { h } from 'preact';
import renderToString from 'preact-render-to-string';

import { routes } from './routes';
import { Root } from './root';

// see http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
const symbolsToEscape = ['\u2028', '\u2029'];

const replacements = symbolsToEscape.reduce((result, sym) => {
  result[sym] = `\\${sym}`;

  return result;
}, {});

function escapeJsonForEval(str) {
  return str
    .replace(
      new RegExp(`(${symbolsToEscape.join('|')})`, 'g'),
      (_, toEscape) => replacements[toEscape]
    )
    .replace(/<\/script>/g, '<\\/script>');
}

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
          .end(
            `<!doctype html>${renderToString(
              <html>
                <head>
                  <meta charSet="utf-8" />
                  <meta httpEquiv="x-ua-compatible" content="ie=edge" />

                  <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1"
                  />

                  {['main.css'].map(getAssetUrl).map(href => (
                    <link key={href} rel="stylesheet" href={href} />
                  ))}

                  {['main.js'].map(getAssetUrl).map(src => (
                    <script key={src} defer src={src} />
                  ))}
                </head>

                <body>
                  <div id="root">
                    <Root router={router} />
                  </div>

                  <script
                    id="initial-response"
                    type="application/json"
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: escapeJsonForEval(
                        JSON.stringify({
                          data: response.data,
                          meta: response.meta,
                        })
                      ),
                    }}
                  />
                </body>
              </html>
            )}`
          );
      });
    });
}

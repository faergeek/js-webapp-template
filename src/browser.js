/* eslint-env browser */
import './browser.sass';

import { createRouterComponent } from '@curi/react-dom';
import { createRouter } from '@curi/router';
import { browser } from '@hickory/browser';
import * as React from 'react';
import { hydrate } from 'react-dom';

import { App } from './app';
import { routes } from './pages/_routes';

const router = createRouter(browser, routes);
const Router = createRouterComponent(router);

router.once(() => {
  hydrate(
    <Router>
      <App />
    </Router>,
    document.getElementById('root')
  );
});

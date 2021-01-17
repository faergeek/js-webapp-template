/* eslint-env browser */
import './browser.css';

import { createRouter } from '@curi/router';
import { browser } from '@hickory/browser';
import * as React from 'react';
import { hydrate } from 'react-dom';

import { App } from './app';
import { routes } from './routes';

const router = createRouter(browser, routes);

router.once(() => {
  hydrate(<App router={router} />, document.getElementById('root'));
});

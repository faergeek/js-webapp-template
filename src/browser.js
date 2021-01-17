if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
}

import { createRouter } from '@curi/router';
import { browser } from '@hickory/browser';
import { h, hydrate } from 'preact';

import './browser.css';
import { App } from './app';
import { routes } from './routes';

const router = createRouter(browser, routes);

router.once(() => {
  hydrate(<App router={router} />, document.getElementById('root'));
});

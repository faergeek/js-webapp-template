/* eslint-env browser */
import './browser.css';

import { hydrate } from 'preact';

import { App } from './app';

hydrate(<App />, document.body);

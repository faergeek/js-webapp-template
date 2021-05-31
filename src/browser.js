/* eslint-env browser */
if (__DEV__) {
  require('preact/debug');
}

import 'bulma';

import { hydrate } from 'preact';

import { App } from './app';

hydrate(<App />, document.getElementById('root'));

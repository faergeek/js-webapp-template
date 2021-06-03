/* eslint-env browser */
import './browser.css';
import './browser.sass';

import { hydrate } from 'preact';

import { App } from './app';

const root = document.getElementById('root');

let el;
function init() {
  el = hydrate(<App />, root, el);
}

init();

if (module.hot) {
  module.hot.accept('./app', init);
}

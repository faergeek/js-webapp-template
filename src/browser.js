/* eslint-env browser */
import './browser.css';
import './minireset.sass';
import './generic.sass';
import './button.sass';
import './container.sass';
import './title.sass';
import './tools.sass';
import './typography.sass';
import './hero.sass';

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

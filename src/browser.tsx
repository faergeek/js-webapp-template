import './browser.css';
__DEV__ && require('preact/debug');
import { hydrate } from 'preact';

import { App } from './app';

hydrate(<App />, document.body);

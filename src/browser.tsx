__DEV__ && require('preact/debug');
import './browser.css';

import { hydrate } from 'react-dom';

import { App } from './app';

hydrate(<App />, document.body);

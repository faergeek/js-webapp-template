/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import './browser.css';

import { hydrate } from 'react-dom';

import { BrowserRoot } from './browserRoot';

hydrate(<BrowserRoot />, document);

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

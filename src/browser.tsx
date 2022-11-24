/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import './browser.css';

import { StrictMode } from 'react';
import { hydrate } from 'react-dom';

import { BrowserRoot } from './browserRoot';

hydrate(
  <StrictMode>
    <BrowserRoot />
  </StrictMode>,
  document
);

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

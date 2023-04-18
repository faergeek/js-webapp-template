import './browser.css';

import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';

import { BrowserRoot } from './browserRoot';

hydrateRoot(
  document,
  <StrictMode>
    <BrowserRoot />
  </StrictMode>
);

if (navigator.serviceWorker) {
  navigator.serviceWorker.register('/sw.js');
}

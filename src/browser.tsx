import './browser.css';

import { hydrateRoot, Root } from 'react-dom/client';

import { BrowserRoot } from './browserRoot';

interface HotData {
  root: Root;
}

const root =
  (import.meta.webpackHot?.data as HotData | undefined)?.root ??
  hydrateRoot(document, <BrowserRoot />);

import.meta.webpackHot?.accept();

import.meta.webpackHot?.dispose(data => {
  (data as HotData).root = root;
});

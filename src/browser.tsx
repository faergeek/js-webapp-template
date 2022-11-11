import './browser.css';

import { hydrate } from 'react-dom';

import { BrowserRoot } from './browserRoot';

hydrate(<BrowserRoot />, document);

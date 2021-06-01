/* eslint-env browser */
import './browser.sass';

import * as React from 'react';
import { hydrate } from 'react-dom';

import { App } from './app';

hydrate(<App />, document.getElementById('root'));

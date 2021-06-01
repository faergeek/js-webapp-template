/* eslint-env browser */
import 'bulma';

import * as React from 'react';
import { hydrate } from 'react-dom';

import { App } from './app';

hydrate(<App />, document.getElementById('root'));

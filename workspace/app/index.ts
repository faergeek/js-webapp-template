/// <reference types="@faergeek/make-webpack-config/module" />
export { csrfTokenContext } from './router/csrfToken';
export { isDataRequest } from './router/isDataRequest';
export { routes } from './routes';
export { ShellContextProvider } from './shellContext';

declare module 'react-router' {
  interface Future {
    v8_middleware: true;
  }
}

import { useResponse } from '@curi/react-dom';
import * as React from 'react';

import { Layout } from './layout';

export function App() {
  const { response } = useResponse();

  return <Layout>{React.createElement(response.body)}</Layout>;
}

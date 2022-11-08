import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Container } from '../layout/layout';

export function ErrorPage() {
  const err = useRouteError();

  let status = 500;
  let statusText = 'Internal Server Error';

  if (isRouteErrorResponse(err)) {
    status = err.status;
    statusText = err.statusText;
  }

  return (
    <Container>
      <h1>
        {status}: {statusText}
      </h1>
    </Container>
  );
}

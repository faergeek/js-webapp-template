import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { MetaFunctionArgs } from '../_core/meta';
import { Container } from '../layout/layout';

function formatErrorMessage(error: unknown) {
  let status = 500;
  let statusText = 'Internal Server Error';

  if (isRouteErrorResponse(error)) {
    status = error.status;
    statusText = error.statusText;
  }

  return `${status}: ${statusText}`;
}

export function errorMeta({ error }: MetaFunctionArgs) {
  if (!error) return;

  return {
    title: formatErrorMessage(error),
  };
}

export function ErrorPage() {
  const error = useRouteError();

  return (
    <Container>
      <h1>{formatErrorMessage(error)}</h1>
    </Container>
  );
}

import {
  isRouteErrorResponse,
  Link,
  useLocation,
  useRouteError,
} from 'react-router-dom';

import { Button } from '../_core/button';
import type { MetaFunctionArgs } from '../_core/meta';
import { Container } from '../layout/layout';

function convertErrorToErrorResponse(error: unknown) {
  return isRouteErrorResponse(error)
    ? {
        status: error.status,
        statusText: error.statusText,
        data: typeof error.data === 'string' ? error.data : undefined,
      }
    : {
        status: 500,
        statusText: 'Internal Server Error',
        data: 'Something went terribly wrong on our side.',
      };
}

export function errorMeta({ error }: MetaFunctionArgs) {
  if (!error) return;

  const response = convertErrorToErrorResponse(error);

  return {
    title: response.statusText,
    'og:title': response.statusText,
  };
}

export function ErrorPage() {
  const error = useRouteError();
  const location = useLocation();
  const errorResponse = convertErrorToErrorResponse(error);

  return (
    <Container>
      <h1>{errorResponse.statusText ?? 'Error'}</h1>

      <div>
        {errorResponse.data && <p>{errorResponse.data}</p>}

        {errorResponse.status !== 404 && (
          <>
            <p>
              Please try to click{' '}
              <Button
                as={Link}
                to={location.pathname + location.search + location.hash}
              >
                Reload
              </Button>{' '}
            </p>

            <p>
              If it doesn&apos;t help, you&apos;d better try again a little
              later.
            </p>
          </>
        )}
      </div>
    </Container>
  );
}

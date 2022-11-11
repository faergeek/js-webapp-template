import {
  LoaderFunctionArgs,
  redirect,
  useSearchParams,
} from 'react-router-dom';
import invariant from 'tiny-invariant';

import { Button } from '../_core/button';
import { MetaDescriptor } from '../_core/meta';
import { Container } from '../layout/layout';
import * as css from './created.module.css';

export function createdLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  if (!url.searchParams.get('url')) {
    return redirect('/');
  }

  return null;
}

export const createdMeta: MetaDescriptor = {
  title: 'You successfully created your own meme!!!',
};

export function CreatedPage() {
  const [searchParams] = useSearchParams();

  const url = searchParams.get('url');
  invariant(url);

  return (
    <Container>
      <h1>You successfully created your own meme!!!</h1>

      <div className={css.imageWrapper}>
        <img src={url} alt="Your new meme" />
      </div>

      <div className={css.buttons}>
        <Button as="a" download href={url} rel="noopener" target="_blank">
          Download
        </Button>

        <Button>Share</Button>
      </div>
    </Container>
  );
}

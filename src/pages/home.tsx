import {
  Link,
  LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from 'react-router-dom';

import { MetaDescriptor, MetaFunctionArgs } from '../_core/meta';
import { fetchTemplates, getTemplateImageUrl } from '../api';
import * as css from './home.module.css';

export function homeLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q');

  if (q === '') {
    url.searchParams.delete('q');
    throw redirect(url.pathname + url.search);
  }

  return fetchTemplates(q);
}

type LoaderData = Awaited<ReturnType<typeof homeLoader>>;

export function homeMeta({ location }: MetaFunctionArgs<LoaderData>) {
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q');

  const meta: MetaDescriptor = {};

  if (q) {
    meta.title = `Search results for "${q}"`;
  }

  return meta;
}

const GRID_IMAGE_WIDTH = 200;
const GRID_IMAGE_HEIGHT = GRID_IMAGE_WIDTH;

export function HomePage() {
  const templates = useLoaderData() as LoaderData;

  return (
    <section className={css.templatesGrid}>
      {templates.map(template => (
        <Link key={template.id} to={`/template/${template.id}`}>
          <img
            src={getTemplateImageUrl(template, {
              extension: 'jpg',
              width: GRID_IMAGE_WIDTH,
              height: GRID_IMAGE_HEIGHT,
            }).toString()}
            alt=""
            title={template.name}
            width={GRID_IMAGE_WIDTH}
            height={GRID_IMAGE_HEIGHT}
            decoding="async"
            loading="lazy"
          />
        </Link>
      ))}
    </section>
  );
}

import type { LoaderFunctionArgs } from 'react-router';
import { Link, redirect, useLoaderData } from 'react-router';

import type { MetaDescriptor, MetaFunctionArgs } from '../_core/meta';
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
    meta.title = meta['og:title'] = `Search results for "${q}"`;
  }

  return meta;
}

const GRID_IMAGE_WIDTH = 177;
const GRID_IMAGE_HEIGHT = GRID_IMAGE_WIDTH;

export function HomePage() {
  const templates = useLoaderData() as LoaderData;

  return !templates.length ? (
    <p className={css.noResultsMessage}>Nothing matched your query :-(</p>
  ) : (
    <section className={css.templatesGrid}>
      {templates.map(template => (
        <Link
          key={template.id}
          aria-label={template.name}
          title={template.name}
          to={`/template/${template.id}`}
        >
          <img
            alt=""
            width={GRID_IMAGE_WIDTH}
            height={GRID_IMAGE_HEIGHT}
            decoding="async"
            src={getTemplateImageUrl(template, {
              extension: 'jpg',
              width: GRID_IMAGE_WIDTH,
              height: GRID_IMAGE_HEIGHT,
            }).toString()}
            srcSet={Array.from(Array(3), (_, i) => i + 1)
              .map(scale => {
                const size = GRID_IMAGE_WIDTH * scale;

                return [
                  `${getTemplateImageUrl(template, {
                    extension: 'jpg',
                    width: size,
                    height: size,
                  })} ${size}w`,
                ];
              })
              .join(', ')}
            sizes={`${GRID_IMAGE_WIDTH}px`}
          />
        </Link>
      ))}
    </section>
  );
}

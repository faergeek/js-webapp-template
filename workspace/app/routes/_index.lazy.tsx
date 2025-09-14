import { Link, useLoaderData, useLocation } from 'react-router';

import { MEMEGEN_BASE_URL } from '../_core/memegen';
import type { loader } from './_index';
import * as css from './_index.lazy.module.css';

export function Component() {
  const templates = useLoaderData<typeof loader>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const q = searchParams.get('q');

  return (
    <>
      {q ? <title>{`Search results for "${q}"`}</title> : <title>Memes</title>}

      {templates.length === 0 ? (
        <p className={css.noResultsMessage}>
          Nothing has matched your query...
        </p>
      ) : (
        <section className={css.grid}>
          {templates.map(({ key, template }) => {
            const url = new URL('/images/preview.jpg', MEMEGEN_BASE_URL);
            url.searchParams.set('template', template.id);

            template.example.text.forEach(line => {
              url.searchParams.append('lines[]', line || ' ');
            });

            const urlStr = url.toString();

            return (
              <Link
                key={key}
                className={css.imgWrapper}
                aria-label={template.name}
                style={{ backgroundImage: `url(${urlStr})` }}
                title={template.name}
                to={`/template/${template.id}`}
              >
                <img
                  className={css.img}
                  alt=""
                  decoding="async"
                  loading="lazy"
                  src={urlStr}
                />
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}

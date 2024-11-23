import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { Form, Link, useNavigation, useSearchParams } from 'react-router';

import * as css from './layout.module.css';

export function Layout({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const navigation = useNavigation();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const q = searchParams.get('q') ?? '';

  useEffect(() => {
    const searchInput = searchInputRef.current;

    if (!searchInput) {
      return;
    }

    searchInput.value = q;
  }, [q]);

  return (
    <div
      className={clsx(css.root, {
        [css.root_loading]: navigation.state !== 'idle',
      })}
    >
      <div className={css.header_placeholder} />

      <header className={css.header}>
        <div className={css.headerInner}>
          <nav>
            <Link to="/" title="Go to the home page">
              <img
                src={new URL('../../public/icon.svg', import.meta.url).pathname}
                alt="JS WebApp Template logo"
                width={37}
                height={37}
              />
            </Link>
          </nav>

          <Form className={css.searchForm}>
            <label htmlFor="search">Search</label>

            <input
              ref={searchInputRef}
              className={css.searchInput}
              defaultValue={searchParams.get('q') ?? ''}
              id="search"
              name="q"
              placeholder="Do you want ants?"
              type="search"
            />
          </Form>
        </div>
      </header>

      <main className={css.main}>{children}</main>

      <footer className={css.footer}>
        <Container>
          <p>
            <a
              href="https://github.com/faergeek/js-webapp-template"
              rel="noopener"
              target="_blank"
            >
              Check out the repo
            </a>{' '}
            or{' '}
            <a
              href="https://github.com/faergeek/js-webapp-template/generate"
              rel="noopener"
              target="_blank"
            >
              use it as a template
            </a>{' '}
            for your own project.
          </p>

          <p>
            Powered by the awesome{' '}
            <a href="https://memegen.link/" rel="noopener" target="_blank">
              Memegen.link
            </a>{' '}
            and{' '}
            <a href="https://reactrouter.com" rel="noopener" target="_blank">
              React Router
            </a>
            .
          </p>

          <p>
            ©{' '}
            <a
              href="https://github.com/faergeek"
              rel="noopener"
              target="_blank"
            >
              Sergey Slipchenko
            </a>
            .
          </p>
        </Container>
      </footer>
    </div>
  );
}

export function Container({ children }: { children: React.ReactNode }) {
  return <div className={css.container}>{children}</div>;
}

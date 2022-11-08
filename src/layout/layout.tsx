import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import {
  Form,
  Link,
  Outlet,
  ScrollRestoration,
  useNavigation,
  useSearchParams,
} from 'react-router-dom';

import * as css from './layout.module.css';

export function Layout() {
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
    <>
      {!__NODE__ && <ScrollRestoration />}

      <div
        className={clsx(css.root, {
          [css.root_loading]: navigation.state !== 'idle',
        })}
      >
        <header>
          <Container>
            <div className={css.headerInner}>
              <nav>
                <Link to="/" title="Go to the home page">
                  🏠
                </Link>
              </nav>

              <Form className={css.searchForm}>
                <input
                  ref={searchInputRef}
                  className={css.searchInput}
                  defaultValue={searchParams.get('q') ?? ''}
                  id="search"
                  name="q"
                  placeholder="Search for a meme template..."
                  type="search"
                />
              </Form>
            </div>
          </Container>
        </header>

        <main className={css.main}>
          <Outlet />
        </main>

        <footer className={css.footer}>
          <Container>
            <p>
              Go ahead,{' '}
              <a
                href="https://github.com/faergeek/js-webapp-template"
                rel="noopener"
                target="_blank"
              >
                check out the repo
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
    </>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps) {
  return <div className={clsx(className, css.container)}>{children}</div>;
}

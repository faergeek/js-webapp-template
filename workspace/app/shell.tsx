import clsx from 'clsx';
import htmlescape from 'htmlescape';
import { useLayoutEffect, useRef } from 'react';
import {
  Form,
  isRouteErrorResponse,
  Link,
  ScrollRestoration,
  useNavigation,
  useRouteError,
  useSearchParams,
  useSubmit,
} from 'react-router';

import { Container } from './_core/container';
import appleTouchIcon from './apple-touch-icon.png';
import favicon from './favicon.ico';
import icon from './icon.svg';
import * as css from './shell.module.css';
import type { BrowserGlobals } from './shellContext';
import { useShellContext } from './shellContext';

function SearchForm() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const submit = useSubmit();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useLayoutEffect(() => {
    const searchInput = searchInputRef.current;
    if (!searchInput) return;

    searchInput.value = q;
  }, [q]);

  return (
    <Form
      className={css.searchForm}
      onSubmit={event => {
        const formData = new FormData(event.currentTarget);
        if (formData.get('q') === q) event.preventDefault();
      }}
    >
      <label htmlFor="search">Search</label>

      <input
        ref={searchInputRef}
        className={css.searchInput}
        defaultValue={q}
        id="search"
        name="q"
        placeholder="Do you want ants?"
        type="search"
        onChange={event => {
          const form = event.currentTarget.form;
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => submit(form), 400);
        }}
      />
    </Form>
  );
}

function LoadingState({ children }: { children: React.ReactNode }) {
  const navigation = useNavigation();

  return (
    <div
      className={clsx(css.root, {
        [css.root_loading]: navigation.state !== 'idle',
      })}
    >
      {children}
    </div>
  );
}

function BrowserGlobal<K extends keyof BrowserGlobals>({
  name,
  nonce,
  value,
}: {
  name: K;
  nonce: string;
  value: BrowserGlobals[K];
}) {
  return (
    <script
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: `${name}=${htmlescape(value)}` }}
      nonce={nonce}
      suppressHydrationWarning
    />
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const context = useShellContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="theme-color" content="hsl(270 50% 40%)" />

        <link rel="icon" href={favicon} sizes="any" />
        <link rel="icon" href={icon} type="image/svg+xml" />
        <link rel="apple-touch-icon" href={appleTouchIcon} />
        <link rel="manifest" href="/app.webmanifest" />

        <meta
          name="description"
          content="Generate memes from provided templates"
        />

        {context.css.map(href => (
          <link key={href} rel="stylesheet" href={href} />
        ))}
      </head>

      <body suppressHydrationWarning>
        <LoadingState>
          <header className={css.header}>
            <div className={css.headerInner}>
              <nav>
                <Link to="/" title="Go to the home page">
                  <img src={icon} alt="WAT" width={37} height={37} />
                </Link>
              </nav>

              <SearchForm />
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
                <a
                  href="https://reactrouter.com"
                  rel="noopener"
                  target="_blank"
                >
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
                  Sergei Slipchenko
                </a>
                .
              </p>
            </Container>
          </footer>
        </LoadingState>

        <ScrollRestoration nonce={context.nonce} />

        <BrowserGlobal
          name="__SHELL_CONTEXT__"
          nonce={context.nonce}
          value={context}
        />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const err = useRouteError();

  const title = isRouteErrorResponse(err)
    ? `${err.status}: ${err.statusText}`
    : 'Error';

  const message = isRouteErrorResponse(err)
    ? err.data && typeof err.data === 'string'
      ? err.data
      : null
    : // eslint-disable-next-line no-console
      (console.error(err) ?? 'Something went wrong');

  return (
    <Container>
      <title>{title}</title>
      <h1>{title}</h1>

      {message && <p className={css.errorMessage}>{message}</p>}
    </Container>
  );
}

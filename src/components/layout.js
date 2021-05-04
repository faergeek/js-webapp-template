import { Link, useResponse, useRouter } from '@curi/react-dom';
import clsx from 'clsx';
import * as React from 'react';

import css from './layout.module.css';

export function Layout({ children }) {
  const router = useRouter();
  const { response } = useResponse();
  const [isMenuActive, setIsMenuActive] = React.useState(false);
  const query = new URLSearchParams(response.location.query).get('q') ?? '';
  const [search, setSearch] = React.useState(query);
  React.useEffect(() => setSearch(query), [query]);

  return (
    <div className={clsx(css.root, 'is-flex', 'is-flex-direction-column')}>
      <nav className="navbar is-spaced">
        <div className="container">
          <div className="navbar-brand">
            <a
              className={clsx('navbar-burger', { 'is-active': isMenuActive })}
              role="button"
              onClick={() => {
                setIsMenuActive(prevState => !prevState);
              }}
            >
              <span />
              <span />
              <span />
            </a>
          </div>

          <div className={clsx('navbar-menu', { 'is-active': isMenuActive })}>
            <div className="navbar-start">
              <Link className="navbar-item" name="home">
                Home
              </Link>

              <Link className="navbar-item" name="about">
                About
              </Link>
            </div>

            <div className="navbar-end">
              <div className="navbar-item">
                <form
                  className="field is-grouped"
                  onSubmit={event => {
                    event.preventDefault();

                    router.navigate({
                      url: `/search?q=${encodeURIComponent(search)}`,
                    });
                  }}
                >
                  <p className="control has-icons-left">
                    <input
                      className="input"
                      placeholder="Search..."
                      type="search"
                      value={search}
                      onChange={event => {
                        setSearch(event.target.value);
                      }}
                    />

                    <span className="icon is-left">
                      <svg className={css.searchIcon} viewBox="0 0 512 512">
                        <path d="M456.69 421.39L362.6 327.3a173.81 173.81 0 0034.84-104.58C397.44 126.38 319.06 48 222.72 48S48 126.38 48 222.72s78.38 174.72 174.72 174.72A173.81 173.81 0 00327.3 362.6l94.09 94.09a25 25 0 0035.3-35.3zM97.92 222.72a124.8 124.8 0 11124.8 124.8 124.95 124.95 0 01-124.8-124.8z" />
                      </svg>
                    </span>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="is-flex-grow-1 is-flex is-flex-direction-column">
        {children}
      </div>

      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            Built by{' '}
            <a href="https://twitter.com/faergeek">Sergey Slipchenko</a>. The{' '}
            <a href="https://github.com/faergeek/js-webapp-template">
              source code
            </a>{' '}
            is licensed under <a href="http://www.wtfpl.net">WTFPL</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}

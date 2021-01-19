import { Link, useResponse, useRouter } from '@curi/react-dom';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
                      <FontAwesomeIcon icon={faSearch} />
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
            <a
              className="icon-text"
              href="https://github.com/faergeek/webpack-ssr-hmr-boilerplate"
            >
              <span className="icon">
                <FontAwesomeIcon icon={faGithub} />
              </span>
              <span>source code</span>
            </a>{' '}
            is licensed under <a href="http://www.wtfpl.net">WTFPL</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}

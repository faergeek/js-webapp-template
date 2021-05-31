import clsx from 'clsx';
import { useState } from 'preact/hooks';

import css from './app.module.css';

export function App() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className={clsx(css.root, 'is-flex', 'is-flex-direction-column')}>
      <div className="is-flex-grow-1 is-flex is-flex-direction-column">
        <section className="hero is-primary">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">Webpack SSR HMR Boilerplate</h1>
              <h2 className="subtitle">
                This is a template to bundle your own HMR-enabled app for node
                and browsers using webpack.
              </h2>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="content">
              <p>This is a button from bulma overriden to have funny border:</p>

              <p>
                <button
                  className={clsx(css.button, 'button is-primary', {
                    'is-loading': isLoading,
                  })}
                  disabled={isLoading}
                  type="button"
                  onClick={() => {
                    setIsLoading(true);

                    setTimeout(() => {
                      setIsLoading(false);
                    }, 1000);
                  }}
                >
                  Wait a second
                </button>
              </p>

              <p>
                When clicked, it shows loading spinner for a second (hence the
                text).
              </p>
            </div>
          </div>
        </section>
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

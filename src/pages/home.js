import clsx from 'clsx';
import * as React from 'react';

import css from './home.module.css';

export function HomePage() {
  const [isLoading, setIsLoading] = React.useState(false);

  return (
    <>
      <section className="hero is-primary">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">Webpack SSR HMR Boilerplate</h1>
            <h2 className="subtitle">
              This is a template to bundle your own HMR-enabled app for node and
              browsers using webpack.
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
    </>
  );
}

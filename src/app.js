import * as React from 'react';

export function App() {
  return (
    <section className="hero is-primary is-fullheight">
      <div className="hero-body">
        <div className="container has-text-centered">
          <p className="title">JS WebApp Template</p>

          <p className="subtitle">
            Template to build web applications with bundling for both Node.js
            and browsers
          </p>

          <div className="field is-grouped is-grouped-centered">
            <p className="control">
              <a
                className="button is-link"
                href="https://github.com/faergeek/js-webapp-template/generate"
              >
                Use this template
              </a>
            </p>

            <p className="control">
              <a
                className="button is-link is-outlined"
                href="https://github.com/faergeek/js-webapp-template"
              >
                Get the source code
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

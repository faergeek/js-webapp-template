import * as css from './app.module.css';

const REPO_URL = 'https://github.com/faergeek/js-webapp-template';

export function App() {
  return (
    <>
      <h1>JS WebApp Template</h1>

      <p className={css.tagline}>
        A template to build web applications with bundling for both Node.js and
        browsers
      </p>

      <p>
        <a
          className={[css.btn, css.btn_solid].join(' ')}
          href={`${REPO_URL}/generate`}
        >
          Use it
        </a>

        <a className={css.btn} href={REPO_URL}>
          Sources
        </a>
      </p>
    </>
  );
}

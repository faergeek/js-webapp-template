const REPO_URL = 'https://github.com/faergeek/js-webapp-template';

export function App() {
  return (
    <>
      <h1 className="title">JS WebApp Template</h1>

      <p className="tagline">
        A template to build web applications with bundling for both Node.js and
        browsers
      </p>

      <p>
        <a className="btn btn_theme_solid" href={`${REPO_URL}/generate`}>
          Use it
        </a>

        <a className="btn btn_theme_outlined" href={REPO_URL}>
          Sources
        </a>
      </p>
    </>
  );
}

import css from './app.module.sass';

export function App() {
  return (
    <div className={[css.hero, css.isPrimary].join(' ')}>
      <div className={css.heroBody}>
        <div className={css.container}>
          <p className={css.title}>JS WebApp Template</p>

          <p className={css.subtitle}>
            Template to build web applications with bundling for both Node.js
            and browsers
          </p>

          <div
            className={[css.field, css.isGrouped, css.isGroupedCentered].join(
              ' '
            )}
          >
            <p className={css.control}>
              <a
                className={[css.button, css.isLink].join(' ')}
                href="https://github.com/faergeek/js-webapp-template/generate"
              >
                Use this template
              </a>
            </p>

            <p className={css.control}>
              <a
                className={[css.button, css.isLink, css.isOutlined].join(' ')}
                href="https://github.com/faergeek/js-webapp-template"
              >
                Get the source code
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

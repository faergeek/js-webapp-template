import * as css from './container.module.css';

export function Container({ children }: { children: React.ReactNode }) {
  return <div className={css.container}>{children}</div>;
}

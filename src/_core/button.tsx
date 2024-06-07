import clsx from 'clsx';

import * as css from './button.module.css';

export function Button<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'button',
>(
  props: ({ as?: 'button' } | { as: T }) & {
    [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K];
  },
) {
  let propsCopy = props;

  if (typeof propsCopy.as === 'string') {
    propsCopy = { ...props };

    if (propsCopy.as === 'button') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (propsCopy as any).type = 'button';
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (propsCopy as any).role = 'button';
    }
  }

  const { as: As = 'button', className, ...otherProps } = propsCopy;

  return <As {...otherProps} className={clsx(className, css.btn)} />;
}

import clsx from 'clsx';
import type { JSX } from 'react';

import * as css from './button.module.css';

export function Button<
  T extends
    | keyof JSX.IntrinsicElements
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | React.ComponentType<any> = 'button',
>(
  props: {
    [K in keyof React.ComponentProps<T>]: React.ComponentProps<T>[K];
  } & {
    as?: T;
  },
) {
  if (!props.as || props.as === 'button') props = { type: 'button', ...props };
  const { as: As = 'button', className, ...otherProps } = props;

  return <As {...otherProps} className={clsx(className, css.btn)} />;
}

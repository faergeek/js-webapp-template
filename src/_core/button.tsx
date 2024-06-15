import clsx from 'clsx';

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
  if (typeof props.as === 'string') {
    if (props.as === 'button') {
      props = { ...props, type: 'button' };
    } else {
      props = { ...props, role: 'button' };
    }
  }

  const { as: As = 'button', className, ...otherProps } = props;

  return <As {...otherProps} className={clsx(className, css.btn)} />;
}

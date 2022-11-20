import { Link } from 'react-router-dom';

import * as css from './button.module.css';

type Props = {
  children?: React.ReactNode;
  disabled?: boolean;
} & (
  | {
      as?: 'button' | undefined;
      type?: 'button' | 'reset' | 'submit';
      onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    }
  | {
      as: 'a';
      download?: boolean | string;
      href: string;
      rel?: string;
      target?: string;
      onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    }
  | {
      as: typeof Link;
      to: string;
      onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    }
);

export function Button(props: Props) {
  const allProps = {
    ...props,
    className: css.btn,
  };

  switch (allProps.as) {
    case Link: {
      const { as, ...otherProps } = allProps;

      // eslint-disable-next-line react/jsx-no-target-blank
      return <Link {...otherProps} role="button" />;
    }
    case 'a': {
      const { as, ...otherProps } = allProps;

      // eslint-disable-next-line react/jsx-no-target-blank
      return <a {...otherProps} role="button" />;
    }
    case 'button':
    case undefined: {
      const { as, type = 'button', ...otherProps } = allProps;

      return <button {...otherProps} type={type} />;
    }
    default:
      throw new Error(
        `Unexpected 'as' prop value: ${
          typeof allProps.as === 'string' ? allProps.as : allProps.as.name
        }`
      );
  }
}

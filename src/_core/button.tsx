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
);

export function Button(props: Props) {
  const allProps = {
    ...props,
    className: css.btn,
  };

  switch (allProps.as) {
    case 'a': {
      const { as, ...otherProps } = allProps;

      // eslint-disable-next-line react/jsx-no-target-blank
      return <a {...otherProps} role="button" />;
    }
    case 'button':
    default: {
      const { as, type = 'button', ...otherProps } = allProps;

      return <button {...otherProps} type={type} />;
    }
  }
}

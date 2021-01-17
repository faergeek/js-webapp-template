import * as React from 'react';

import { useRouter } from './routerContext';

export function Link({ hash, params, query, target, to, ...otherProps }) {
  const router = useRouter();
  const url = router.url({ hash, name: to, query, params });

  return (
    <a
      {...otherProps}
      href={url}
      target={target}
      onClick={event => {
        if (
          target ||
          event.button !== 0 ||
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey
        ) {
          return;
        }

        event.preventDefault();
        router.navigate({ url });
      }}
    />
  );
}

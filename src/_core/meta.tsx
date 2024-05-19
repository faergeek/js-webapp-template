import { useMemo } from 'react';
import type { Location, Params } from 'react-router-dom';
import { useLocation, useMatches } from 'react-router-dom';

import { useEntryContext } from '../entry';

export interface MetaFunctionArgs<T = unknown> {
  data: T | undefined;
  error: unknown;
  params: Params;
  location: Location;
}

export interface MetaDescriptor {
  title?: string;
  [name: string]:
    | null
    | string
    | undefined
    | Record<string, string>
    | Array<Record<string, string> | string>;
}

export function Meta() {
  const { routerState } = useEntryContext();
  const { errors, loaderData } = routerState;
  const location = useLocation();
  const matches = useMatches();

  const meta = useMemo(
    () =>
      matches.reduce<MetaDescriptor>((acc, { handle, params, id }) => {
        if (
          handle !== null &&
          typeof handle === 'object' &&
          'meta' in handle &&
          handle.meta != null
        ) {
          if (typeof handle.meta === 'function') {
            return Object.assign(
              acc,
              handle.meta({
                data: loaderData?.[id],
                error: errors?.[id],
                location,
                params,
              }),
            );
          } else if (typeof handle.meta === 'object') {
            return Object.assign(acc, handle.meta);
          }
        }

        return acc;
      }, {}),
    [errors, loaderData, location, matches],
  );

  if (!meta) {
    return null;
  }

  return (
    <>
      {Object.entries(meta).map(([name, value]) => {
        if (!value) {
          return null;
        }

        if (name === 'title') {
          return <title key="title">{String(value)}</title>;
        }

        return [value].flat().map(content => {
          if (/^(og|music|video|article|book|profile|fb):.+$/.test(name)) {
            return (
              <meta
                key={name + content}
                property={name}
                content={content as string}
              />
            );
          }

          if (typeof content === 'string') {
            return <meta key={name + content} name={name} content={content} />;
          }

          return <meta key={name + JSON.stringify(content)} {...content} />;
        });
      })}
    </>
  );
}

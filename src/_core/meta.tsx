import { useMemo } from 'react';
import {
  type Location,
  matchRoutes,
  type Params,
  useLocation,
} from 'react-router-dom';

import { useEntryContext } from '../entry';
import { routes } from '../routes';

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
  const location = useLocation();

  const meta = useMemo(() => {
    const matches = matchRoutes(routes, location);
    const { errors, loaderData } = routerState;

    return matches?.reduce<MetaDescriptor>((acc, { params, route }) => {
      if (route.meta) {
        let routeMeta: MetaDescriptor | void;

        if (typeof route.meta === 'function') {
          if (loaderData && route.id in loaderData) {
            routeMeta = route.meta({
              data: loaderData[route.id],
              error: undefined,
              location,
              params,
            });
          } else if (errors && route.id in errors) {
            routeMeta = route.meta({
              data: loaderData?.[route.id],
              error: errors[route.id],
              location,
              params,
            });
          }
        } else {
          routeMeta = route.meta;
        }

        return Object.assign(acc, routeMeta);
      }

      return acc;
    }, {});
  }, [routerState, location]);

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

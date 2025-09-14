import { readdir } from 'node:fs/promises';
import * as path from 'node:path';

import invariant from 'tiny-invariant';
import webpack from 'webpack';

import { parseSegments } from './parseSegments.ts';

interface RouteModuleFileEager {
  identifier: string;
  exports: Set<'Component' | 'ErrorBoundary' | 'action' | 'loader'>;
}

interface RouteModuleFileLazy {
  chunkName: string;
  importSpecifier: string;
}

interface RouteModuleFile {
  eager?: RouteModuleFileEager;
  lazy?: RouteModuleFileLazy;
}

interface RouteModule {
  loader?: string;
  action?: string;
  Component?: string;
  ErrorBoundary?: string;
  lazy?: string;
  lazyChunkName?: string;
}

type RouteMapEntry =
  | { index: true; routeModule: RouteModule }
  | { index?: false; routeModule: RouteModule; nested?: RouteMap }
  | { index?: false; routeModule?: undefined; nested: RouteMap };

type RouteMap = Map<string | undefined, RouteMapEntry>;

interface RouteObjectCommon extends RouteModule {
  path?: string;
}

interface NonIndexRouteObject extends RouteObjectCommon {
  children?: RouteObject[];
}

interface IndexRouteObject extends RouteObjectCommon {
  children?: undefined;
  index: true;
}

type RouteObject = NonIndexRouteObject | IndexRouteObject;

function nest(
  map: RouteMap,
  [first, ...rest]: Array<string | undefined>,
  routeModule: RouteModule,
) {
  const existingEntry = map.get(first);

  if (first == null) {
    if (existingEntry) throw new Error('route conflict');
    map.set(undefined, { index: true, routeModule });
    return;
  }

  if (rest.length === 0) {
    if (existingEntry?.routeModule) throw new Error('route conflict');
    map.set(first, { routeModule, nested: existingEntry?.nested });
    return;
  }

  if (existingEntry?.index) {
    throw new Error('trying to nest into an index route');
  }

  if (existingEntry) {
    existingEntry.nested ??= new Map();
    nest(existingEntry.nested, rest, routeModule);
    return;
  }

  const nested: RouteMap = new Map();
  nest(nested, rest, routeModule);
  map.set(first, { nested });
}

function entryToRoutes([routePath, entry]: [
  string | undefined,
  RouteMapEntry,
]): RouteObject[] {
  if (entry.index) {
    const route: IndexRouteObject = {
      index: true,
      ...entry.routeModule,
    };

    if (routePath) route.path = routePath;

    return [route];
  }

  if (entry.routeModule) {
    const route: NonIndexRouteObject = entry.routeModule;
    if (routePath) route.path = routePath;

    if (entry.nested) {
      route.children = Array.from(entry.nested).flatMap(entryToRoutes);
    }

    return [route];
  }

  const children = Array.from(entry.nested).flatMap(entryToRoutes);
  if (!routePath) return children;

  return children.map(child => ({
    ...child,
    path: [routePath, child.path].join('/'),
  }));
}

function renderRouteArrayItems(routes: RouteObject[], pieces: string[]) {
  for (const route of routes) {
    pieces.push('{');

    if (route.path) {
      pieces.push(`path: '${route.path}',`);
    }

    if ('index' in route && route.index) {
      pieces.push('index: true,');
    }

    const keys = ['loader', 'action', 'Component', 'ErrorBoundary'] as const;

    for (const key of keys) {
      const value = route[key];
      if (value) pieces.push(`${key}: ${value},`);
    }

    if (route.lazy) {
      pieces.push(`lazy: ${route.lazy},`);
    }

    if (route.lazyChunkName) {
      pieces.push(`lazyChunkName: '${route.lazyChunkName}',`);
    }

    if (route.children) {
      pieces.push(`children: [`);
      renderRouteArrayItems(route.children, pieces);
      pieces.push('],');
    }

    pieces.push('},');
  }
}

function renderRouteArray(routes: RouteObject[]): string {
  const lines = ['['];
  renderRouteArrayItems(routes, lines);
  lines.push(']');

  return lines.join('\n');
}

export function virtualRoutes(dir: string): webpack.WebpackPluginInstance {
  return new webpack.experiments.schemes.VirtualUrlPlugin({
    routes: {
      source: async loaderContext => {
        const compilation = loaderContext._compilation;
        invariant(compilation);

        loaderContext.addContextDependency(dir);

        const eagerFiles: Set<string> = new Set();
        const lazyFiles: Set<string> = new Set();

        const allFiles = await readdir(dir);
        allFiles.forEach(file => {
          if (!file.endsWith('.ts') && !file.endsWith('.tsx')) return;

          if (file.endsWith('.lazy.ts') || file.endsWith('.lazy.tsx')) {
            lazyFiles.add(file);
          } else {
            eagerFiles.add(file);
          }
        });

        async function loadModule(file: string) {
          const mod = await new Promise<webpack.Module | undefined>(
            (resolve, reject) => {
              loaderContext.loadModule(
                path.resolve(dir, file),
                (err, _source, _sourceMap, result) =>
                  err ? reject(err) : resolve(result),
              );
            },
          );

          invariant(mod);

          return mod;
        }

        const routeModuleFiles: Map<string, RouteModuleFile> = new Map();

        const lines: string[] = [];

        for (const file of [...eagerFiles, ...lazyFiles]) {
          const routePath = eagerFiles.has(file)
            ? parseSegments(file.replace(/\.tsx?$/, '')).join('/')
            : parseSegments(
                file.replace(/\.tsx?$/, '').replace(/\.lazy$/, ''),
              ).join('/');

          let routeModuleFile = routeModuleFiles.get(routePath);
          if (!routeModuleFile) {
            routeModuleFile = {};
            routeModuleFiles.set(routePath, routeModuleFile);
          }

          const mod = await loadModule(file);
          invariant(mod instanceof webpack.NormalModule);

          if (eagerFiles.has(file)) {
            const identifier = file.replace(/[./[\]]/g, '_');
            lines.push(`import * as ${identifier} from '${mod.resource}';`);

            const exports = new Set(
              mod.dependencies
                .flatMap(dep => {
                  const x = dep.getExports(compilation.moduleGraph);
                  if (!x) return [];
                  invariant(Array.isArray(x.exports));

                  return x.exports;
                })
                .map(x => {
                  invariant(typeof x === 'string');
                  return x;
                })
                .filter(
                  x =>
                    x === 'Component' ||
                    x === 'ErrorBoundary' ||
                    x === 'action' ||
                    x === 'loader',
                ),
            );

            routeModuleFile.eager = {
              exports,
              identifier,
            };
          } else {
            routeModuleFile.lazy = {
              chunkName: file.replace(/\.tsx?$/, ''),
              importSpecifier: mod.resource,
            };
          }
        }

        const routeMap: RouteMap = new Map();

        for (const [routePath, { eager, lazy }] of routeModuleFiles) {
          const routeModule: RouteModule = {};

          if (eager) {
            Array.from(eager.exports).forEach(export_ => {
              routeModule[export_] = `${eager.identifier}.${export_}`;
            });
          }

          if (lazy) {
            routeModule.lazy = `() => import(/* webpackChunkName: "${lazy.chunkName}" */ '${lazy.importSpecifier}')`;
            routeModule.lazyChunkName = lazy.chunkName;
          }

          nest(
            routeMap,
            routePath
              .split('/')
              .map(key => (key === '_index' ? undefined : key)),
            routeModule,
          );
        }

        lines.push(
          `export default ${renderRouteArray(entryToRoutes([undefined, { nested: routeMap }]))};`,
        );

        return lines.join('\n');
      },
    },
  });
}

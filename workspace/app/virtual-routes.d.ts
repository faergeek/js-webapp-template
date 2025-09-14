declare module 'virtual:routes' {
  interface VirtualRouteModuleFile {
    Component?: React.ComponentType;
    ErrorBoundary?: React.ComponentType;
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    action?: import('react-router').ActionFunction;
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    loader?: import('react-router').LoaderFunction;
  }

  interface VirtualRouteModule extends VirtualRouteModuleFile {
    lazyChunkName?: string;
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    lazy?: import('react-router').LazyRouteFunction<VirtualRouteModuleFile>;
  }

  interface VirtualRouteObjectCommon extends VirtualRouteModule {
    path?: string;
  }

  export interface VirtualNonIndexRouteObject extends VirtualRouteObjectCommon {
    children?: VirtualRouteObject[];
  }

  export interface VirtualIndexRouteObject extends VirtualRouteObjectCommon {
    children?: undefined;
    index: true;
  }

  export type VirtualRouteObject =
    | VirtualNonIndexRouteObject
    | VirtualIndexRouteObject;

  const routes: VirtualRouteObject[];

  export default routes;
}

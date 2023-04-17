declare const __DEV__: boolean;
declare const __ENTRY_TARGET__: 'webPage' | 'node' | 'serviceWorker';

declare module '*.module.css' {
  const css: { [key: string]: string };
  export = css;
}

declare module 'assets.json' {
  interface Asset {
    path: string;
    immutable: boolean;
  }

  interface AssetRecord {
    auxiliary: Asset[];
    css: Asset[];
    js: Asset[];
  }

  const assets: {
    initial: Record<'main', AssetRecord>;
    async: Partial<Record<string, AssetRecord>>;
  };

  export default assets;
}

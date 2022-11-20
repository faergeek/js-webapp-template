declare const __DEV__: boolean;
declare const __NODE__: boolean;

declare module '*.module.css' {
  const css: { [key: string]: string };
  export = css;
}

declare module 'assets.json' {
  const assets: { main: { auxiliary: string[]; css: string[]; js: string[] } };
  export default assets;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
}

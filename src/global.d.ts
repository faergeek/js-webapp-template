declare const __DEV__: boolean;
declare const __NODE__: boolean;

declare module '*.module.css' {
  const css: { [key: string]: string };
  export = css;
}

declare const __DEV__: boolean;
declare const __NODE__: boolean;

declare module '*.module.css' {
  const css: { [key: string]: string };
  export default css;
}

declare module '*.module.sass' {
  const css: { [key: string]: string };
  export default css;
}

declare module '*.module.scss' {
  const css: { [key: string]: string };
  export default css;
}

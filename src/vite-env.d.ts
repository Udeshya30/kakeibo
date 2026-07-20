/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

declare module '*.module.scss' {
  const classNames: Readonly<Record<string, string>>;
  export default classNames;
}

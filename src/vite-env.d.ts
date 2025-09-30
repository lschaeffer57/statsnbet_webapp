/// <reference types="vite/client" />

declare module '*.svg' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  export const ReactComponent: React.FC<SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.svg?react' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  const Component: React.FC<SVGProps<SVGSVGElement>>;
  export default Component;
}

declare module '*.svg?svgr' {
  import * as React from 'react';
  import { SVGProps } from 'react';
  export const ReactComponent: React.FC<SVGProps<SVGSVGElement>>;
}

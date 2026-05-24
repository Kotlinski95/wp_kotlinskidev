export {};

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "@wordpress/block-editor" {
  export function useSettings(...paths: string[]): unknown[];

  interface ColorGradientControlProps {
    label?: string;
    colorValue?: string;
    gradientValue?: string;
    onColorChange?: (value: string | undefined) => void;
    onGradientChange?: (value: string | undefined) => void;
    clearable?: boolean;
    __experimentalIsRenderedInSidebar?: boolean;
    __nextHasNoMarginBottom?: boolean;
  }

  export const __experimentalColorGradientControl: import("react").FC<ColorGradientControlProps>;
}

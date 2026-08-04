import type { ComponentType } from "react";
import * as blockEditor from "@wordpress/block-editor";

export interface ColorGradientControlProps {
  label?: string;
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (value?: string) => void;
  onGradientChange: (value?: string) => void;
  clearable?: boolean;
  __nextHasNoMarginBottom?: boolean;
}

export const ColorGradientControl = (
  blockEditor as unknown as {
    __experimentalColorGradientControl: ComponentType<ColorGradientControlProps>;
  }
).__experimentalColorGradientControl;

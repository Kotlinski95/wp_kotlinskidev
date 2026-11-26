import type { ResponsiveDevice } from "@utils/responsive-breakpoints";

export type ResponsiveFontSize = {
  [Device in ResponsiveDevice]?: string;
} & {
  [Device in ResponsiveDevice as `${Device}Custom`]?: boolean;
} & {
  [Device in ResponsiveDevice as `${Device}Preset`]?: string;
} & {
  [Device in ResponsiveDevice as `${Device}CustomValue`]?: string;
};

export interface FontSizeOption {
  label: string;
  value: string;
}

export interface ThemeFontSize {
  name: string;
  slug: string;
  size: string;
}

export interface ResponsiveFontSizeAttributes {
  responsiveFontSize?: ResponsiveFontSize;
}

export interface FontSizeChange {
  value: string;
  isCustom?: boolean;
  presetValue?: string;
  customValue?: string;
}

import type { FeatureCanvasTrigger, FeatureCanvasVariant } from "./types";

export interface FeatureCardCanvasAttributes {
  variant: FeatureCanvasVariant;
  aspectRatio: string;
  labelOne: string;
  labelTwo: string;
  labelThree: string;
  description: string;
  accentColor: string;
  touchAutoplay: boolean;
  trigger: FeatureCanvasTrigger;
}

export interface PaletteEntry {
  name: string;
  slug: string;
  color: string;
}

import type { DrawFunction } from "./variant-loaders";
import type { FeatureCanvasPalette, FeatureCanvasVariant } from "./types";

export interface CanvasInstance {
  host: HTMLElement;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  variant: FeatureCanvasVariant;
  labels: readonly string[];
  accent: string;
  width: number;
  height: number;
  progress: number;
  target: number;
  visible: boolean;
  palette: FeatureCanvasPalette | null;
  time: number;
  drawFn: DrawFunction | null;
}

import type { CanvasLayer, CanvasRecipe } from "./types";

export interface Instance {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  recipe: CanvasRecipe;
  active: boolean;
  reducedMotion: boolean;
  width: number;
  height: number;
  colorCache: Map<string, string>;
  layerCaches: Map<CanvasLayer, Record<string, unknown>>;
  resizeObserver: ResizeObserver;
}

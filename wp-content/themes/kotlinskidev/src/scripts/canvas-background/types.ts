export type CanvasLayerParams = Record<string, number | string>;

export interface CanvasLayer {
  type: string;
  params: CanvasLayerParams;
}

export interface CanvasRecipe {
  layers: CanvasLayer[];
}

export interface CanvasDrawContext {
  width: number;
  height: number;
  time: number;
  params: CanvasLayerParams;
  resolveColor: (value: string) => string;
  cache: Record<string, unknown>;
}

export type CanvasLayerDraw = (
  ctx: CanvasRenderingContext2D,
  drawContext: CanvasDrawContext
) => void;

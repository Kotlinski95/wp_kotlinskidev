import type { CanvasLayerDraw } from "./types";
import gradientDraw from "./layers/gradient";
import noiseDraw from "./layers/noise";
import gridLinesDraw from "./layers/grid-lines";
import blobDraw from "./layers/blob";
import sweepDraw from "./layers/sweep";
import lightRaysDraw from "./layers/light-rays";
import curvedRaysDraw from "./layers/curved-rays";
import starFieldDraw from "./layers/star-field";
import orbitTrailsDraw from "./layers/orbit-trails";
import warpFieldDraw from "./layers/warp-field";
import nebulaDraw from "./layers/nebula";
import auroraDraw from "./layers/aurora";
import neonWavesDraw from "./layers/neon-waves";
import hexTilesDraw from "./layers/hex-tiles";
import deepFieldDraw from "./layers/deep-field";
import floatingPanelsDraw from "./layers/floating-panels";
import pleiadesDraw from "./layers/pleiades";

export const layerRegistry: Record<string, CanvasLayerDraw> = {
  gradient: gradientDraw,
  noise: noiseDraw,
  "grid-lines": gridLinesDraw,
  blob: blobDraw,
  sweep: sweepDraw,
  "light-rays": lightRaysDraw,
  "curved-rays": curvedRaysDraw,
  "star-field": starFieldDraw,
  "orbit-trails": orbitTrailsDraw,
  "warp-field": warpFieldDraw,
  nebula: nebulaDraw,
  aurora: auroraDraw,
  "neon-waves": neonWavesDraw,
  "hex-tiles": hexTilesDraw,
  "deep-field": deepFieldDraw,
  "floating-panels": floatingPanelsDraw,
  pleiades: pleiadesDraw,
};

import type { CanvasRecipe } from "./types";

export const HOST_SELECTOR = ".kt-canvas-bg[data-canvas-recipe]";

export const parseRecipe = (raw: string): CanvasRecipe | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { layers?: unknown }).layers)
    ) {
      return parsed as CanvasRecipe;
    }
  } catch {
    return null;
  }
  return null;
};

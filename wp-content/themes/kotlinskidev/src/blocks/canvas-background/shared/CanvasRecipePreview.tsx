import React, { useEffect, useRef } from "react";
import type { CanvasRecipe } from "../../../scripts/canvas-background/types";
import { createPreviewRenderer, type PreviewRenderer } from "./preview-renderer";

const STATIC_FRAME_TIME = 1200;

export interface CanvasRecipePreviewProps {
  recipe: CanvasRecipe;
  height?: number;
  animate?: boolean;
  className?: string;
}

function startAnimation(
  renderer: PreviewRenderer,
  canvas: HTMLCanvasElement,
  ownerWindow: Window
): () => void {
  let rafId: number | null = null;
  const tick = (time: number): void => {
    renderer.draw(time);
    rafId = ownerWindow.requestAnimationFrame(tick);
  };
  rafId = ownerWindow.requestAnimationFrame(tick);

  const resizeObserver = new ResizeObserver(() => {
    renderer.applySize();
  });
  resizeObserver.observe(canvas);

  return () => {
    if (rafId !== null) {
      ownerWindow.cancelAnimationFrame(rafId);
    }
    resizeObserver.disconnect();
  };
}

export default function CanvasRecipePreview({
  recipe,
  height = 140,
  animate = true,
  className,
}: CanvasRecipePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recipeRef = useRef(recipe);
  recipeRef.current = recipe;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement ?? canvas;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) {
      return undefined;
    }

    const ownerWindow = host.ownerDocument.defaultView ?? window;
    const reducedMotion = ownerWindow.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = createPreviewRenderer(canvas, ctx, () => recipeRef.current);

    renderer.applySize();

    if (!animate || reducedMotion) {
      renderer.draw(animate ? 0 : STATIC_FRAME_TIME);
      return undefined;
    }

    return startAnimation(renderer, canvas, ownerWindow);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: `${height}px` }}
    />
  );
}

import React, { useEffect, useRef } from "react";
import type { CanvasRecipe } from "../../../scripts/canvas-background/types";
import { layerRegistry } from "../../../scripts/canvas-background/registry";

const MAX_DPR = 2;
const STATIC_FRAME_TIME = 1200;

export interface CanvasRecipePreviewProps {
  recipe: CanvasRecipe;
  height?: number;
  animate?: boolean;
  className?: string;
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

    const ownerDocument = host.ownerDocument;
    const ownerWindow = ownerDocument.defaultView ?? window;
    const reducedMotion = ownerWindow.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const colorCache = new Map<string, string>();
    const layerCaches = new Map<number, Record<string, unknown>>();

    const resolveColor = (value: string): string => {
      if (!value) {
        return "#000000";
      }
      const cached = colorCache.get(value);
      if (cached) {
        return cached;
      }
      if (!value.includes("var(")) {
        colorCache.set(value, value);
        return value;
      }

      const probe = ownerDocument.createElement("span");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.color = value;
      host.appendChild(probe);
      const resolved = ownerWindow.getComputedStyle(probe).color || "#000000";
      host.removeChild(probe);
      colorCache.set(value, resolved);
      return resolved;
    };

    let width = 0;
    let drawHeight = 0;

    const applySize = (): void => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(ownerWindow.devicePixelRatio || 1, MAX_DPR);
      width = Math.max(1, Math.round(rect.width));
      drawHeight = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(drawHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number): void => {
      ctx.clearRect(0, 0, width, drawHeight);
      recipeRef.current.layers.forEach((layer, index) => {
        const drawFn = layerRegistry[layer.type];
        if (!drawFn) {
          return;
        }
        const layerCache = layerCaches.get(index) ?? {};
        layerCaches.set(index, layerCache);
        drawFn(ctx, {
          width,
          height: drawHeight,
          time,
          params: layer.params,
          resolveColor,
          cache: layerCache,
        });
      });
    };

    applySize();

    if (!animate || reducedMotion) {
      draw(animate ? 0 : STATIC_FRAME_TIME);
      return undefined;
    }

    let rafId: number | null = null;
    const tick = (time: number): void => {
      draw(time);
      rafId = ownerWindow.requestAnimationFrame(tick);
    };
    rafId = ownerWindow.requestAnimationFrame(tick);

    const resizeObserver = new ResizeObserver(() => {
      applySize();
    });
    resizeObserver.observe(canvas);

    return () => {
      if (rafId !== null) {
        ownerWindow.cancelAnimationFrame(rafId);
      }
      resizeObserver.disconnect();
    };
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

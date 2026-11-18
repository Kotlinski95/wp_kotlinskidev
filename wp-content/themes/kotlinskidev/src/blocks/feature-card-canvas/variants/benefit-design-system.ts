import { easeOutCubic, staggerProgress } from "../easing";
import { fitArea, lerpRect } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const SCATTER: ReadonlyArray<readonly [number, number]> = [
  [-0.04, 0.1],
  [0.12, -0.14],
  [-0.1, 0.06],
  [0.07, -0.08],
];
const HANDLES = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
] as const;

export const drawBenefitDesignSystem = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);

  const swatches = [
    palette.accent,
    palette.accentGlow,
    palette.strong,
    palette.muted,
    palette.line,
  ];
  const swatchR = area.h * 0.075;
  swatches.forEach((color, index) => {
    dot(ctx, area.x + swatchR + index * swatchR * 2.5, area.y + swatchR, swatchR, rgba(color, 1));
  });

  const gridW = area.w * 0.62;
  const gap = area.w * 0.04;
  const tileW = (gridW - gap) / 2;
  const tileH = area.h * 0.32;
  const gridTop = area.y + area.h * 0.28;

  const frame: Rect = {
    x: area.x + area.w * 0.78,
    y: area.y + area.h * 0.36,
    w: area.w * 0.22,
    h: area.h * 0.36,
  };
  const from = { x: area.x + gridW, y: gridTop + tileH + gap / 2 };
  const to = { x: frame.x, y: frame.y + frame.h / 2 };
  const reach = easeOutCubic(progress);
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.lineDashOffset = progress > 0 ? -time / 60 : 0;
  ctx.strokeStyle = tint(palette, progress);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(from.x + (to.x - from.x) * reach, from.y + (to.y - from.y) * reach);
  ctx.stroke();
  ctx.setLineDash([]);

  roundedRectPath(ctx, frame, 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  const handle = Math.max(3, area.h * 0.045);
  HANDLES.forEach(([hx, hy]) => {
    const rect = {
      x: frame.x + hx * frame.w - handle / 2,
      y: frame.y + hy * frame.h - handle / 2,
      w: handle,
      h: handle,
    };
    fillRounded(ctx, rect, 1, rgba(palette.surface, 1));
    roundedRectPath(ctx, rect, 1);
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  SCATTER.forEach(([dx, dy], index) => {
    const home: Rect = {
      x: area.x + (index % 2) * (tileW + gap),
      y: gridTop + Math.floor(index / 2) * (tileH + gap),
      w: tileW,
      h: tileH,
    };
    const away: Rect = { ...home, x: home.x + dx * area.w, y: home.y + dy * area.h };
    const snap = easeOutCubic(staggerProgress(progress, index, SCATTER.length, 0.5));
    const tile = lerpRect(away, home, snap);
    fillRounded(ctx, tile, 5, rgba(palette.surface, 1));
    roundedRectPath(ctx, tile, 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.line, 0.9);
    ctx.stroke();
    const cx = tile.x + tile.w / 2;
    const cy = tile.y + tile.h / 2;
    const accent = tint(palette, snap, 0.5 + 0.45 * snap);
    if (index === 0) {
      pill(ctx, cx - tile.w * 0.3, cy - tile.h * 0.15, tile.w * 0.6, tile.h * 0.3, accent);
    } else if (index === 1) {
      const field = {
        x: cx - tile.w * 0.34,
        y: cy - tile.h * 0.14,
        w: tile.w * 0.68,
        h: tile.h * 0.28,
      };
      roundedRectPath(ctx, field, 3);
      ctx.strokeStyle = accent;
      ctx.stroke();
      pill(ctx, field.x + field.w * 0.12, cy - tile.h * 0.05, field.w * 0.3, tile.h * 0.1, soft);
    } else if (index === 2) {
      pill(
        ctx,
        tile.x + tile.w * 0.14,
        tile.y + tile.h * 0.2,
        tile.w * 0.72,
        tile.h * 0.28,
        accent
      );
      pill(ctx, tile.x + tile.w * 0.14, tile.y + tile.h * 0.6, tile.w * 0.5, tile.h * 0.1, soft);
    } else {
      const trackH = tile.h * 0.26;
      pill(ctx, cx - tile.w * 0.22, cy - trackH / 2, tile.w * 0.44, trackH, accent);
      dot(
        ctx,
        cx - tile.w * 0.22 + trackH / 2 + tile.w * 0.22 * snap,
        cy,
        trackH * 0.38,
        rgba(palette.surface, 1)
      );
    }
  });
};

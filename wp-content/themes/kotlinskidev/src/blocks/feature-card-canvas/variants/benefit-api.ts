import { clamp01 } from "../easing";
import { fitArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Point } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const FALLBACK_LABELS = ["CMS", "GraphQL", "API"] as const;
const NODES: readonly Point[] = [
  { x: 0.13, y: 0.17 },
  { x: 0.87, y: 0.17 },
  { x: 0.87, y: 0.8 },
];

export const drawBenefitApi = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const at = (point: Point): Point => ({
    x: area.x + point.x * area.w,
    y: area.y + point.y * area.h,
  });
  const centre = at({ x: 0.5, y: 0.47 });
  const nodeW = area.w * 0.27;
  const nodeH = area.h * 0.18;
  const phases = NODES.map((_node, index) =>
    progress > 0 ? (time / 1600 + index / NODES.length) % 1 : 0
  );

  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.setLineDash([4, 3]);
  ctx.strokeStyle = tint(palette, progress);
  NODES.forEach((node) => {
    const end = at(node);
    ctx.beginPath();
    ctx.moveTo(centre.x, centre.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  ctx.font = `${Math.round(area.h * 0.07)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  NODES.forEach((node, index) => {
    const p = at(node);
    const rect = { x: p.x - nodeW / 2, y: p.y - nodeH / 2, w: nodeW, h: nodeH };
    fillRounded(ctx, rect, 5, rgba(palette.surface, 1));
    roundedRectPath(ctx, rect, 5);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.line, 0.9);
    ctx.stroke();
    ctx.fillStyle = rgba(palette.strong, 1);
    ctx.fillText(labels[index] || FALLBACK_LABELS[index], p.x, p.y + 1);
  });

  const hub = {
    x: centre.x - nodeW * 0.45,
    y: centre.y - nodeH * 0.7,
    w: nodeW * 0.9,
    h: nodeH * 1.4,
  };
  fillRounded(ctx, hub, 6, rgba(palette.surface, 1));
  roundedRectPath(ctx, hub, 6);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  pill(ctx, hub.x + hub.w * 0.15, hub.y + hub.h * 0.25, hub.w * 0.7, hub.h * 0.12, soft);
  pill(ctx, hub.x + hub.w * 0.15, hub.y + hub.h * 0.5, hub.w * 0.45, hub.h * 0.12, soft);

  let pulse = 0;
  if (progress > 0) {
    NODES.forEach((node, index) => {
      const phase = phases[index];
      const travel = clamp01(phase < 0.5 ? phase * 2 : 2 - phase * 2);
      const end = at(node);
      dot(
        ctx,
        centre.x + (end.x - centre.x) * travel,
        centre.y + (end.y - centre.y) * travel,
        Math.max(2, area.h * 0.028),
        rgba(palette.accent, progress)
      );
      pulse = Math.max(pulse, phase < 0.15 ? 1 - phase / 0.15 : 0);
    });
  }

  const json = { x: area.x, y: area.y + area.h * 0.62, w: area.w * 0.36, h: area.h * 0.38 };
  fillRounded(ctx, json, 5, rgba(palette.surface, 1));
  fillRounded(ctx, json, 5, rgba(palette.accent, 0.2 * pulse * progress));
  roundedRectPath(ctx, json, 5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, pulse * progress, 0.9);
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.font = `bold ${Math.round(area.h * 0.09)}px monospace`;
  ctx.fillStyle = tint(palette, progress);
  ctx.fillText("{", json.x + json.w * 0.1, json.y + json.h * 0.2);
  ctx.textAlign = "right";
  ctx.fillText("}", json.x + json.w * 0.9, json.y + json.h * 0.82);
  pill(ctx, json.x + json.w * 0.25, json.y + json.h * 0.34, json.w * 0.5, json.h * 0.08, soft);
  pill(ctx, json.x + json.w * 0.25, json.y + json.h * 0.5, json.w * 0.35, json.h * 0.08, soft);
  pill(ctx, json.x + json.w * 0.25, json.y + json.h * 0.66, json.w * 0.45, json.h * 0.08, soft);
};

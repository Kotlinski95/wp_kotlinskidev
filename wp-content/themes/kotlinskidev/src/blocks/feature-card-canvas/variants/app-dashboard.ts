import { fitArea } from "../geometry";
import { mixRgb, rgba } from "../palette";
import type { DrawContext, Point } from "../types";
import { dot, fillRounded, pill, roundedRectPath, tint } from "./shared";

const KPI_TARGETS = [1284, 342, 98] as const;
const KPI_SUFFIX = ["", "", "%"] as const;
const VALUES = [0.3, 0.45, 0.38, 0.6, 0.52, 0.75, 0.7, 0.92];
const DASH: number[] = [3, 3];
const NO_DASH: number[] = [];

export const drawAppDashboard = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const strong = rgba(palette.strong, 0.5);
  const tile = rgba(palette.line, 0.35);
  fillRounded(ctx, area, 8, rgba(palette.surface, 1));
  roundedRectPath(ctx, area, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(mixRgb(palette.line, palette.accent, progress), 1);
  ctx.stroke();

  const side = area.w * 0.12;
  for (let index = 0; index < 4; index += 1) {
    const size = side * 0.42;
    fillRounded(
      ctx,
      {
        x: area.x + (side - size) / 2,
        y: area.y + area.h * 0.12 + index * size * 1.7,
        w: size,
        h: size,
      },
      3,
      index === 0 ? tint(palette, progress) : soft
    );
  }
  const topH = area.h * 0.12;
  const bx = area.x + side;
  const bw = area.w - side - area.w * 0.04;
  pill(ctx, bx, area.y + topH * 0.3, bw * 0.3, topH * 0.4, strong);
  dot(ctx, area.x + area.w - area.w * 0.04 - topH * 0.2, area.y + topH / 2, topH * 0.25, soft);

  const gap = bw * 0.03;
  const kpiW = (bw - gap * 2) / 3;
  const kpiY = area.y + topH * 1.3;
  const kpiH = area.h * 0.24;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(kpiH * 0.36)}px monospace`;
  KPI_TARGETS.forEach((target, index) => {
    const x = bx + index * (kpiW + gap);
    fillRounded(ctx, { x, y: kpiY, w: kpiW, h: kpiH }, 5, tile);
    pill(ctx, x + kpiW * 0.12, kpiY + kpiH * 0.2, kpiW * 0.4, kpiH * 0.1, soft);
    ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accentGlow, progress), 1);
    ctx.fillText(
      `${Math.round(target * progress)}${KPI_SUFFIX[index]}`,
      x + kpiW * 0.12,
      kpiY + kpiH * 0.65
    );
  });

  const chartX = bx;
  const chartW = bw * 0.62;
  const chartTop = kpiY + kpiH + area.h * 0.06;
  const chartBase = area.y + area.h * 0.94;
  const chartH = chartBase - chartTop;
  ctx.strokeStyle = rgba(palette.line, 0.7);
  ctx.beginPath();
  ctx.moveTo(chartX, chartBase);
  ctx.lineTo(chartX + chartW, chartBase);
  ctx.moveTo(chartX, chartTop + chartH * 0.5);
  ctx.lineTo(chartX + chartW, chartTop + chartH * 0.5);
  ctx.stroke();

  const segments = VALUES.length - 1;
  const reach = progress * segments;
  const whole = Math.min(segments, Math.floor(reach));
  const full: Point[] = VALUES.map((value, index) => ({
    x: chartX + (chartW * index) / segments,
    y: chartBase - chartH * value,
  }));
  const points = full.slice(0, whole + 1);
  if (whole < segments && reach > whole) {
    const f = reach - whole;
    points.push({
      x: full[whole].x + (full[whole + 1].x - full[whole].x) * f,
      y: full[whole].y + (full[whole + 1].y - full[whole].y) * f,
    });
  }
  if (progress > 0 && points.length > 1) {
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.moveTo(points[0].x, chartBase);
    points.forEach((point) => ctx.lineTo(point.x, point.y));
    ctx.lineTo(last.x, chartBase);
    ctx.closePath();
    ctx.fillStyle = rgba(palette.accent, 0.16);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.strokeStyle = tint(palette, progress);
    ctx.beginPath();
    points.forEach((point, index) =>
      index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y)
    );
    ctx.stroke();
    dot(ctx, last.x, last.y, 3.5, rgba(palette.accentGlow, 1));
  }

  const panel = {
    x: chartX + chartW + bw * 0.05,
    y: chartTop,
    w: bw - chartW - bw * 0.05,
    h: chartH,
  };
  fillRounded(ctx, panel, 5, tile);
  const ay = panel.y + panel.h * 0.5;
  const ax = panel.x + panel.w * 0.2;
  const bxNode = panel.x + panel.w * 0.8;
  ctx.lineWidth = 1.5;
  ctx.setLineDash(DASH);
  ctx.strokeStyle = tint(palette, progress);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bxNode, ay);
  ctx.stroke();
  ctx.setLineDash(NO_DASH);
  dot(ctx, ax, ay, panel.h * 0.12, tint(palette, progress));
  dot(ctx, bxNode, ay, panel.h * 0.12, tint(palette, progress));
  if (progress > 0) {
    const t = (time / 1100) % 1;
    dot(
      ctx,
      ax + (bxNode - ax) * t,
      ay,
      panel.h * 0.07,
      rgba(palette.accentGlow, 1 - Math.abs(2 * t - 1) * 0.5)
    );
  }
  pill(
    ctx,
    panel.x + panel.w * 0.15,
    panel.y + panel.h * 0.14,
    panel.w * 0.5,
    panel.h * 0.07,
    soft
  );
};

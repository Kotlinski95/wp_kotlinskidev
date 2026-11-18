import { mixRgb, rgba } from "../palette";
import { chartPoints } from "../geometry";
import type { DrawContext } from "../types";

export const drawChartGrowth = ({ ctx, width, height, progress, palette }: DrawContext): void => {
  ctx.clearRect(0, 0, width, height);
  const chart = chartPoints(width, height, progress);

  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.strong, 0.55);
  ctx.beginPath();
  ctx.moveTo(chart.left, chart.top);
  ctx.lineTo(chart.left, chart.baseline);
  ctx.lineTo(chart.right, chart.baseline);
  ctx.stroke();

  ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accent, progress), 0.28 + 0.2 * progress);
  chart.bars.forEach((bar) => {
    ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  });

  if (chart.line.length < 2) {
    return;
  }
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(mixRgb(palette.strong, palette.accent, progress), 1);
  ctx.beginPath();
  chart.line.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.stroke();

  const end = chart.line[chart.line.length - 1];
  ctx.beginPath();
  ctx.arc(end.x, end.y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accentGlow, progress), 1);
  ctx.fill();
};

import { staggerProgress } from "../easing";
import { GAUGE_PILLS, GAUGE_START, GAUGE_SWEEP, gaugeAngle, gaugeLayout } from "../geometry";
import { mixRgb, rgba } from "../palette";
import type { DrawContext } from "../types";
import { roundedRectPath } from "./shared";

const FALLBACK_LABELS = ["LCP", "INP", "CLS"] as const;
const REST_FRACTION = 0.12;
const TARGET_FRACTION = 0.98;
const TICKS = 21;
const MAJOR_EVERY = 4;

export const drawSpeedGauge = (dc: DrawContext): void => {
  const { ctx, width, height, progress, palette, labels } = dc;
  ctx.clearRect(0, 0, width, height);
  const { cx, cy, radius, pills } = gaugeLayout(width, height);
  const end = GAUGE_START + GAUGE_SWEEP;

  const fraction = REST_FRACTION + (TARGET_FRACTION - REST_FRACTION) * progress;
  const angle = gaugeAngle(fraction);

  ctx.lineCap = "round";
  ctx.lineWidth = radius * 0.09;
  ctx.strokeStyle = rgba(palette.line, 0.8);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.92, GAUGE_START, end);
  ctx.stroke();

  ctx.lineCap = "butt";
  ctx.lineWidth = 1;
  ctx.strokeStyle = rgba(palette.strong, 0.5);
  ctx.beginPath();
  for (let tick = 0; tick < TICKS; tick += 1) {
    const a = GAUGE_START + (GAUGE_SWEEP * tick) / (TICKS - 1);
    const inner = tick % MAJOR_EVERY === 0 ? 0.68 : 0.74;
    ctx.moveTo(cx + Math.cos(a) * radius * inner, cy + Math.sin(a) * radius * inner);
    ctx.lineTo(cx + Math.cos(a) * radius * 0.8, cy + Math.sin(a) * radius * 0.8);
  }
  ctx.stroke();

  if (progress > 0) {
    ctx.lineCap = "round";
    ctx.lineWidth = radius * 0.09;
    ctx.strokeStyle = rgba(mixRgb(palette.strong, palette.accent, progress), 1);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.92, GAUGE_START, angle);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(angle) * radius * 0.92,
      cy + Math.sin(angle) * radius * 0.92,
      radius * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = rgba(palette.accentGlow, 0.3 * progress);
    ctx.fill();
  }

  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(2, radius * 0.035);
  ctx.strokeStyle = rgba(mixRgb(palette.strong, palette.accent, progress), 1);
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle) * radius * 0.62, cy + Math.sin(angle) * radius * 0.62);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.07, 0, Math.PI * 2);
  ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accent, progress), 1);
  ctx.fill();

  ctx.font = `bold ${Math.round(radius * 0.46)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(mixRgb(palette.strong, palette.accentGlow, progress), 1);
  ctx.fillText(String(Math.round(fraction * 100)), cx, cy + radius * 0.34);

  ctx.font = `${Math.round(pills[0].h * 0.42)}px monospace`;
  ctx.textAlign = "left";
  for (let index = 0; index < GAUGE_PILLS; index += 1) {
    const pill = pills[index];
    const local = staggerProgress(progress, index, GAUGE_PILLS, 0.45);
    ctx.save();
    ctx.globalAlpha = 0.45 + 0.55 * local;
    ctx.translate(0, (1 - local) * pill.h * 0.5);
    roundedRectPath(ctx, pill, pill.h / 2);
    ctx.fillStyle = rgba(palette.surface, 1);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.strong, 0.45);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pill.x + pill.h * 0.5, pill.y + pill.h / 2, pill.h * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = rgba(mixRgb(palette.muted, palette.accent, local), 1);
    ctx.fill();
    ctx.fillStyle = rgba(palette.strong, 1);
    ctx.fillText(
      labels[index] || FALLBACK_LABELS[index],
      pill.x + pill.h * 0.85,
      pill.y + pill.h / 2 + 0.5
    );
    ctx.restore();
  }
};

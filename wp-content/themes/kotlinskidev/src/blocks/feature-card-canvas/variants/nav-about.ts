import { clamp01, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import { circlePath, dot, drawLabel, fillRounded, pill, roundedRectPath, tint } from "./shared";

interface Scene {
  dc: DrawContext;
  area: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  font: number;
}

const CODE_LINES: ReadonlyArray<readonly [number, readonly number[]]> = [
  [0, [0.16, 0.22, 0.3]],
  [1, [0.12, 0.34]],
  [1, [0.2, 0.18, 0.26]],
  [2, [0.3, 0.2]],
  [0, [0.14, 0.2]],
];
const SKILLS: ReadonlyArray<ReadonlyArray<string>> = [
  ["React", "Angular", "Next.js"],
  ["WordPress", "TypeScript"],
];
const STATS: ReadonlyArray<readonly [number, string]> = [
  [5, "years"],
  [20, "projects"],
];
const MILESTONES = [
  ["2019", "Start"],
  ["2021", "Agency"],
  ["2023", "Senior"],
  ["2025", "Today"],
] as const;
const TYPE_MS = 4200;
const SKILL_BASE_Y = 0.46;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const lastLineFrac = (progress: number, loop: number): number =>
  progress >= 1 ? seg(loop, 0, 0.6) : seg(progress, 0.55, 0.9);

const createScene = (dc: DrawContext): Scene => {
  const full = fitFullArea(dc.width, dc.height);
  const inset = Math.round(Math.min(dc.width, dc.height) * 0.05);
  const area: Rect = {
    x: full.x + inset,
    y: full.y + inset,
    w: full.w - inset * 2,
    h: full.h - inset,
  };
  const { palette } = dc;
  return {
    dc,
    area,
    box: (u, v, w, h) => ({
      x: area.x + u * area.w,
      y: area.y + v * area.h,
      w: w * area.w,
      h: h * area.h,
    }),
    faint: rgba(palette.muted, 0.2),
    soft: rgba(palette.muted, 0.4),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    font: Math.max(7, area.h * 0.04),
  };
};

const drawAvatar = (scene: Scene): void => {
  const { dc, area, faint, soft, ink, muted, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const r = area.h * 0.13;
  const cx = area.x + r * 1.15;
  const cy = area.y + r * 1.15;
  const ring = easeOutCubic(seg(progress, 0, 0.5));
  circlePath(ctx, cx, cy, r);
  ctx.fillStyle = faint;
  ctx.fill();
  ctx.save();
  circlePath(ctx, cx, cy, r);
  ctx.clip();
  dot(ctx, cx, cy - r * 0.2, r * 0.34, soft);
  ctx.beginPath();
  ctx.ellipse(cx, cy + r * 0.95, r * 0.82, r * 0.62, 0, 0, Math.PI * 2);
  ctx.fillStyle = soft;
  ctx.fill();
  ctx.restore();
  ctx.lineWidth = Math.max(2, r * 0.1);
  ctx.lineCap = "round";
  circlePath(ctx, cx, cy, r * 1.12);
  ctx.strokeStyle = rgba(palette.line, 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ring);
  ctx.strokeStyle = tint(palette, ring);
  ctx.stroke();
  dot(
    ctx,
    cx + r * 0.85,
    cy + r * 0.85,
    r * 0.16 * (1 + 0.15 * Math.sin(time / 400) * progress),
    tint(palette, ring)
  );
  const tx = cx + r * 1.55;
  const slide = easeOutCubic(seg(progress, 0.1, 0.5));
  ctx.globalAlpha = 0.3 + 0.7 * slide;
  const nameWidth = Math.max(0, Math.min(area.w * 0.2, area.x + area.w * 0.46 - tx - 10));
  pill(ctx, tx, cy - r * 0.78, nameWidth, font * 0.9, ink);
  drawLabel(ctx, "Frontend", tx, cy - r * 0.05, font * 0.95, ink, "left", true);
  drawLabel(ctx, "Engineer", tx, cy + font * 0.95, font * 0.95, ink, "left", true);
  const pinX = tx + font * 0.4;
  const pinY = cy + r * 0.95;
  ctx.beginPath();
  ctx.arc(pinX, pinY - font * 0.15, font * 0.42, Math.PI, 0);
  ctx.lineTo(pinX, pinY + font * 0.6);
  ctx.closePath();
  ctx.fillStyle = tint(palette, slide);
  ctx.fill();
  dot(ctx, pinX, pinY - font * 0.15, font * 0.16, rgba(palette.surface, 1));
  drawLabel(ctx, "Poland", pinX + font * 0.9, pinY, font * 0.9, muted);
  ctx.globalAlpha = 1;
};

const drawEditor = (scene: Scene): void => {
  const { dc, box, soft, surface, outline, muted, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const panel = box(0.46, 0, 0.54, 0.42);
  fillRounded(ctx, panel, 6, surface);
  roundedRectPath(ctx, panel, 6);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.4 + 0.5 * progress);
  ctx.stroke();
  const head = panel.h * 0.15;
  [0, 1, 2].forEach((i) =>
    dot(
      ctx,
      panel.x + head * (0.7 + i * 0.7),
      panel.y + head / 2,
      head * 0.2,
      i === 0 ? tint(palette, progress, 0.6) : soft
    )
  );
  drawLabel(
    ctx,
    "about.tsx",
    panel.x + panel.w * 0.96,
    panel.y + head / 2,
    font * 0.8,
    muted,
    "right"
  );
  ctx.beginPath();
  ctx.moveTo(panel.x, panel.y + head);
  ctx.lineTo(panel.x + panel.w, panel.y + head);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  const loop = (time % TYPE_MS) / TYPE_MS;
  const rowH = (panel.h - head) / (CODE_LINES.length + 0.6);
  CODE_LINES.forEach(([indent, tokens], index) => {
    const last = index === CODE_LINES.length - 1;
    const frac = last
      ? lastLineFrac(progress, loop)
      : seg(progress, index * 0.11, index * 0.11 + 0.2);
    const y = panel.y + head + rowH * (index + 0.7);
    drawLabel(ctx, String(index + 1), panel.x + panel.w * 0.07, y, font * 0.75, soft, "right");
    const total = tokens.reduce((sum, w) => sum + w, 0);
    let remaining = frac * total;
    let x = panel.x + panel.w * (0.12 + indent * 0.06);
    let caretX = x;
    tokens.forEach((w, tokenIndex) => {
      const drawn = Math.min(w, Math.max(0, remaining));
      remaining -= w;
      if (drawn > 0) {
        caretX = x + drawn * panel.w;
        pill(
          ctx,
          x,
          y - rowH * 0.18,
          drawn * panel.w,
          rowH * 0.36,
          tokenIndex === 0 ? tint(palette, frac, 0.55) : soft
        );
      }
      x += (w + 0.025) * panel.w;
    });
    if (last && frac > 0 && frac < 1) {
      ctx.globalAlpha = Math.sin(time / 180) > 0 ? 1 : 0.2;
      ctx.fillStyle = tint(palette, 1);
      ctx.fillRect(caretX + 2, y - rowH * 0.3, 1.5, rowH * 0.6);
      ctx.globalAlpha = 1;
    }
  });
};

const drawSkills = (scene: Scene): void => {
  const { dc, area, ink, font } = scene;
  const { ctx, progress, time, palette } = dc;
  let index = 0;
  SKILLS.forEach((row, rowIndex) => {
    let cursor = area.x + 2;
    const y = area.y + area.h * (SKILL_BASE_Y + rowIndex * 0.115);
    row.forEach((name) => {
      const t = easeOutCubic(seg(progress, 0.2 + index * 0.08, 0.5 + index * 0.08));
      const w = name.length * font * 0.62 + 14;
      const bob = Math.sin(time / 900 + index * 1.7) * 1.4 * progress;
      const chip = { x: cursor, y: y + bob + (1 - t) * 6, w, h: font * 2 };
      ctx.globalAlpha = 0.4 + 0.6 * t;
      pill(ctx, chip.x, chip.y, chip.w, chip.h, tint(palette, t, 0.1 + 0.14 * t));
      roundedRectPath(ctx, chip, chip.h / 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = tint(palette, t, 0.3 + 0.6 * t);
      ctx.stroke();
      drawLabel(ctx, name, chip.x + chip.w / 2, chip.y + chip.h / 2, font, ink, "center");
      ctx.globalAlpha = 1;
      cursor += w + 6;
      index += 1;
    });
  });
};

const drawStats = (scene: Scene): void => {
  const { dc, box, surface, muted, font } = scene;
  const { ctx, progress, palette } = dc;
  const count = easeOutCubic(seg(progress, 0.3, 0.8));
  STATS.forEach(([target, label], index) => {
    const card = box(index * 0.235, 0.72, 0.22, 0.27);
    fillRounded(ctx, card, 6, surface);
    roundedRectPath(ctx, card, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, count, 0.35 + 0.55 * count);
    ctx.stroke();
    drawLabel(
      ctx,
      `${Math.round(target * count)}+`,
      card.x + card.w / 2,
      card.y + card.h * 0.38,
      font * 2.1,
      tint(palette, count, 0.7 + 0.3 * count),
      "center",
      true
    );
    drawLabel(ctx, label, card.x + card.w / 2, card.y + card.h * 0.78, font * 0.9, muted, "center");
  });
};

const drawTimeline = (scene: Scene): void => {
  const { dc, box, faint, ink, muted, surface, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const strip = box(0.54, 0.72, 0.44, 0.27);
  const y = strip.y + strip.h * 0.46;
  const fill = seg(progress, 0.4, 0.95);
  const left = strip.x + strip.w * 0.1;
  const right = strip.x + strip.w * 0.9;
  ctx.lineCap = "round";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.strokeStyle = faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + (right - left) * fill, y);
  ctx.strokeStyle = tint(palette, fill);
  ctx.stroke();
  MILESTONES.forEach(([year, name], index) => {
    const x = left + ((right - left) * index) / (MILESTONES.length - 1);
    const on = seg(fill, index / 3 - 0.05, index / 3 + 0.05);
    const last = index === MILESTONES.length - 1;
    const r = font * (0.4 + 0.12 * on) * (last ? 1 + 0.15 * Math.sin(time / 350) * progress : 1);
    dot(ctx, x, y, r + 1.5, surface);
    dot(ctx, x, y, r, tint(palette, on, 0.35 + 0.65 * on));
    drawLabel(
      ctx,
      year,
      x,
      y - font * 1.3,
      font * 0.85,
      on > 0.5 ? ink : muted,
      "center",
      on > 0.5
    );
    drawLabel(ctx, name, x, y + font * 1.4, font * 0.8, muted, "center");
  });
};

export const drawNavAbout = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawAvatar(scene);
  drawEditor(scene);
  drawSkills(scene);
  drawStats(scene);
  drawTimeline(scene);
};

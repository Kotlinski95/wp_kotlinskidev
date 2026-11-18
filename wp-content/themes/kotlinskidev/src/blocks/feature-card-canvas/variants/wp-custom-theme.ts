import { easeOutCubic } from "../easing";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import {
  type Scene,
  chip,
  chipWidth,
  createScene,
  fit,
  outlineRect,
  panel,
  part,
  seg,
} from "./anf-shared";
import { dot, drawLabel, fillRounded, pill, tint } from "./shared";

const FILES = ["theme.json", "templates/", "parts/", "patterns/", "blocks/", "functions/"] as const;
const SIZES = ["S", "M", "L", "XL"] as const;
const BLOCKS = ["Hero", "Cards", "CTA"] as const;
const TREE_MS = 1500;
const SPARK = [0.15, 0.22, 0.2, 0.38, 0.5, 0.48, 0.7, 0.9] as const;

const GROUPS: ReadonlyArray<(active: number) => boolean> = [
  (active) => active === 0,
  (active) => active >= 1 && active <= 4,
  (active) => active === 5,
];

const activeFile = (dc: DrawContext): number =>
  dc.progress >= 1
    ? Math.floor(dc.time / TREE_MS) % FILES.length
    : Math.min(FILES.length - 1, Math.floor(dc.progress * FILES.length));

const glowFor = (dc: DrawContext, active: number, group: number): number => {
  const hit = GROUPS[group](active);
  return hit ? easeOutCubic(Math.min(1, dc.progress * 4)) : 0;
};

const drawGlyph = (
  scene: Scene,
  x: number,
  y: number,
  size: number,
  folder: boolean,
  on: number
): void => {
  const { ctx, palette } = scene.dc;
  const style = tint(palette, on, 0.3 + 0.4 * on);
  if (folder) {
    fillRounded(ctx, { x, y: y - size * 0.55, w: size * 0.5, h: size * 0.25 }, 1.5, style);
    fillRounded(ctx, { x, y: y - size * 0.4, w: size, h: size * 0.75 }, 2, style);
  } else {
    outlineRect(
      ctx,
      { x: x + size * 0.1, y: y - size * 0.5, w: size * 0.75, h: size },
      2,
      style,
      1.4
    );
  }
};

const drawTree = (scene: Scene, active: number): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const zone = scene.box(0, 0, 0.28, 0.72);
  panel(scene, zone, 8, progress);
  const rowH = zone.h / (FILES.length + 0.6);
  const font = fit(11, zone.w - 30, small);
  FILES.forEach((name, index) => {
    const y = zone.y + rowH * (index + 0.8);
    const reveal = easeOutCubic(seg(progress, index * 0.08, 0.25 + index * 0.08));
    const on = index === active && progress > 0 ? 1 : 0;
    ctx.globalAlpha = 0.35 + 0.65 * reveal;
    if (on) {
      fillRounded(
        ctx,
        { x: zone.x + 4, y: y - rowH * 0.45, w: Math.max(0, zone.w - 8), h: rowH * 0.9 },
        4,
        tint(palette, 1, 0.16)
      );
    }
    drawGlyph(scene, zone.x + 9, y, font * 0.95, name.endsWith("/"), on);
    drawLabel(ctx, name, zone.x + 9 + font * 1.5, y, font, on ? ink : muted, "left", on === 1);
    ctx.globalAlpha = 1;
  });
};

const drawTokens = (scene: Scene, glow: number): void => {
  const { dc, faint, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const zone = scene.box(0.31, 0, 0.33, 0.72);
  panel(scene, zone, 8, glow);
  drawLabel(
    ctx,
    "design tokens",
    zone.x + 8,
    zone.y + zone.h * 0.07,
    fit(13, zone.w - 16, small),
    ink,
    "left",
    true
  );
  const swatches = [
    palette.accent,
    palette.accentGlow,
    palette.strong,
    palette.muted,
    palette.line,
  ];
  const r = Math.max(0, Math.min(zone.w * 0.075, zone.h * 0.06));
  swatches.forEach((color, index) => {
    const t = easeOutCubic(seg(progress, 0.15 + index * 0.07, 0.4 + index * 0.07));
    const cx = zone.x + zone.w * 0.1 + index * (zone.w * 0.2);
    const cy = zone.y + zone.h * 0.2;
    dot(ctx, cx, cy, r * t, rgba(color, 1));
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, glow, 0.4 + 0.5 * glow);
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(0, r * t), 0, Math.PI * 2);
    ctx.stroke();
  });
  drawLabel(ctx, "colors", zone.x + 8, zone.y + zone.h * 0.32, small * 0.85, muted, "left");
  SIZES.forEach((label, index) => {
    const t = easeOutCubic(seg(progress, 0.3 + index * 0.08, 0.55 + index * 0.08));
    const cell = zone.w / SIZES.length;
    const font = Math.max(6, Math.min(zone.h * 0.07, cell * 0.3)) * (0.7 + 0.18 * index);
    drawLabel(
      ctx,
      "Aa",
      zone.x + cell * (index + 0.5),
      zone.y + zone.h * 0.5,
      font,
      tint(palette, t * progress, 0.6 + 0.4 * t),
      "center",
      true
    );
    drawLabel(
      ctx,
      label,
      zone.x + cell * (index + 0.5),
      zone.y + zone.h * 0.64,
      small * 0.8,
      muted,
      "center"
    );
  });
  drawLabel(ctx, "spacing", zone.x + 8, zone.y + zone.h * 0.76, small * 0.85, muted, "left");
  [0.1, 0.18, 0.3, 0.46].forEach((w, index) => {
    const t = easeOutCubic(seg(progress, 0.45 + index * 0.08, 0.7 + index * 0.08));
    pill(
      ctx,
      zone.x + zone.w * 0.08,
      zone.y + zone.h * (0.82 + index * 0.045),
      Math.max(0, zone.w * w * t * 1.6),
      zone.h * 0.025,
      index === 3 ? tint(palette, t, 0.6) : faint
    );
  });
};

const drawPage = (scene: Scene, glow: number): void => {
  const { dc, faint, soft, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const zone = scene.box(0.67, 0, 0.33, 0.72);
  panel(scene, zone, 8, glow);
  const body = part(zone, 0.07, 0.08, 0.86, 0.86);
  const slots: ReadonlyArray<readonly [number, number]> = [
    [0, 0.38],
    [0.42, 0.34],
    [0.8, 0.2],
  ];
  BLOCKS.forEach((name, index) => {
    const t = easeOutCubic(seg(progress, 0.2 + index * 0.18, 0.5 + index * 0.18));
    const [v, h] = slots[index];
    const rect = part(body, 0, v, 1, h);
    const shift = (1 - t) * body.w * (index % 2 === 0 ? -0.4 : 0.4);
    const block = { x: rect.x + shift, y: rect.y, w: rect.w, h: Math.max(0, rect.h - 4) };
    ctx.globalAlpha = t;
    fillRounded(ctx, block, 4, faint);
    if (index === 1) {
      [0, 1, 2].forEach((i) =>
        fillRounded(ctx, part(block, 0.04 + i * 0.32, 0.18, 0.28, 0.66), 3, soft)
      );
    } else {
      pill(
        ctx,
        block.x + block.w * 0.08,
        block.y + block.h * 0.3,
        block.w * (index === 0 ? 0.55 : 0.4),
        block.h * 0.12,
        muted
      );
      pill(
        ctx,
        block.x + block.w * 0.08,
        block.y + block.h * 0.58,
        block.w * 0.28,
        block.h * 0.2,
        tint(palette, t * progress, 0.55)
      );
    }
    const lit = progress >= 1 && Math.floor(time / 1300) % BLOCKS.length === index ? 1 : 0;
    outlineRect(ctx, block, 4, tint(palette, lit, 0.3 + 0.6 * lit));
    const tag = chipWidth(name, small * 0.85);
    chip(scene, block.x + block.w - tag - 4, block.y + 3, name, small * 0.85, lit, small * 1.5);
    ctx.globalAlpha = 1;
  });
};

const drawSpark = (scene: Scene, zone: Rect): void => {
  const { dc, small, muted } = scene;
  const { ctx, progress, time, palette } = dc;
  const reveal = easeOutCubic(seg(progress, 0.4, 0.95));
  const points = SPARK.map((value, index) => ({
    x: zone.x + (zone.w * index) / (SPARK.length - 1),
    y: zone.y + zone.h * (0.85 - 0.7 * value),
  }));
  const visible = reveal * (points.length - 1);
  const last = Math.floor(visible);
  const next = points[Math.min(points.length - 1, last + 1)];
  const frac = visible - last;
  const head = {
    x: points[last].x + (next.x - points[last].x) * frac,
    y: points[last].y + (next.y - points[last].y) * frac,
  };
  ctx.beginPath();
  points
    .slice(0, last + 1)
    .forEach((p, index) => (index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.lineTo(head.x, head.y);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, reveal);
  ctx.stroke();
  const ping = progress >= 1 ? (time / 1400) % 1 : 0;
  ctx.beginPath();
  ctx.arc(head.x, head.y, Math.max(0, small * (0.5 + 1.1 * ping)), 0, Math.PI * 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, reveal, 0.5 * (1 - ping) * reveal);
  ctx.stroke();
  dot(ctx, head.x, head.y, small * 0.5, tint(palette, reveal));
  drawLabel(ctx, "growth", zone.x, zone.y + zone.h * 0.08, small * 0.85, muted, "left");
};

const drawFooter = (scene: Scene, glow: number): void => {
  const { dc, small } = scene;
  const { progress } = dc;
  const e = easeOutCubic(seg(progress, 0.3, 0.9));
  const row = scene.box(0, 0.78, 0.62, 0.2);
  const labels = [
    `LCP ${(2.8 - 1.6 * e).toFixed(1)}s`,
    `JS ${Math.round(212 - 169 * e)} KB`,
    `SEO ${Math.round(70 + 30 * e)}`,
  ];
  const font = fit(labels.join("").length, row.w - 30, small * 1.15);
  let cursor = row.x;
  labels.forEach((label, index) => {
    const t = easeOutCubic(seg(progress, 0.25 + index * 0.1, 0.55 + index * 0.1));
    cursor +=
      chip(
        scene,
        cursor,
        row.y + (row.h - font * 2) / 2,
        label,
        font,
        Math.max(t, glow),
        font * 2
      ) + 4;
  });
  drawSpark(scene, scene.box(0.66, 0.76, 0.34, 0.24));
};

export const drawWpCustomTheme = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const active = activeFile(dc);
  drawTree(scene, active);
  drawTokens(scene, glowFor(dc, active, 0));
  drawPage(scene, glowFor(dc, active, 1));
  drawFooter(scene, glowFor(dc, active, 2));
};

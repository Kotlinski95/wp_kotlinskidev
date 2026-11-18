import { easeOutCubic } from "../easing";
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
import { circlePath, dot, drawLabel, fillRounded, pill, strokeTick, tint } from "./shared";

type Icon = (scene: Scene, rect: Rect, on: number) => void;

const PULSE_MS = 6000;
const OWN = ["Own hosting", "Own code", "Own content"] as const;
const CPT = ["Projects", "Certificates", "Articles"] as const;

const strokeOf = (scene: Scene, on: number): string => tint(scene.dc.palette, on, 0.5 + 0.5 * on);

const dbIcon: Icon = (scene, rect, on) => {
  const { ctx } = scene.dc;
  [0, 1, 2].forEach((i) =>
    fillRounded(
      ctx,
      { x: rect.x, y: rect.y + i * rect.h * 0.36, w: rect.w, h: rect.h * 0.26 },
      rect.h * 0.13,
      strokeOf(scene, on)
    )
  );
};

const bracketIcon = (scene: Scene, rect: Rect, on: number, label: string): void => {
  drawLabel(
    scene.dc.ctx,
    label,
    rect.x + rect.w / 2,
    rect.y + rect.h / 2,
    Math.max(6, Math.min(rect.h * 0.8, rect.w / (label.length * 0.62))),
    strokeOf(scene, on),
    "center",
    true
  );
};

const phpIcon: Icon = (scene, rect, on) => bracketIcon(scene, rect, on, "</>");
const restIcon: Icon = (scene, rect, on) => bracketIcon(scene, rect, on, "{ }");

const reactIcon: Icon = (scene, rect, on) => {
  const { ctx } = scene.dc;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  ctx.lineWidth = 1.3;
  [0, 1, 2].forEach((i) => {
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      Math.max(0, rect.w * 0.5),
      Math.max(0, rect.h * 0.2),
      (Math.PI * i) / 3,
      0,
      Math.PI * 2
    );
    ctx.strokeStyle = strokeOf(scene, on);
    ctx.stroke();
  });
  dot(ctx, cx, cy, rect.h * 0.1, strokeOf(scene, on));
};

const uiIcon: Icon = (scene, rect, on) => {
  const { ctx } = scene.dc;
  outlineRect(ctx, rect, 3, strokeOf(scene, on), 1.4);
  ctx.fillStyle = strokeOf(scene, on);
  ctx.fillRect(rect.x, rect.y + rect.h * 0.28, rect.w, 1.2);
};

const SLABS: ReadonlyArray<readonly [string, Icon]> = [
  ["Frontend UI", uiIcon],
  ["React editor", reactIcon],
  ["REST / Blocks", restIcon],
  ["PHP modules", phpIcon],
  ["Database", dbIcon],
];

const pulsePos = (dc: DrawContext): number =>
  (dc.progress >= 1 ? (dc.time % PULSE_MS) / PULSE_MS : dc.progress) * SLABS.length;

const slabRect = (scene: Scene, index: number): Rect => scene.box(0.3, index * 0.2, 0.4, 0.16);

const drawSlabs = (scene: Scene): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const pos = pulsePos(dc);
  SLABS.forEach(([name, icon], index) => {
    const level = SLABS.length - 1 - index;
    const rect = slabRect(scene, index);
    const reveal = easeOutCubic(seg(progress, level * 0.12, 0.3 + level * 0.12));
    const glow = Math.max(0, 1 - Math.abs(pos - level - 0.5) * 1.2) * Math.min(1, progress * 4);
    ctx.globalAlpha = 0.4 + 0.6 * reveal;
    panel(scene, rect, 7, Math.max(glow, reveal * 0.4));
    if (glow > 0) {
      fillRounded(ctx, rect, 7, tint(palette, 1, 0.12 * glow));
    }
    fillRounded(ctx, part(rect, 0.04, 0.9, 0.92, 0.1), 2, tint(palette, glow, 0.2 + 0.3 * glow));
    const iconW = Math.max(0, rect.w * 0.12);
    const iconH = Math.max(0, Math.min(rect.h * 0.5, iconW));
    icon(
      scene,
      { x: rect.x + rect.w * 0.06, y: rect.y + (rect.h - iconH) / 2, w: iconW, h: iconH },
      glow
    );
    const left = rect.x + rect.w * 0.06 + iconW + 8;
    drawLabel(
      ctx,
      name,
      left,
      rect.y + rect.h / 2,
      fit(name.length, rect.x + rect.w - left - 6, small * 1.1),
      glow > 0.4 ? ink : muted,
      "left",
      glow > 0.4
    );
    ctx.globalAlpha = 1;
  });
  const x = scene.box(0.5, 0, 0, 0).x;
  const bottom = slabRect(scene, SLABS.length - 1);
  const top = slabRect(scene, 0);
  const f = Math.min(1, pos / SLABS.length);
  if (progress > 0) {
    dot(
      ctx,
      x,
      bottom.y + bottom.h / 2 + (top.y + top.h / 2 - bottom.y - bottom.h / 2) * f,
      scene.small * 0.4,
      tint(palette, 1)
    );
  }
};

const drawFlow = (scene: Scene): void => {
  const { dc, soft, faint, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const snippet = scene.box(0, 0, 0.26, 0.3);
  const block = scene.box(0, 0.4, 0.26, 0.17);
  const page = scene.box(0, 0.67, 0.26, 0.3);
  const t = (i: number): number => easeOutCubic(seg(progress, 0.15 + i * 0.2, 0.45 + i * 0.2));
  panel(scene, snippet, 7, t(0));
  [0.5, 0.8, 0.65, 0.4].forEach((w, i) =>
    pill(
      ctx,
      snippet.x + snippet.w * (0.1 + (i % 2) * 0.1),
      snippet.y + snippet.h * (0.18 + i * 0.2),
      Math.max(0, snippet.w * w * t(0)),
      snippet.h * 0.08,
      i === 0 ? tint(palette, t(0), 0.6) : soft
    )
  );
  panel(scene, block, 7, t(1));
  fillRounded(ctx, part(block, 0.1, 0.2, 0.28, 0.6), 3, tint(palette, t(1), 0.2 + 0.3 * t(1)));
  drawLabel(
    ctx,
    "Block",
    block.x + block.w * 0.45,
    block.y + block.h / 2,
    fit(5, block.w * 0.5, small),
    ink,
    "left",
    true
  );
  panel(scene, page, 7, t(2));
  fillRounded(ctx, part(page, 0.1, 0.1, 0.8, 0.3), 3, tint(palette, t(2), 0.2));
  pill(ctx, page.x + page.w * 0.1, page.y + page.h * 0.5, page.w * 0.6, page.h * 0.07, soft);
  pill(ctx, page.x + page.w * 0.1, page.y + page.h * 0.64, page.w * 0.4, page.h * 0.07, faint);
  drawLabel(
    ctx,
    "Published",
    page.x + page.w / 2,
    page.y + page.h * 0.88,
    fit(9, page.w - 8, small),
    muted,
    "center"
  );
  const spans: ReadonlyArray<readonly [Rect, Rect]> = [
    [snippet, block],
    [block, page],
  ];
  const cycle = progress >= 1 ? (time % 2400) / 2400 : 0;
  spans.forEach(([from, to], index) => {
    const x = from.x + from.w / 2;
    const y0 = from.y + from.h + 2;
    const y1 = to.y - 2;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, t(index + 1), 0.4 + 0.5 * t(index + 1));
    ctx.stroke();
    const f = seg(cycle, index * 0.45, index * 0.45 + 0.45);
    if (f > 0 && f < 1) {
      dot(ctx, x, y0 + (y1 - y0) * f, small * 0.35, tint(palette, 1));
    }
  });
};

const drawLock = (scene: Scene, zone: Rect): void => {
  const { dc } = scene;
  const { ctx, progress, time, palette } = dc;
  const r = Math.max(0, Math.min(zone.w * 0.3, zone.h * 0.4));
  const cx = zone.x + zone.w / 2;
  const cy = zone.y + zone.h * 0.55;
  const t = easeOutCubic(seg(progress, 0.3, 0.7));
  const ping = progress >= 1 ? (time / 1800) % 1 : 0;
  circlePath(ctx, cx, cy, r * (1 + 0.25 * ping));
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, t, 0.35 * (1 - ping) * t);
  ctx.stroke();
  circlePath(ctx, cx, cy, r);
  ctx.fillStyle = tint(palette, t, 0.1 + 0.12 * t);
  ctx.fill();
  ctx.strokeStyle = tint(palette, t, 0.4 + 0.5 * t);
  ctx.stroke();
  const body = { x: cx - r * 0.38, y: cy - r * 0.05, w: r * 0.76, h: r * 0.55 };
  fillRounded(ctx, body, 3, tint(palette, t, 0.5 + 0.4 * t));
  ctx.beginPath();
  ctx.arc(cx, cy - r * 0.05, r * 0.26, Math.PI, 0);
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = tint(palette, t);
  ctx.stroke();
  dot(ctx, cx, cy + r * 0.22, r * 0.07, scene.surface);
};

const drawOwnership = (scene: Scene): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  drawLock(scene, scene.box(0.74, 0, 0.26, 0.24));
  const font = fit(11, scene.box(0.74, 0, 0.26, 0).w - 14, small);
  OWN.forEach((label, index) => {
    const t = easeOutCubic(seg(progress, 0.3 + index * 0.1, 0.6 + index * 0.1));
    ctx.globalAlpha = 0.4 + 0.6 * t;
    const zone = scene.box(0.74, 0.27 + index * 0.085, 0.26, 0.07);
    const w = Math.min(zone.w, chipWidth(label, font));
    chip(scene, zone.x, zone.y, label, Math.min(font, fit(label.length, w - 10, font)), t, zone.h);
    ctx.globalAlpha = 1;
  });
  const list = scene.box(0.74, 0.55, 0.26, 0.3);
  panel(scene, list, 6, seg(progress, 0.5, 0.8));
  drawLabel(ctx, "CPT", list.x + 7, list.y + list.h * 0.15, small * 0.9, muted, "left", true);
  CPT.forEach((name, index) => {
    const t = easeOutCubic(seg(progress, 0.55 + index * 0.1, 0.85 + index * 0.1));
    const y = list.y + list.h * (0.42 + index * 0.25);
    ctx.globalAlpha = 0.4 + 0.6 * t;
    dot(ctx, list.x + 9, y, small * 0.28, tint(palette, t));
    drawLabel(ctx, name, list.x + 16, y, fit(12, list.w - 22, small), ink, "left");
    ctx.globalAlpha = 1;
  });
  const deploy = easeOutCubic(seg(progress, 0.75, 1));
  const dy = scene.box(0.74, 0.9, 0.26, 0.08);
  circlePath(ctx, dy.x + dy.h * 0.5, dy.y + dy.h / 2, Math.max(0, dy.h * 0.42));
  ctx.fillStyle = tint(palette, deploy, 0.2 * deploy + 0.05);
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, deploy);
  strokeTick(ctx, dy.x + dy.h * 0.5, dy.y + dy.h / 2, dy.h * 0.38, deploy);
  drawLabel(
    ctx,
    "Deployed",
    dy.x + dy.h * 1.15,
    dy.y + dy.h / 2,
    fit(8, dy.w - dy.h * 1.2, small),
    deploy > 0.5 ? ink : muted,
    "left",
    deploy > 0.5
  );
};

export const drawWpStackOwnership = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawSlabs(scene);
  drawFlow(scene);
  drawOwnership(scene);
};

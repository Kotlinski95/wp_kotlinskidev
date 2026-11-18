import { easeInOutCubic, easeOutCubic } from "../easing";
import type { DrawContext, Rect } from "../types";
import {
  CHAR_WIDTH,
  DASH,
  NO_DASH,
  type Scene,
  createScene,
  fit,
  outlineRect,
  panel,
  part,
  seg,
} from "./anf-shared";
import { dot, drawLabel, fillRounded, pill, strokeTick, tint } from "./shared";

const LOOP_MS = 5200;
const HEADING = "Build it your way";
const ROLES = ["Admin", "Editor", "Author"] as const;
const CODE: readonly string[] = [
  '"layout": {',
  '  "wideSize": "1200px"',
  '"spacing": { "scale": 4 }',
];

const ROLE_STATE: ReadonlyArray<(flip: number) => number> = [
  () => 1,
  (flip) => flip,
  (flip) => 1 - flip,
];

const loopOf = (dc: DrawContext): number =>
  dc.progress >= 1 ? (dc.time % LOOP_MS) / LOOP_MS : dc.progress;

const drawInserter = (scene: Scene, zone: Rect, dragging: number): void => {
  const { dc, faint, soft, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const cells = [0, 1, 2, 3, 4, 5].map((i) =>
    part(zone, (i % 2) * 0.52, Math.floor(i / 2) * 0.33, 0.46, 0.29)
  );
  cells.forEach((cell, index) => {
    const t = easeOutCubic(seg(progress, 0.1 + index * 0.06, 0.35 + index * 0.06));
    const picked = index === 3 ? dragging : 0;
    ctx.globalAlpha = 0.4 + 0.6 * t;
    fillRounded(ctx, cell, 4, faint);
    outlineRect(ctx, cell, 4, tint(palette, picked, 0.3 + 0.6 * picked));
    const cx = cell.x + cell.w / 2;
    const cy = cell.y + cell.h / 2;
    const s = Math.max(0, Math.min(cell.w, cell.h) * 0.3);
    if (index === 0) {
      drawLabel(ctx, "H", cx, cy, s * 1.6, muted, "center", true);
    } else if (index === 1) {
      pill(ctx, cx - s, cy - s * 0.4, s * 2, s * 0.3, soft);
      pill(ctx, cx - s, cy + s * 0.2, s * 1.4, s * 0.3, soft);
    } else if (index === 2) {
      outlineRect(ctx, { x: cx - s, y: cy - s * 0.8, w: s * 2, h: s * 1.6 }, 2, soft, 1.2);
      dot(ctx, cx - s * 0.3, cy - s * 0.2, s * 0.25, soft);
    } else if (index === 3) {
      pill(ctx, cx - s, cy - s * 0.4, s * 2, s * 0.8, tint(palette, picked, 0.4 + 0.4 * picked));
    } else if (index === 4) {
      [-1, 0.1].forEach((dx) =>
        outlineRect(ctx, { x: cx + dx * s, y: cy - s * 0.7, w: s * 0.9, h: s * 1.4 }, 2, soft, 1.2)
      );
    } else {
      drawLabel(ctx, "“", cx, cy + s * 0.4, s * 2.4, muted, "center", true);
    }
    ctx.globalAlpha = 1;
  });
  drawLabel(ctx, "Blocks", zone.x, zone.y - small * 1.1, small * 0.9, muted, "left", true);
};

const drawCanvas = (scene: Scene, zone: Rect, drag: number, loop: number): void => {
  const { dc, faint, soft, ink, small } = scene;
  const { ctx, progress, time, palette } = dc;
  panel(scene, zone, 6, progress);
  const typed = Math.floor(HEADING.length * seg(loop, 0.1, 0.45));
  const font = fit(HEADING.length + 1, zone.w - 16, small * 1.25);
  const hy = zone.y + zone.h * 0.14;
  drawLabel(ctx, HEADING.slice(0, typed), zone.x + 8, hy, font, ink, "left", true);
  if (progress > 0 && Math.sin(time / 180) > 0) {
    ctx.fillStyle = tint(palette, progress);
    ctx.fillRect(zone.x + 8 + typed * font * CHAR_WIDTH + 1, hy - font * 0.55, 1.5, font * 1.1);
  }
  pill(ctx, zone.x + 8, zone.y + zone.h * 0.3, Math.max(0, zone.w * 0.7), zone.h * 0.05, faint);
  pill(ctx, zone.x + 8, zone.y + zone.h * 0.4, Math.max(0, zone.w * 0.5), zone.h * 0.05, soft);
  const slot = part(zone, 0.05, 0.58, 0.9, 0.3);
  const snap = seg(drag, 0.8, 1);
  ctx.setLineDash(snap > 0 && snap < 1 ? NO_DASH : DASH);
  outlineRect(ctx, slot, 4, tint(palette, snap, 0.3 + 0.6 * snap));
  ctx.setLineDash(NO_DASH);
  if (drag > 0.55 && snap < 1) {
    [slot.y, slot.y + slot.h].forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(zone.x + 3, y);
      ctx.lineTo(zone.x + zone.w - 3, y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = tint(palette, 1, 0.8);
      ctx.stroke();
    });
  }
  if (snap > 0) {
    fillRounded(ctx, slot, 4, tint(palette, snap, 0.12 + 0.12 * snap));
    pill(
      ctx,
      slot.x + slot.w * 0.35,
      slot.y + slot.h * 0.3,
      Math.max(0, slot.w * 0.3),
      slot.h * 0.4,
      tint(palette, snap, 0.5 + 0.4 * snap)
    );
  }
};

const drawFlexibility = (scene: Scene): void => {
  const { dc, ink, small } = scene;
  const { ctx, progress, palette } = dc;
  const box = scene.box(0, 0, 0.44, 1);
  panel(scene, box, 8, progress);
  drawLabel(
    ctx,
    "Flexibility",
    box.x + 10,
    box.y + box.h * 0.07,
    fit(11, box.w * 0.7, small * 1.2),
    ink,
    "left",
    true
  );
  const loop = loopOf(dc);
  const drag = easeInOutCubic(seg(loop, 0.45, 0.85));
  const inserter = part(box, 0.05, 0.2, 0.3, 0.6);
  const canvas = part(box, 0.4, 0.15, 0.56, 0.75);
  drawInserter(scene, inserter, drag);
  drawCanvas(scene, canvas, drag, loop);
  if (drag > 0 && drag < 1) {
    const slot = part(canvas, 0.05, 0.58, 0.9, 0.3);
    const from = { x: inserter.x + inserter.w * 0.75, y: inserter.y + inserter.h * 0.5 };
    const to = { x: slot.x + slot.w * 0.5, y: slot.y + slot.h * 0.5 };
    const w = Math.max(0, slot.w * 0.3 * (0.7 + 0.3 * drag));
    const x = from.x + (to.x - from.x) * drag;
    const y = from.y + (to.y - from.y) * drag - Math.sin(drag * Math.PI) * box.h * 0.06;
    ctx.globalAlpha = 0.9;
    pill(ctx, x - w / 2, y - small * 0.7, w, small * 1.4, tint(palette, 1, 0.5));
    ctx.globalAlpha = 1;
  }
};

const drawToggles = (scene: Scene, zone: Rect, loop: number): void => {
  const { dc, faint, ink, small } = scene;
  const { ctx, progress, palette } = dc;
  ROLES.forEach((role, index) => {
    const row = part(zone, 0, index * 0.34, 1, 0.3);
    const t = easeOutCubic(seg(progress, 0.3 + index * 0.1, 0.6 + index * 0.1));
    const flip = easeInOutCubic(seg(loop, 0.2 + index * 0.18, 0.4 + index * 0.18));
    const on = ROLE_STATE[index](flip);
    ctx.globalAlpha = 0.4 + 0.6 * t;
    drawLabel(ctx, role, row.x, row.y + row.h / 2, fit(6, row.w * 0.5, small), ink, "left");
    const trackW = Math.max(0, Math.min(row.w * 0.3, row.h * 2));
    const track = { x: row.x + row.w - trackW, y: row.y + row.h * 0.15, w: trackW, h: row.h * 0.7 };
    pill(
      ctx,
      track.x,
      track.y,
      track.w,
      track.h,
      on * progress > 0.5 ? tint(palette, on * progress, 0.5) : faint
    );
    dot(
      ctx,
      track.x + track.h / 2 + (track.w - track.h) * on,
      track.y + track.h / 2,
      track.h * 0.38,
      scene.surface
    );
    ctx.globalAlpha = 1;
  });
};

const drawScale = (scene: Scene): void => {
  const { dc } = scene;
  const { ctx, progress, time, palette } = dc;
  const x = scene.box(0.5, 0, 0, 0).x;
  const top = scene.box(0, 0.08, 0, 0).y;
  const bottom = scene.box(0, 0.92, 0, 0).y;
  const mid = (top + bottom) / 2;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, progress, 0.5 + 0.4 * progress);
  ctx.stroke();
  const level = easeOutCubic(seg(progress, 0.2, 0.9));
  const tilt = (1 - level) * 0.35 + Math.sin(time / 700) * 0.03 * progress;
  const half = scene.inner.w * 0.05;
  const dy = Math.sin(tilt) * half;
  const dx = Math.cos(tilt) * half;
  ctx.beginPath();
  ctx.moveTo(x - dx, mid - dy);
  ctx.lineTo(x + dx, mid + dy);
  ctx.lineWidth = 1.8;
  ctx.lineCap = "round";
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  [-1, 1].forEach((side) => {
    const px = x + side * dx;
    const py = mid + side * dy;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py + half * 0.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py + half * 0.6, Math.max(0, half * 0.35), 0, Math.PI);
    ctx.stroke();
  });
  dot(ctx, x, mid, half * 0.12, tint(palette, progress));
};

const drawControl = (scene: Scene): void => {
  const { dc, ink, muted, small, faint } = scene;
  const { ctx, progress, palette } = dc;
  const box = scene.box(0.56, 0, 0.44, 1);
  panel(scene, box, 8, progress);
  drawLabel(
    ctx,
    "Control",
    box.x + 10,
    box.y + box.h * 0.07,
    fit(7, box.w * 0.7, small * 1.2),
    ink,
    "left",
    true
  );
  const code = part(box, 0.05, 0.14, 0.9, 0.28);
  fillRounded(ctx, code, 5, faint);
  const font = fit(Math.max(...CODE.map((line) => line.length)), code.w - 12, small * 0.95);
  CODE.forEach((line, index) => {
    const t = seg(progress, 0.2 + index * 0.12, 0.45 + index * 0.12);
    ctx.globalAlpha = t;
    drawLabel(
      ctx,
      line,
      code.x + 6,
      code.y + code.h * (0.22 + index * 0.28),
      font,
      index === 1 ? tint(palette, progress) : muted,
      "left"
    );
    ctx.globalAlpha = 1;
  });
  drawLabel(ctx, "Roles", box.x + 10, box.y + box.h * 0.48, small * 0.9, muted, "left", true);
  drawToggles(scene, part(box, 0.06, 0.52, 0.88, 0.27), loopOf(dc));
  const gaugeOn = easeOutCubic(seg(progress, 0.5, 0.9));
  const row = part(box, 0.05, 0.83, 0.9, 0.13);
  const perfLabel = `perf ${Math.round(98 * gaugeOn)}`;
  const label = "secure";
  const tickSpace = row.h * 0.9;
  const chipFont = Math.max(
    6,
    Math.min(small, (row.w - 38 - tickSpace) / ((perfLabel.length + label.length) * CHAR_WIDTH))
  );
  const perfW = Math.max(0, perfLabel.length * chipFont * CHAR_WIDTH + 16);
  const secW = Math.max(0, label.length * chipFont * CHAR_WIDTH + 16 + tickSpace);
  const perfChip = { x: row.x, y: row.y, w: perfW, h: row.h };
  const secChip = { x: row.x + perfW + 6, y: row.y, w: secW, h: row.h };
  [perfChip, secChip].forEach((rect) => {
    fillRounded(ctx, rect, rect.h / 2, tint(palette, gaugeOn, 0.1 + 0.16 * gaugeOn));
    outlineRect(ctx, rect, rect.h / 2, tint(palette, gaugeOn, 0.3 + 0.6 * gaugeOn));
  });
  drawLabel(
    ctx,
    perfLabel,
    perfChip.x + perfW / 2,
    row.y + row.h / 2,
    chipFont,
    ink,
    "center",
    true
  );
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, gaugeOn);
  strokeTick(ctx, secChip.x + 8 + tickSpace * 0.35, row.y + row.h / 2, row.h * 0.3, gaugeOn);
  drawLabel(ctx, label, secChip.x + 8 + tickSpace, row.y + row.h / 2, chipFont, ink, "left");
};

export const drawWpFlexControl = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawFlexibility(scene);
  drawControl(scene);
  drawScale(scene);
};

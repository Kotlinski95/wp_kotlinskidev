import { easeInOutCubic, easeOutCubic } from "../easing";
import { quadPoint } from "../geometry";
import type { DrawContext, Rect } from "../types";
import {
  type Scene,
  CHAR_WIDTH,
  chip,
  createScene,
  fit,
  outlineRect,
  panel,
  part,
  seg,
} from "./anf-shared";
import { circlePath, dot, drawLabel, fillRounded, pill, strokeTick, tint } from "./shared";

interface Item {
  name: string;
  qty: string;
  ticked: boolean;
}

interface Group {
  title: string;
  items: readonly Item[];
}

const GROUPS: readonly Group[] = [
  {
    title: "Produce",
    items: [
      { name: "Apples", qty: "x6", ticked: true },
      { name: "Spinach", qty: "x1", ticked: true },
      { name: "Tomatoes", qty: "x4", ticked: false },
    ],
  },
  {
    title: "Dairy",
    items: [
      { name: "Milk", qty: "x2", ticked: true },
      { name: "Yogurt", qty: "x3", ticked: false },
    ],
  },
  {
    title: "Bakery",
    items: [
      { name: "Bread", qty: "x1", ticked: true },
      { name: "Bagels", qty: "x4", ticked: false },
    ],
  },
  {
    title: "Pantry",
    items: [
      { name: "Pasta", qty: "x2", ticked: false },
      { name: "Rice", qty: "x1", ticked: false },
    ],
  },
];
const AISLES = 3;
const TYPED = "Oat milk";
const SORT_MS = 5000;
const NET_MS = 6000;
const BASE_DONE = 3;
const TOTAL = 12;

const cycleOf = (dc: DrawContext, ms: number): number =>
  dc.progress >= 1 ? (dc.time % ms) / ms : dc.progress;

const drawHeader = (scene: Scene, phone: Rect, done: number): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  drawLabel(
    ctx,
    "9:41",
    phone.x + phone.w * 0.12,
    phone.y + phone.h * 0.035,
    small * 0.8,
    muted,
    "left"
  );
  dot(
    ctx,
    phone.x + phone.w * 0.86,
    phone.y + phone.h * 0.035,
    small * 0.28,
    tint(palette, progress, 0.6)
  );
  drawLabel(
    ctx,
    "My list",
    phone.x + phone.w * 0.1,
    phone.y + phone.h * 0.115,
    fit(7, phone.w * 0.5, small * 1.2),
    ink,
    "left",
    true
  );
  const r = Math.max(0, phone.w * 0.13);
  const cx = phone.x + phone.w * 0.8;
  const cy = phone.y + phone.h * 0.115;
  ctx.lineWidth = Math.max(2, r * 0.28);
  ctx.lineCap = "round";
  circlePath(ctx, cx, cy, r);
  ctx.strokeStyle = scene.faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * done) / TOTAL);
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  drawLabel(
    ctx,
    `${Math.round(done)}/${TOTAL}`,
    cx,
    cy,
    fit(4, r * 1.6, small),
    ink,
    "center",
    true
  );
};

const drawRows = (scene: Scene, phone: Rect): number => {
  const { dc, faint, soft, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const pitch =
    (phone.h * 0.66) / (GROUPS.length + GROUPS.reduce((sum, group) => sum + group.items.length, 0));
  let line = 0;
  let index = 0;
  let ticked = 0;
  const left = phone.x + phone.w * 0.08;
  GROUPS.forEach((group) => {
    const y = phone.y + phone.h * 0.2 + line * pitch;
    drawLabel(
      ctx,
      group.title.toUpperCase(),
      left,
      y,
      fit(7, phone.w * 0.5, small * 0.85),
      muted,
      "left",
      true
    );
    pill(
      ctx,
      left + group.title.length * small * 0.85 * CHAR_WIDTH + 6,
      y - 0.5,
      Math.max(0, phone.w * 0.84 - group.title.length * small * 0.85 * CHAR_WIDTH - 6),
      1,
      faint
    );
    line += 1;
    group.items.forEach((item) => {
      const rowY = phone.y + phone.h * 0.2 + line * pitch;
      const t = item.ticked
        ? easeOutCubic(seg(progress, 0.15 + index * 0.1, 0.35 + index * 0.1))
        : 0;
      ticked += t;
      const box = { x: left, y: rowY - pitch * 0.32, w: pitch * 0.64, h: pitch * 0.64 };
      fillRounded(ctx, box, 3, tint(palette, t, 0.08 + 0.55 * t));
      outlineRect(ctx, box, 3, tint(palette, t, 0.4 + 0.5 * t));
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = scene.surface;
      strokeTick(ctx, box.x + box.w / 2, box.y + box.h / 2, box.w * 0.42, t);
      const font = fit(8, phone.w * 0.45, small);
      const nameX = left + pitch * 0.95;
      drawLabel(ctx, item.name, nameX, rowY, font, t > 0.5 ? muted : ink, "left");
      const strike = item.name.length * font * CHAR_WIDTH * t;
      ctx.beginPath();
      ctx.moveTo(nameX, rowY);
      ctx.lineTo(nameX + strike, rowY);
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = tint(palette, t, 0.5 + 0.4 * t);
      ctx.stroke();
      const qw = Math.max(0, item.qty.length * small * 0.8 * CHAR_WIDTH + 8);
      pill(ctx, phone.x + phone.w * 0.92 - qw, rowY - pitch * 0.3, qw, pitch * 0.6, soft);
      drawLabel(ctx, item.qty, phone.x + phone.w * 0.92 - qw / 2, rowY, small * 0.8, ink, "center");
      line += 1;
      index += 1;
    });
  });
  return BASE_DONE + ticked;
};

const drawInput = (scene: Scene, phone: Rect): void => {
  const { dc, faint, muted, ink, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const field = part(phone, 0.07, 0.885, 0.86, 0.075);
  fillRounded(ctx, field, field.h / 2, faint);
  outlineRect(ctx, field, field.h / 2, tint(palette, progress, 0.3 + 0.5 * progress));
  const loop = progress >= 1 ? (time % 4200) / 4200 : progress;
  const typed = Math.floor(TYPED.length * seg(loop, 0.45, 0.8));
  const font = fit(10, field.w * 0.6, small);
  const text = typed > 0 ? TYPED.slice(0, typed) : "Add item";
  drawLabel(
    ctx,
    text,
    field.x + field.h * 0.5,
    field.y + field.h / 2,
    font,
    typed > 0 ? ink : muted,
    "left"
  );
  if (typed > 0 && Math.sin(time / 180) > 0) {
    ctx.fillStyle = tint(palette, progress);
    ctx.fillRect(
      field.x + field.h * 0.5 + typed * font * CHAR_WIDTH + 1,
      field.y + field.h * 0.25,
      1.5,
      field.h * 0.5
    );
  }
  dot(
    ctx,
    field.x + field.w - field.h * 0.5,
    field.y + field.h / 2,
    field.h * 0.28,
    tint(palette, progress)
  );
};

const drawWifi = (scene: Scene, cx: number, cy: number, r: number, off: number): void => {
  const { ctx, palette } = scene.dc;
  ctx.lineCap = "round";
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = tint(palette, 1 - off, 0.5 + 0.4 * (1 - off));
  [1, 0.66, 0.33].forEach((k) => {
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.5, r * k, Math.PI * 1.22, Math.PI * 1.78);
    ctx.stroke();
  });
  dot(ctx, cx, cy + r * 0.5, r * 0.1, tint(palette, 1 - off, 0.8));
  if (off > 0) {
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.9, cy - r * 0.5);
    ctx.lineTo(cx - r * 0.9 + r * 1.8 * off, cy - r * 0.5 + r * 1.4 * off);
    ctx.strokeStyle = scene.muted;
    ctx.stroke();
  }
};

const drawNetwork = (scene: Scene, zone: Rect): void => {
  const { dc, ink, muted, small, soft } = scene;
  const { ctx, progress, time, palette } = dc;
  panel(scene, zone, 8, seg(progress, 0.3, 0.7));
  const c = cycleOf(dc, NET_MS);
  const off = progress >= 1 ? 1 - seg(c, 0.38, 0.5) : 1 - seg(progress, 0.6, 0.8);
  const offClamped = Math.min(1, Math.max(0, off));
  drawWifi(
    scene,
    zone.x + zone.w * 0.14,
    zone.y + zone.h * 0.4,
    Math.min(zone.h * 0.3, zone.w * 0.12),
    offClamped
  );
  const saved = seg(c, 0.58, 0.72);
  const text = offClamped > 0.5 ? "Offline" : "Online";
  drawLabel(
    ctx,
    text,
    zone.x + zone.w * 0.28,
    zone.y + zone.h * 0.3,
    fit(8, zone.w * 0.34, small),
    ink,
    "left",
    true
  );
  const store = {
    x: zone.x + zone.w * 0.28,
    y: zone.y + zone.h * 0.55,
    w: zone.h * 0.2,
    h: zone.h * 0.26,
  };
  [0, 1].forEach((i) => {
    fillRounded(
      ctx,
      { x: store.x, y: store.y + i * store.h * 0.52, w: store.w, h: store.h * 0.44 },
      2,
      tint(palette, saved, 0.2 + 0.4 * saved)
    );
  });
  const label = "Saved locally";
  drawLabel(
    ctx,
    label,
    store.x + store.w + 6,
    store.y + store.h / 2,
    fit(label.length, zone.w * 0.72 - store.w - 12, small),
    saved > 0.5 ? ink : muted,
    "left"
  );
  const ax = zone.x + zone.w * 0.88;
  const ay = zone.y + zone.h * 0.35;
  const spin = progress >= 1 ? time / 700 : progress * 4;
  ctx.beginPath();
  ctx.arc(ax, ay, small * 0.9, spin, spin + Math.PI * 1.3);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = offClamped > 0.5 ? soft : tint(palette, progress);
  ctx.stroke();
};

const binChips = (
  bin: Rect,
  names: readonly string[],
  base: number
): ReadonlyArray<Rect & { font: number }> => {
  const pads = names.length * 8 + (names.length - 1) * 3;
  const chars = names.reduce((sum, name) => sum + name.length, 0);
  const font = Math.max(6, Math.min(base, (bin.w - 8 - pads) / (chars * CHAR_WIDTH)));
  let cursor = bin.x + 4;
  return names.map((name) => {
    const w = Math.max(0, name.length * font * CHAR_WIDTH + 8);
    const rect = { x: cursor, y: bin.y + bin.h * 0.52, w, h: Math.max(0, font * 1.7), font };
    cursor += w + 3;
    return rect;
  });
};

const drawSorting = (scene: Scene, zone: Rect): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  panel(scene, zone, 8, seg(progress, 0.35, 0.7));
  const cs = cycleOf(dc, SORT_MS);
  const fade = 1 - seg(cs, 0.94, 1);
  const groups = GROUPS.slice(0, AISLES);
  const bins = groups.map((_, index) => part(zone, 0.38, 0.06 + index * 0.31, 0.58, 0.27));
  const font = fit(7, bins[0].w - 8, small * 0.9);
  bins.forEach((bin, index) => {
    const lit = seg(cs, 0.2 + index * 0.2, 0.5 + index * 0.2);
    outlineRect(ctx, bin, 4, tint(palette, lit, 0.35 + 0.6 * lit));
    drawLabel(ctx, groups[index].title, bin.x + 5, bin.y + bin.h * 0.24, font, muted, "left", true);
  });
  const slots = bins.map((bin, index) =>
    binChips(
      bin,
      groups[index].items.map((item) => item.name),
      small * 0.8
    )
  );
  const items = groups.flatMap((group, bin) =>
    group.items.map((item, slot) => ({ item, bin, slot }))
  );
  items.forEach(({ item, bin, slot }, index) => {
    const f = easeInOutCubic(seg(cs, 0.05 + index * 0.09, 0.35 + index * 0.09));
    const target = slots[bin][slot];
    const trayFont = target.font;
    const trayW = target.w;
    const from = { x: zone.x + 6 + trayW / 2, y: zone.y + zone.h * (0.1 + index * 0.125) };
    const end = { x: target.x + target.w / 2, y: target.y + target.h / 2 };
    const p = quadPoint(
      from,
      { x: (from.x + end.x) / 2, y: Math.min(from.y, end.y) - zone.h * 0.06 },
      end,
      f
    );
    const x = Math.min(zone.x + zone.w - trayW / 2 - 2, Math.max(zone.x + trayW / 2 + 2, p.x));
    ctx.globalAlpha = (0.55 + 0.45 * f) * fade;
    pill(
      ctx,
      x - trayW / 2,
      p.y - target.h / 2,
      trayW,
      target.h,
      tint(palette, f, 0.15 + 0.25 * f)
    );
    drawLabel(ctx, item.name, x, p.y, trayFont, ink, "center");
    ctx.globalAlpha = 1;
  });
};

const drawTesters = (scene: Scene, zone: Rect): void => {
  const { dc, soft, ink, small, surface } = scene;
  const { ctx, progress, time, palette } = dc;
  const r = Math.max(0, Math.min(zone.h * 0.26, zone.w * 0.07));
  [0, 1, 2].forEach((i) => {
    const t = easeOutCubic(seg(progress, 0.5 + i * 0.1, 0.8 + i * 0.1));
    const cx = zone.x + r * (1.1 + i * 1.7);
    const cy = zone.y + zone.h * 0.35;
    ctx.globalAlpha = 0.4 + 0.6 * t;
    circlePath(ctx, cx, cy, r);
    ctx.fillStyle = tint(palette, t, 0.12 + 0.1 * i);
    ctx.fill();
    dot(ctx, cx, cy - r * 0.2, r * 0.3, soft);
    ctx.beginPath();
    ctx.ellipse(cx, cy + r * 0.75, r * 0.55, r * 0.4, 0, Math.PI, 0);
    ctx.fillStyle = soft;
    ctx.fill();
    ctx.globalAlpha = 1;
  });
  const label = "Tested with real shoppers";
  const lx = zone.x + r * 6.4;
  drawLabel(
    ctx,
    label,
    lx,
    zone.y + zone.h * 0.3,
    fit(label.length, zone.x + zone.w - lx, small),
    ink,
    "left",
    true
  );
  const tapY = zone.y + zone.h * 0.5;
  const ping = progress >= 1 ? (time / 1300) % 1 : 0;
  const tapW = chip(scene, lx, tapY, "tap to tick", small, seg(progress, 0.6, 1), small * 1.8);
  const finger = { x: lx + tapW * 0.62, y: tapY + small * 2.1, w: small * 0.8, h: small * 1.7 };
  circlePath(ctx, finger.x + finger.w / 2, finger.y, small * (0.4 + 1.2 * ping));
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, (1 - ping) * 0.7 * progress);
  ctx.stroke();
  fillRounded(ctx, finger, finger.w / 2, surface);
  outlineRect(ctx, finger, finger.w / 2, tint(palette, progress, 0.5 + 0.5 * progress));
};

export const drawSmartShoppingList = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const phone = scene.box(0.03, 0, 0.34, 1);
  panel(scene, phone, Math.max(0, phone.w * 0.12), dc.progress);
  const done = drawRows(scene, phone);
  drawHeader(scene, phone, done);
  drawInput(scene, phone);
  drawNetwork(scene, scene.box(0.42, 0, 0.58, 0.28));
  drawSorting(scene, scene.box(0.42, 0.32, 0.58, 0.4));
  drawTesters(scene, scene.box(0.42, 0.76, 0.58, 0.24));
};

import { clamp01, easeInOutCubic, easeOutCubic } from "../easing";
import { dot, drawLabel, fillRounded, pill, strokeTick, tint } from "./shared";
import {
  DASH,
  NO_DASH,
  type Scene,
  chip,
  createScene,
  fit,
  outlineRect,
  panel,
  part,
  seg,
} from "./anf-shared";
import type { DrawContext, Rect } from "../types";

interface Zones {
  images: Rect;
  bundle: Rect;
  timeline: Rect;
  cache: Rect | null;
  budget: Rect | null;
}

const WIDE_MIN = 480;
const PLAY_MS = 3800;
const CACHE_MS = 2000;
const CHUNKS = ["home", "plp", "pdp", "cart"] as const;
const LADDER = ["320", "640", "1080"] as const;
const CACHE_LAYERS = ["Browser", "CDN", "ISR", "API"] as const;
const CACHE_HITS = [0, 1, 1, 2, 0, 1, 3] as const;
const MARKERS: ReadonlyArray<readonly [string, number, number]> = [
  ["TTFB", 0.1, 0.18],
  ["FCP", 0.27, 0.55],
  ["LCP", 0.5, 0.92],
];
const BUDGETS: ReadonlyArray<readonly [string, number]> = [
  ["JS", 0.72],
  ["CSS", 0.45],
  ["Images", 0.6],
];

const zonesFor = (scene: Scene): Zones => {
  const { box, dc } = scene;
  if (dc.width >= WIDE_MIN) {
    return {
      images: box(0, 0, 0.32, 0.55),
      bundle: box(0.34, 0, 0.32, 0.55),
      cache: box(0.68, 0, 0.32, 0.55),
      timeline: box(0, 0.6, 0.66, 0.4),
      budget: box(0.68, 0.6, 0.32, 0.4),
    };
  }
  return {
    images: box(0, 0, 0.48, 0.55),
    bundle: box(0.52, 0, 0.48, 0.55),
    timeline: box(0, 0.6, 1, 0.4),
    cache: null,
    budget: null,
  };
};

const title = (scene: Scene, zone: Rect, label: string, on: number): void => {
  panel(scene, zone, 7, on);
  drawLabel(
    scene.dc.ctx,
    label,
    zone.x + 8,
    zone.y + zone.h * 0.1,
    fit(label.length, zone.w * 0.5, scene.small),
    scene.ink,
    "left",
    true
  );
};

const weight = (kb: number): string =>
  kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${Math.round(kb)} KB`;

const drawTile = (scene: Scene, rect: Rect, amount: number): void => {
  const { ctx, palette } = scene.dc;
  fillRounded(ctx, rect, 3, tint(palette, amount, 0.12 + 0.12 * amount));
  dot(
    ctx,
    rect.x + rect.w * 0.72,
    rect.y + rect.h * 0.28,
    rect.h * 0.1,
    tint(palette, amount, 0.5)
  );
  ctx.beginPath();
  ctx.moveTo(rect.x + rect.w * 0.08, rect.y + rect.h * 0.9);
  ctx.lineTo(rect.x + rect.w * 0.38, rect.y + rect.h * 0.45);
  ctx.lineTo(rect.x + rect.w * 0.6, rect.y + rect.h * 0.75);
  ctx.lineTo(rect.x + rect.w * 0.75, rect.y + rect.h * 0.6);
  ctx.lineTo(rect.x + rect.w * 0.92, rect.y + rect.h * 0.9);
  ctx.closePath();
  ctx.fillStyle = tint(palette, amount, 0.4);
  ctx.fill();
};

const drawImages = (scene: Scene, zone: Rect): void => {
  const { dc, soft, muted, ink, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const e = easeOutCubic(seg(progress, 0.1, 0.7));
  title(scene, zone, "Images", e);
  const th = zone.h * 0.4;
  const src = { x: zone.x + zone.w * 0.07, y: zone.y + zone.h * 0.2, w: zone.w * 0.3, h: th };
  const dst = { x: zone.x + zone.w * 0.62, y: src.y + th * 0.3, w: src.w * 0.5, h: th * 0.5 };
  ctx.globalAlpha = 0.45;
  drawTile(scene, src, 0);
  outlineRect(ctx, src, 3, soft);
  ctx.globalAlpha = 1;
  const moving = {
    x: src.x + (dst.x - src.x) * e,
    y: src.y + (dst.y - src.y) * e,
    w: src.w + (dst.w - src.w) * e,
    h: src.h + (dst.h - src.h) * e,
  };
  drawTile(scene, moving, e);
  outlineRect(ctx, moving, 3, tint(palette, e, 0.4 + 0.5 * e));
  const font = fit(10, zone.w * 0.4, small);
  drawLabel(ctx, "JPG 2.4 MB", src.x, src.y + th + font * 1.1, font, muted, "left");
  const kb = 2400 - 2314 * e;
  drawLabel(
    ctx,
    `${e > 0.5 ? "AVIF" : "JPG"} ${weight(kb)}`,
    dst.x,
    src.y + th + font * 1.1,
    font,
    ink,
    "left",
    e > 0.5
  );
  const ay = src.y + th * 0.55;
  ctx.beginPath();
  ctx.moveTo(src.x + src.w + 4, ay);
  ctx.lineTo(dst.x - 4, ay);
  ctx.moveTo(dst.x - 4 - small * 0.5, ay - small * 0.4);
  ctx.lineTo(dst.x - 4, ay);
  ctx.lineTo(dst.x - 4 - small * 0.5, ay + small * 0.4);
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.strokeStyle = tint(palette, e);
  ctx.stroke();
  const rungs = part(zone, 0.07, 0.8, 0.88, 0.14);
  const active = progress >= 1 ? Math.floor(time / 1100) % LADDER.length : 0;
  drawLabel(
    ctx,
    "srcset",
    rungs.x,
    rungs.y + rungs.h / 2,
    fit(6, rungs.w * 0.3, small),
    muted,
    "left"
  );
  let cursor = rungs.x + rungs.w * 0.34;
  LADDER.forEach((label, index) => {
    cursor +=
      chip(
        scene,
        cursor,
        rungs.y,
        label,
        fit(4, rungs.w * 0.14, small),
        index === active ? e : 0,
        rungs.h
      ) + 3;
  });
  const lazyOn = easeOutCubic(seg(progress, 0.6, 0.9));
  const lazyW = chip(
    scene,
    zone.x + zone.w - small * 6 - 8,
    zone.y + zone.h * 0.03,
    "lazy",
    small,
    lazyOn,
    small * 1.6
  );
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, lazyOn);
  strokeTick(
    ctx,
    zone.x + zone.w - 8 - lazyW - small * 0.3,
    zone.y + zone.h * 0.03 + small * 0.8,
    small * 0.55,
    lazyOn
  );
};

const drawScissor = (scene: Scene, x: number, y: number, size: number, on: number): void => {
  const { ctx, palette } = scene.dc;
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x + size, y - size);
  ctx.lineTo(x - size, y + size);
  ctx.lineWidth = 1.4;
  ctx.lineCap = "round";
  ctx.strokeStyle = tint(palette, on);
  ctx.stroke();
};

const drawBundle = (scene: Scene, zone: Rect): void => {
  const { dc, soft, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const t = easeOutCubic(seg(progress, 0.15, 0.8));
  title(scene, zone, "JS bundle", t);
  const map = part(zone, 0.07, 0.2, 0.86, 0.5);
  const gap = 4;
  const mainW = map.w * (1 - 0.6 * t);
  const main = { x: map.x, y: map.y, w: mainW, h: map.h };
  fillRounded(ctx, main, 4, tint(palette, t, 0.14 + 0.1 * t));
  outlineRect(ctx, main, 4, tint(palette, t, 0.4 + 0.5 * t));
  const kb = Math.round(212 - 169 * t);
  drawLabel(
    ctx,
    "main",
    main.x + main.w / 2,
    main.y + main.h * 0.38,
    fit(4, main.w - 8, small),
    ink,
    "center",
    true
  );
  drawLabel(
    ctx,
    `${kb} KB`,
    main.x + main.w / 2,
    main.y + main.h * 0.62,
    fit(6, main.w - 8, small),
    ink,
    "center"
  );
  const rest = Math.max(0, map.w - mainW - gap);
  const active = progress >= 1 ? Math.floor(time / 900) % CHUNKS.length : -1;
  CHUNKS.forEach((name, index) => {
    const show = easeOutCubic(seg(t, 0.4 + index * 0.1, 0.8 + index * 0.1));
    const cell = {
      x: main.x + mainW + gap + (index % 2) * (rest / 2),
      y: map.y + Math.floor(index / 2) * (map.h / 2),
      w: Math.max(0, rest / 2 - 2),
      h: Math.max(0, map.h / 2 - 2),
    };
    ctx.globalAlpha = show;
    fillRounded(
      ctx,
      cell,
      3,
      tint(palette, index === active ? 1 : 0, 0.12 + 0.2 * (index === active ? 1 : 0))
    );
    outlineRect(ctx, cell, 3, index === active ? tint(palette, 1, 0.9) : soft);
    drawLabel(
      ctx,
      name,
      cell.x + cell.w / 2,
      cell.y + cell.h / 2,
      fit(4, cell.w - 4, small),
      muted,
      "center"
    );
    ctx.globalAlpha = 1;
  });
  const sx = main.x + mainW + gap / 2;
  if (t > 0.05) {
    ctx.setLineDash(DASH);
    ctx.beginPath();
    ctx.moveTo(sx, map.y - 3);
    ctx.lineTo(sx, map.y + map.h + 3);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, t, 0.8);
    ctx.stroke();
    ctx.setLineDash(NO_DASH);
    drawScissor(scene, sx, map.y - small * 0.9, small * 0.45, t);
  }
  const caption = "main 212 KB > 43 KB";
  drawLabel(
    ctx,
    caption,
    zone.x + zone.w / 2,
    zone.y + zone.h * 0.86,
    fit(caption.length, zone.w - 16, small),
    muted,
    "center"
  );
};

const drawTimeline = (scene: Scene, zone: Rect): void => {
  const { dc, soft, faint, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const play =
    progress >= 1
      ? easeInOutCubic(clamp01(((time % PLAY_MS) / PLAY_MS) * 1.25))
      : easeOutCubic(seg(progress, 0.1, 0.9));
  title(scene, zone, "Load timeline", play);
  const x0 = zone.x + zone.w * 0.17;
  const x1 = zone.x + zone.w * 0.95;
  const span = x1 - x0;
  const rows = { before: 0.33, label: 0.5, after: 0.64, stream: 0.86 };
  const names: ReadonlyArray<readonly [string, number]> = [
    ["before", rows.before],
    ["after", rows.after],
    ["HTML", rows.stream],
  ];
  const font = fit(6, zone.w * 0.14, small);
  names.forEach(([name, v]) =>
    drawLabel(ctx, name, zone.x + 8, zone.y + zone.h * v, font, muted, "left")
  );
  [rows.before, rows.after].forEach((v) =>
    pill(ctx, x0, zone.y + zone.h * v - 1.5, span, 3, faint)
  );
  MARKERS.forEach(([name, pos, ghost]) => {
    dot(ctx, x0 + span * ghost, zone.y + zone.h * rows.before, small * 0.35, soft);
    const lit = play >= pos ? 1 : 0;
    const mx = x0 + span * pos;
    dot(
      ctx,
      mx,
      zone.y + zone.h * rows.after,
      small * 0.45,
      tint(palette, lit * progress, 0.5 + 0.5 * lit)
    );
    drawLabel(
      ctx,
      name,
      mx,
      zone.y + zone.h * rows.label,
      font,
      lit && progress > 0 ? ink : muted,
      "center",
      lit === 1
    );
  });
  const barY = zone.y + zone.h * rows.stream;
  const barH = small * 0.9;
  pill(ctx, x0, barY - barH / 2, span, barH, faint);
  const parts = 12;
  for (let index = 0; index < parts; index += 1) {
    const lit = seg(play * parts, index, index + 1);
    if (lit > 0) {
      fillRounded(
        ctx,
        { x: x0 + (span * index) / parts + 1, y: barY - barH / 2, w: span / parts - 2, h: barH },
        2,
        tint(palette, lit, 0.35 + 0.55 * lit)
      );
    }
  }
  if (progress > 0 && play < 1) {
    ctx.beginPath();
    ctx.moveTo(x0 + span * play, zone.y + zone.h * 0.26);
    ctx.lineTo(x0 + span * play, barY + barH);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, 1, 0.8);
    ctx.stroke();
  }
};

const drawCache = (scene: Scene, zone: Rect): void => {
  const { dc, faint, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const e = easeOutCubic(seg(progress, 0.3, 0.8));
  title(scene, zone, "Cache layers", e);
  const rowH = zone.h * 0.125;
  const gap = zone.h * 0.03;
  const top = zone.y + zone.h * 0.19;
  const cycle = Math.floor(time / CACHE_MS);
  const hit = CACHE_HITS[cycle % CACHE_HITS.length];
  const travel = progress >= 1 ? ((time % CACHE_MS) / CACHE_MS) * (hit + 1.4) : 0;
  CACHE_LAYERS.forEach((name, index) => {
    const row = {
      x: zone.x + zone.w * 0.07,
      y: top + index * (rowH + gap),
      w: zone.w * 0.86,
      h: rowH,
    };
    const reveal = seg(e, index * 0.2, 0.4 + index * 0.2);
    const on = progress >= 1 && index === hit && travel >= hit ? 1 : 0;
    ctx.globalAlpha = 0.4 + 0.6 * reveal;
    fillRounded(ctx, row, 4, tint(palette, on, 0.1 + 0.2 * on));
    outlineRect(ctx, row, 4, on ? tint(palette, 1, 0.9) : faint);
    drawLabel(
      ctx,
      name,
      row.x + 8,
      row.y + row.h / 2,
      fit(7, row.w * 0.6, small),
      on ? ink : muted,
      "left",
      on === 1
    );
    ctx.globalAlpha = 1;
  });
  if (progress >= 1) {
    const pos = Math.min(travel, hit);
    const y = top + rowH / 2 + pos * (rowH + gap);
    dot(ctx, zone.x + zone.w * 0.86, y, small * 0.45, travel >= hit ? tint(palette, 1) : muted);
  }
  const label = `HIT ${Math.round(97 * e)}%`;
  drawLabel(
    ctx,
    label,
    zone.x + zone.w / 2,
    zone.y + zone.h * 0.92,
    fit(8, zone.w - 16, small),
    tint(palette, e, 0.7 + 0.3 * e),
    "center",
    true
  );
};

const drawBudget = (scene: Scene, zone: Rect): void => {
  const { dc, faint, soft, ink, small } = scene;
  const { ctx, progress, palette } = dc;
  title(scene, zone, "Budget", easeOutCubic(seg(progress, 0.3, 0.7)));
  const label = zone.w * 0.26;
  BUDGETS.forEach(([name, used], index) => {
    const e = easeOutCubic(seg(progress, 0.35 + index * 0.1, 0.85 + index * 0.1));
    const y = zone.y + zone.h * (0.36 + index * 0.24);
    const trackX = zone.x + zone.w * 0.07 + label;
    const trackW = zone.w * 0.86 - label;
    const h = zone.h * 0.1;
    drawLabel(ctx, name, zone.x + zone.w * 0.07, y, fit(6, label - 2, small), ink, "left");
    pill(ctx, trackX, y - h / 2, trackW, h, faint);
    pill(
      ctx,
      trackX,
      y - h / 2,
      Math.max(h, trackW * used * e),
      h,
      tint(palette, e, 0.4 + 0.6 * e)
    );
    ctx.fillStyle = soft;
    ctx.fillRect(trackX + trackW * 0.9, y - h, 1.5, h * 2);
  });
};

export const drawPerfByDesign = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const zones = zonesFor(scene);
  drawImages(scene, zones.images);
  drawBundle(scene, zones.bundle);
  drawTimeline(scene, zones.timeline);
  if (zones.cache) {
    drawCache(scene, zones.cache);
  }
  if (zones.budget) {
    drawBudget(scene, zones.budget);
  }
};

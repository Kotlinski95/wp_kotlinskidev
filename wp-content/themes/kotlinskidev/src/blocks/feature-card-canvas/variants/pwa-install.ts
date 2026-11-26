import { easeOutCubic } from "../easing";
import type { DrawContext, Rect } from "../types";
import {
  CHAR_WIDTH,
  type Scene,
  chip,
  createScene,
  drawWifi,
  fit,
  outlineRect,
  panel,
  part,
  seg,
} from "./anf-shared";
import { drawDesktop, drawPhone } from "./pwa-devices";
import { circlePath, dot, drawLabel, fillRounded, pill, strokeTick, tint } from "./shared";

interface Layout {
  wide: boolean;
  devices: Rect;
  middle: Rect;
  right: Rect;
}

const INSTALL_MS = 7000;
const LIFE_MS = 5600;
const OFFLINE_MS = 6400;
const STAGES = ["register", "install", "activate", "fetch"] as const;
const MANIFEST = [
  'name: "Shop"',
  'start_url: "/"',
  "display: standalone",
  "theme_color: #0078c2",
] as const;
const CHECKS = ["installable", "offline", "fast"] as const;
const STRATEGIES = ["cache-first", "network-first"] as const;

const cycle = (dc: DrawContext, ms: number): number =>
  dc.progress >= 1 ? (dc.time % ms) / ms : dc.progress;

const layoutFor = (scene: Scene): Layout => {
  const wide = scene.dc.width >= 480;
  return {
    wide,
    devices: scene.box(0, 0, 0.36, 1),
    middle: wide ? scene.box(0.4, 0, 0.3, 1) : scene.box(0.37, 0, 0.34, 1),
    right: scene.box(0.74, 0, 0.26, 1),
  };
};

const drawLifecycle = (scene: Scene, zone: Rect): void => {
  const { dc, faint, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  panel(scene, zone, 7, progress);
  drawLabel(
    ctx,
    "Service worker",
    zone.x + 8,
    zone.y + zone.h * 0.08,
    fit(14, zone.w - 16, small),
    ink,
    "left",
    true
  );
  const lp = cycle(dc, LIFE_MS);
  const pos = lp * (STAGES.length - 1);
  const top = zone.y + zone.h * 0.22;
  const pitch = (zone.h * 0.62) / (STAGES.length - 1);
  const x = zone.x + 14;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, top + pitch * (STAGES.length - 1));
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, top + pitch * pos);
  ctx.strokeStyle = tint(palette, lp);
  ctx.stroke();
  STAGES.forEach((name, index) => {
    const y = top + pitch * index;
    const on = seg(pos, index - 0.1, index + 0.1);
    const r = Math.max(0, Math.min(pitch * 0.24, 7));
    dot(ctx, x, y, r * 1.25, scene.surface);
    circlePath(ctx, x, y, r);
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = tint(palette, on, 0.4 + 0.6 * on);
    ctx.stroke();
    ctx.lineWidth = 1.4;
    strokeTick(ctx, x, y, r * 0.85, on);
    drawLabel(
      ctx,
      name,
      x + r + 8,
      y,
      fit(name.length, zone.w - 36, small),
      on > 0.5 ? ink : muted,
      "left",
      on > 0.5
    );
  });
  if (progress > 0) {
    dot(ctx, x, top + pitch * pos, 2.4, tint(palette, 1));
  }
};

const drawCache = (scene: Scene, zone: Rect): void => {
  const { dc, faint, soft, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  panel(scene, zone, 7, progress);
  const oc = cycle(dc, OFFLINE_MS);
  const off =
    progress >= 1 ? seg(oc, 0.35, 0.45) * (1 - seg(oc, 0.8, 0.9)) : seg(progress, 0.55, 0.7);
  drawLabel(
    ctx,
    "Cache",
    zone.x + 8,
    zone.y + zone.h * 0.1,
    fit(5, zone.w * 0.3, small),
    ink,
    "left",
    true
  );
  const tw = Math.max(0, Math.min(zone.w * 0.26, zone.h * 0.3));
  const th = tw * 0.5;
  const track = { x: zone.x + zone.w - tw - 8, y: zone.y + zone.h * 0.1 - th / 2, w: tw, h: th };
  pill(ctx, track.x, track.y, track.w, track.h, off > 0.5 ? tint(palette, off, 0.5) : faint);
  dot(ctx, track.x + th / 2 + (tw - th) * off, track.y + th / 2, th * 0.38, scene.surface);
  drawWifi(
    scene,
    zone.x + zone.w * 0.2,
    zone.y + zone.h * 0.36,
    Math.max(0, Math.min(zone.w * 0.1, zone.h * 0.11)),
    off
  );
  const status = off > 0.5 ? "served from cache" : "online";
  drawLabel(
    ctx,
    status,
    zone.x + zone.w * 0.34,
    zone.y + zone.h * 0.36,
    fit(status.length, zone.w * 0.62, small),
    off > 0.5 ? tint(palette, off) : muted,
    "left",
    off > 0.5
  );
  STRATEGIES.forEach((name, row) => {
    const y = zone.y + zone.h * (0.62 + row * 0.22);
    drawLabel(
      ctx,
      name,
      zone.x + 8,
      y - zone.h * 0.07,
      fit(name.length, zone.w - 16, small * 0.9),
      muted,
      "left"
    );
    for (let i = 0; i < 5; i += 1) {
      const hit = row === 0 ? i !== 3 : i < 2 || off > 0.5;
      const t = easeOutCubic(seg(progress, 0.3 + i * 0.08 + row * 0.1, 0.5 + i * 0.08 + row * 0.1));
      const x = zone.x + 12 + i * Math.max(8, (zone.w - 24) / 5);
      const pulse = progress >= 1 && Math.floor(time / 600) % 5 === i ? 1.35 : 1;
      if (hit) {
        dot(ctx, x, y + zone.h * 0.04, small * 0.4 * t * pulse, tint(palette, t));
      } else {
        circlePath(ctx, x, y + zone.h * 0.04, small * 0.4 * t);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = soft;
        ctx.stroke();
      }
    }
  });
};

const drawManifest = (scene: Scene, zone: Rect): void => {
  const { dc, faint, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  panel(scene, zone, 7, progress);
  drawLabel(
    ctx,
    "manifest.json",
    zone.x + 8,
    zone.y + zone.h * 0.1,
    fit(13, zone.w - 16, small),
    ink,
    "left",
    true
  );
  const lc = cycle(dc, 6000);
  const total = MANIFEST.reduce((sum, line) => sum + line.length, 0);
  const typed = Math.floor(total * seg(lc, 0.1, 0.7));
  const font = fit(Math.max(...MANIFEST.map((line) => line.length)), zone.w - 16, small * 0.95);
  let left = typed;
  MANIFEST.forEach((line, index) => {
    const shown = Math.max(0, Math.min(line.length, left));
    left -= line.length;
    const y = zone.y + zone.h * (0.28 + index * 0.18);
    fillRounded(
      ctx,
      { x: zone.x + 5, y: y - font * 0.7, w: Math.max(0, zone.w - 10), h: font * 1.4 },
      3,
      index % 2 === 0 ? faint : scene.surface
    );
    drawLabel(
      ctx,
      line.slice(0, shown),
      zone.x + 8,
      y,
      font,
      index === 2 ? ink : muted,
      "left",
      index === 2
    );
    if (shown > 0 && shown < line.length && Math.sin(time / 170) > 0) {
      ctx.fillStyle = tint(palette, progress);
      ctx.fillRect(zone.x + 8 + shown * font * CHAR_WIDTH + 1, y - font * 0.55, 1.5, font * 1.1);
    }
  });
};

const drawBadge = (scene: Scene, zone: Rect): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  panel(scene, zone, 7, progress);
  const r = Math.max(0, Math.min(zone.w * 0.18, zone.h * 0.15));
  const cx = zone.x + 8 + r;
  const cy = zone.y + zone.h * 0.2;
  const e = easeOutCubic(seg(progress, 0.3, 0.8));
  ctx.lineWidth = Math.max(2, r * 0.25);
  circlePath(ctx, cx, cy, r);
  ctx.strokeStyle = scene.faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * e);
  ctx.strokeStyle = tint(palette, e);
  ctx.stroke();
  drawLabel(ctx, "PWA", cx, cy, fit(3, r * 1.5, small), ink, "center", true);
  drawLabel(
    ctx,
    `${Math.round(100 * e)}`,
    cx + r + 8,
    cy,
    fit(3, zone.w - r * 2 - 22, small * 1.4),
    tint(palette, e, 0.7 + 0.3 * e),
    "left",
    true
  );
  CHECKS.forEach((label, index) => {
    const t = easeOutCubic(seg(progress, 0.4 + index * 0.12, 0.65 + index * 0.12));
    const y = zone.y + zone.h * (0.5 + index * 0.17);
    const rr = Math.max(0, Math.min(zone.h * 0.06, 6));
    dot(ctx, zone.x + 12, y, rr, tint(palette, t, 0.15 + 0.5 * t));
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = scene.surface;
    strokeTick(ctx, zone.x + 12, y, rr * 0.9, t);
    drawLabel(
      ctx,
      label,
      zone.x + 12 + rr + 6,
      y,
      fit(label.length, zone.w - rr - 30, small),
      t > 0.5 ? ink : muted,
      "left"
    );
  });
};

const drawFooter = (scene: Scene, zone: Rect, wide: boolean): void => {
  const { dc, surface, ink, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const t = easeOutCubic(seg(progress, 0.6, 0.9));
  const angularFont = fit(7, zone.w * (wide ? 0.42 : 1) - 12, small);
  const chipW = chip(scene, zone.x, zone.y, "Angular", angularFont, t, zone.h);
  if (wide) {
    const bob = progress >= 1 ? Math.sin(time / 500) * 1.2 : 0;
    const bubble = {
      x: zone.x + chipW + 8,
      y: zone.y + bob,
      w: Math.max(0, zone.w - chipW - 8),
      h: zone.h,
    };
    ctx.globalAlpha = 0.3 + 0.7 * t;
    fillRounded(ctx, bubble, 6, surface);
    outlineRect(ctx, bubble, 6, tint(palette, t, 0.35 + 0.55 * t));
    dot(ctx, bubble.x + 8, bubble.y + bubble.h / 2, small * 0.35, tint(palette, t));
    drawLabel(
      ctx,
      "New offer",
      bubble.x + 16,
      bubble.y + bubble.h / 2,
      fit(9, bubble.w - 22, small * 0.9),
      ink,
      "left"
    );
    ctx.globalAlpha = 1;
  }
};

export const drawPwaInstall = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const layout = layoutFor(scene);
  const c = cycle(dc, INSTALL_MS);
  const { devices, middle, right, wide } = layout;
  if (wide) {
    drawDesktop(scene, part(devices, 0, 0, 1, 0.34), c);
    const phoneH = devices.h * 0.62;
    const phoneW = Math.max(0, Math.min(devices.w * 0.6, phoneH * 0.52));
    drawPhone(
      scene,
      {
        x: devices.x + (devices.w - phoneW) / 2,
        y: devices.y + devices.h - phoneH,
        w: phoneW,
        h: phoneH,
      },
      c
    );
  } else {
    const phoneH = devices.h;
    const phoneW = Math.max(0, Math.min(devices.w, phoneH * 0.5));
    drawPhone(
      scene,
      { x: devices.x + (devices.w - phoneW) / 2, y: devices.y, w: phoneW, h: phoneH },
      c
    );
  }
  drawLifecycle(scene, part(middle, 0, 0, 1, 0.46));
  drawCache(scene, part(middle, 0, 0.5, 1, 0.5));
  drawManifest(scene, part(right, 0, 0, 1, 0.38));
  drawBadge(scene, part(right, 0, 0.42, 1, 0.42));
  drawFooter(scene, part(right, 0, 0.88, 1, 0.12), wide);
};

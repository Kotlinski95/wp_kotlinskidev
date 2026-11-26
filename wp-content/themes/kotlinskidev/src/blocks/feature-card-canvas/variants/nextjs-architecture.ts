import { easeOutCubic } from "../easing";
import { circlePath, dot, drawLabel, fillRounded, pill, strokeTick, tint } from "./shared";
import {
  CHAR_WIDTH,
  type Scene,
  chipRow,
  createScene,
  fit,
  outlineRect,
  panel,
  part,
  seg,
} from "./anf-shared";
import type { DrawContext, Rect } from "../types";

interface Layer {
  name: string;
  v: number;
  h: number;
  chips: readonly string[];
}

const CYCLE_MS = 7000;
const LAYERS: readonly Layer[] = [
  { name: "Clients", v: 0, h: 0.13, chips: [] },
  { name: "CDN / Edge", v: 0.175, h: 0.125, chips: ["Edge", "Cache", "i18n routing"] },
  {
    name: "Next.js app",
    v: 0.345,
    h: 0.295,
    chips: ["App Router", "Server Components", "Route Handlers", "Middleware"],
  },
  { name: "BFF", v: 0.68, h: 0.12, chips: ["Catalog", "Cart", "Checkout", "Search"] },
  { name: "CMS", v: 0.84, h: 0.11, chips: [] },
];
const TREE: ReadonlyArray<readonly [string, number]> = [
  ["components/", 0],
  ["features/", 0],
  ["cart/", 1],
  ["search/", 1],
  ["lib/", 0],
  ["hooks/", 0],
];
const LOCALES = ["EN", "AR", "FR"] as const;
const STEPS = ["Build", "Test", "Deploy"] as const;

const layerRect = (scene: Scene, layer: Layer): Rect => scene.box(0, layer.v, 0.64, layer.h);

const phaseOf = (dc: DrawContext): number =>
  dc.progress >= 1
    ? ((dc.time % CYCLE_MS) / CYCLE_MS) * LAYERS.length
    : dc.progress * LAYERS.length;

const glowOf = (dc: DrawContext, index: number): number => {
  const d = Math.abs(phaseOf(dc) - index - 0.5);
  return Math.max(0, 1 - d * 1.2) * Math.min(1, dc.progress * 4);
};

const drawClients = (scene: Scene, rect: Rect, on: number, start: number): void => {
  const { dc, soft, faint, muted, small } = scene;
  const { ctx, palette } = dc;
  const desktop = part(rect, start, 0.12, 0.28, 0.76);
  const mobile = part(rect, start + 0.47, 0.06, 0.09, 0.88);
  [desktop, mobile].forEach((frame) =>
    outlineRect(ctx, frame, 3, tint(palette, on, 0.5 + 0.4 * on))
  );
  fillRounded(ctx, part(desktop, 0, 0, 1, 0.26), 3, faint);
  [0, 1, 2].forEach((i) =>
    dot(
      ctx,
      desktop.x + desktop.h * (0.2 + i * 0.18),
      desktop.y + desktop.h * 0.13,
      desktop.h * 0.05,
      soft
    )
  );
  pill(
    ctx,
    mobile.x + mobile.w * 0.3,
    mobile.y + mobile.h * 0.08,
    mobile.w * 0.4,
    mobile.h * 0.05,
    soft
  );
  const font = fit(7, rect.w * 0.26, small);
  drawLabel(ctx, "Desktop", desktop.x + desktop.w + 6, rect.y + rect.h / 2, font, muted, "left");
  drawLabel(ctx, "Mobile", mobile.x + mobile.w + 6, rect.y + rect.h / 2, font, muted, "left");
};

const drawCms = (scene: Scene, rect: Rect, on: number): void => {
  const { dc, soft } = scene;
  const { ctx, palette } = dc;
  [0, 1, 2].forEach((i) =>
    pill(
      ctx,
      rect.x + rect.w * (0.42 + i * 0.18),
      rect.y + rect.h * (0.3 + (i % 2) * 0.22),
      rect.w * 0.14,
      rect.h * 0.16,
      i === 0 ? tint(palette, on, 0.6) : soft
    )
  );
};

const drawLayers = (scene: Scene): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  LAYERS.forEach((layer, index) => {
    const rect = layerRect(scene, layer);
    const reveal = easeOutCubic(seg(progress, index * 0.12, 0.25 + index * 0.12));
    const glow = glowOf(dc, index);
    const on = Math.max(reveal * 0.5, glow);
    ctx.globalAlpha = 0.45 + 0.55 * reveal;
    panel(scene, rect, 7, on);
    if (glow > 0) {
      fillRounded(ctx, rect, 7, tint(palette, 1, 0.1 * glow));
    }
    const nameFont = fit(layer.name.length, rect.w * 0.3, small);
    const stacked = layer.chips.length > 3 && layer.h > 0.2;
    const nameY = stacked ? rect.y + rect.h * 0.14 : rect.y + rect.h / 2;
    drawLabel(
      ctx,
      layer.name,
      rect.x + 8,
      nameY,
      nameFont,
      glow > 0.4 ? ink : muted,
      "left",
      glow > 0.4
    );
    if (index === 0) {
      drawClients(scene, rect, on, (16 + layer.name.length * nameFont * CHAR_WIDTH) / rect.w);
    } else if (index === 4) {
      drawCms(scene, rect, on);
    } else if (stacked) {
      const pad = rect.w * 0.05;
      const rows = [layer.chips.slice(0, 2), layer.chips.slice(2)];
      rows.forEach((labels, row) => {
        chipRow(
          scene,
          {
            x: rect.x + pad,
            y: rect.y + rect.h * (0.3 + row * 0.33),
            w: rect.w - pad * 2,
            h: rect.h * 0.28,
          },
          labels,
          on
        );
      });
    } else {
      const left = rect.x + 8 + layer.name.length * nameFont * CHAR_WIDTH + 8;
      chipRow(
        scene,
        { x: left, y: rect.y, w: rect.x + rect.w - left - 6, h: rect.h },
        layer.chips,
        on,
        "right"
      );
    }
    ctx.globalAlpha = 1;
  });
};

const drawPackets = (scene: Scene): void => {
  const { dc, faint } = scene;
  const { ctx, progress, palette } = dc;
  const phase = phaseOf(dc);
  const x = scene.box(0.32, 0, 0, 0).x;
  LAYERS.slice(0, -1).forEach((layer, index) => {
    const top = layerRect(scene, layer);
    const bottom = layerRect(scene, LAYERS[index + 1]);
    const y0 = top.y + top.h;
    const y1 = bottom.y;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = faint;
    ctx.stroke();
    const f = seg(phase, index + 0.55, index + 1.45);
    if (f > 0 && f < 1) {
      dot(
        ctx,
        x,
        y0 + (y1 - y0) * f,
        scene.small * 0.4,
        tint(palette, 1, Math.min(1, progress * 4))
      );
    }
    ctx.beginPath();
    ctx.moveTo(x - 3, y1 - 4);
    ctx.lineTo(x, y1);
    ctx.lineTo(x + 3, y1 - 4);
    ctx.strokeStyle = tint(palette, progress, 0.4 + 0.5 * progress);
    ctx.stroke();
  });
};

const folder = (scene: Scene, x: number, y: number, size: number, on: number): void => {
  const { ctx, palette } = scene.dc;
  fillRounded(
    ctx,
    { x, y: y - size * 0.35, w: size, h: size * 0.7 },
    2,
    tint(palette, on, 0.25 + 0.35 * on)
  );
  fillRounded(
    ctx,
    { x, y: y - size * 0.5, w: size * 0.45, h: size * 0.25 },
    1.5,
    tint(palette, on, 0.35 + 0.4 * on)
  );
};

const drawTree = (scene: Scene): void => {
  const { dc, ink, muted, small, soft } = scene;
  const { ctx, progress, time } = dc;
  const zone = scene.box(0.69, 0, 0.31, 0.46);
  panel(scene, zone, 7, easeOutCubic(seg(progress, 0.1, 0.4)));
  const expand = easeOutCubic(seg(progress, 0.35, 0.8));
  const rowH = zone.h / 6.4;
  const font = fit(12, zone.w - 30, small);
  const active = progress >= 1 ? Math.floor(time / 1100) % TREE.length : -1;
  TREE.forEach(([name, depth], index) => {
    const slot = depth === 1 ? seg(expand, (index - 2) * 0.3, (index - 2) * 0.3 + 0.5) : 1;
    const y = zone.y + rowH * (index + 0.8);
    const x = zone.x + 8 + depth * font * 1.3;
    const lit = index === active ? 1 : 0;
    ctx.globalAlpha = 0.3 + 0.7 * slot;
    if (depth === 1) {
      ctx.beginPath();
      ctx.moveTo(zone.x + 8 + font * 0.4, y - rowH * 0.5);
      ctx.lineTo(zone.x + 8 + font * 0.4, y);
      ctx.lineTo(x - 2, y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = soft;
      ctx.stroke();
    }
    folder(scene, x, y, font * 0.9, lit * progress);
    drawLabel(ctx, name, x + font * 1.2, y, font, lit ? ink : muted, "left", lit === 1);
    ctx.globalAlpha = 1;
  });
};

const drawLocales = (scene: Scene): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const zone = scene.box(0.69, 0.5, 0.31, 0.16);
  const active = progress >= 1 ? Math.floor(time / 1400) % LOCALES.length : 0;
  drawLabel(ctx, "Locales", zone.x + 2, zone.y + zone.h * 0.15, small, muted, "left", true);
  const font = fit(2, zone.w / 3 - 14, small);
  const cell = zone.w / LOCALES.length;
  LOCALES.forEach((code, index) => {
    const on = index === active ? easeOutCubic(seg(progress, 0.4, 0.7)) : 0;
    const cx = zone.x + cell * (index + 0.5);
    const cy = zone.y + zone.h * 0.62;
    const r = Math.min(cell * 0.34, zone.h * 0.3);
    circlePath(ctx, cx, cy, r);
    ctx.fillStyle = tint(palette, on, 0.1 + 0.2 * on);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, on, 0.35 + 0.6 * on);
    ctx.stroke();
    drawLabel(ctx, code, cx, cy, font, on > 0.5 ? ink : muted, "center", on > 0.5);
  });
};

const drawPipeline = (scene: Scene): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const zone = scene.box(0.69, 0.71, 0.31, 0.27);
  drawLabel(ctx, "Pipeline", zone.x + 2, zone.y + zone.h * 0.12, small, muted, "left", true);
  const cell = zone.w / STEPS.length;
  const y = zone.y + zone.h * 0.5;
  const lead = progress >= 1 ? 1 : seg(progress, 0.2, 0.95);
  const left = zone.x + cell * 0.5;
  const right = zone.x + cell * 2.5;
  ctx.lineCap = "round";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.strokeStyle = scene.faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + (right - left) * lead, y);
  ctx.strokeStyle = tint(palette, lead);
  ctx.stroke();
  const pulse = progress >= 1 ? ((time % 3200) / 3200) * (right - left) : 0;
  if (progress >= 1) {
    dot(ctx, left + pulse, y, small * 0.3, tint(palette, 1));
  }
  STEPS.forEach((name, index) => {
    const x = left + (right - left) * (index / 2);
    const on = seg(lead, index / 2 - 0.05, index / 2 + 0.05);
    const r = Math.min(cell * 0.2, zone.h * 0.15);
    dot(ctx, x, y, r * 1.2, scene.surface);
    circlePath(ctx, x, y, r);
    ctx.lineWidth = 1.3;
    ctx.strokeStyle = tint(palette, on, 0.4 + 0.6 * on);
    ctx.stroke();
    strokeTick(ctx, x, y, r * 0.85, on);
    drawLabel(
      ctx,
      name,
      x,
      zone.y + zone.h * 0.82,
      fit(6, cell - 4, small),
      on > 0.5 ? ink : muted,
      "center",
      on > 0.5
    );
  });
};

export const drawNextjsArchitecture = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawPackets(scene);
  drawLayers(scene);
  drawTree(scene);
  drawLocales(scene);
  drawPipeline(scene);
};

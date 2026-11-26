import { clamp01, easeInOutCubic, easeOutCubic, staggerProgress } from "../easing";
import { quadPoint, storefrontLayout, STOREFRONT_COLUMNS } from "../geometry";
import { mixRgb, rgba } from "../palette";
import type { DrawContext, Point, Rect } from "../types";
import { roundedRectPath } from "./shared";

const CYCLE_MS = 1600;
const FLIGHT = 0.6;
const PULSE = 0.2;
const BASE_COUNT = 2;
const COUNT_MODULO = 8;
const BADGE_FONT_RATIO = 0.62;

const drawMountains = (
  { ctx, palette, progress }: DrawContext,
  image: Rect,
  strength: number
): void => {
  ctx.save();
  roundedRectPath(ctx, image, 3);
  ctx.clip();
  ctx.fillStyle = rgba(palette.muted, 0.14);
  ctx.fillRect(image.x, image.y, image.w, image.h);
  ctx.fillStyle = rgba(mixRgb(palette.muted, palette.accent, progress * strength), 0.28);
  ctx.beginPath();
  ctx.moveTo(image.x, image.y + image.h);
  ctx.lineTo(image.x + image.w * 0.3, image.y + image.h * 0.4);
  ctx.lineTo(image.x + image.w * 0.52, image.y + image.h * 0.72);
  ctx.lineTo(image.x + image.w * 0.72, image.y + image.h * 0.3);
  ctx.lineTo(image.x + image.w, image.y + image.h * 0.8);
  ctx.lineTo(image.x + image.w, image.y + image.h);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(image.x + image.w * 0.8, image.y + image.h * 0.26, image.h * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
};

const drawTile = (dc: DrawContext, tile: Rect, lift: number, active: boolean): void => {
  const { ctx, palette, progress } = dc;
  const pad = tile.w * 0.07;
  const cx = tile.x + tile.w / 2;
  const cy = tile.y + tile.h / 2;
  const scale = 1 + 0.05 * lift;
  ctx.save();
  ctx.translate(cx, cy - tile.h * 0.05 * lift);
  ctx.scale(scale, scale);
  ctx.translate(-cx, -cy);

  roundedRectPath(ctx, tile, 5);
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.fill();
  ctx.lineWidth = active ? 1.5 : 1;
  ctx.strokeStyle = active ? rgba(palette.accent, 0.95) : rgba(palette.strong, 0.45);
  ctx.stroke();

  const image: Rect = { x: tile.x + pad, y: tile.y + pad, w: tile.w - pad * 2, h: tile.h * 0.46 };
  drawMountains(dc, image, active ? 1 : 0.4 * lift);

  const lineH = Math.max(2, tile.h * 0.055);
  const lineY = image.y + image.h + pad * 0.9;
  ctx.fillStyle = rgba(palette.strong, 0.5);
  roundedRectPath(ctx, { x: image.x, y: lineY, w: image.w * 0.72, h: lineH }, lineH / 2);
  ctx.fill();
  ctx.fillStyle = rgba(palette.muted, 0.45);
  const lineTwoY = lineY + lineH * 1.9;
  roundedRectPath(ctx, { x: image.x, y: lineTwoY, w: image.w * 0.42, h: lineH }, lineH / 2);
  ctx.fill();

  const pillH = lineH * 2.1;
  const pillW = image.w * 0.3;
  roundedRectPath(
    ctx,
    { x: image.x + image.w - pillW, y: lineTwoY + lineH - pillH / 2, w: pillW, h: pillH },
    pillH / 2
  );
  ctx.fillStyle = rgba(mixRgb(palette.muted, palette.accent, progress * (active ? 1 : 0.5)), 0.7);
  ctx.fill();
  ctx.restore();
};

const drawCart = (
  { ctx, palette, progress }: DrawContext,
  centre: Point,
  size: number,
  pulse: number,
  count: number
): void => {
  const s = size * (1 + 0.12 * pulse);
  const tone = mixRgb(palette.strong, palette.accent, Math.max(progress * 0.8, pulse));
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = rgba(tone, 1);
  ctx.beginPath();
  ctx.moveTo(centre.x - s * 0.55, centre.y - s * 0.4);
  ctx.lineTo(centre.x - s * 0.3, centre.y - s * 0.4);
  ctx.lineTo(centre.x - s * 0.12, centre.y + s * 0.15);
  ctx.lineTo(centre.x + s * 0.4, centre.y + s * 0.15);
  ctx.lineTo(centre.x + s * 0.5, centre.y - s * 0.2);
  ctx.lineTo(centre.x - s * 0.24, centre.y - s * 0.2);
  ctx.stroke();
  ctx.fillStyle = rgba(tone, 1);
  ctx.beginPath();
  ctx.arc(centre.x - s * 0.02, centre.y + s * 0.38, s * 0.07, 0, Math.PI * 2);
  ctx.arc(centre.x + s * 0.34, centre.y + s * 0.38, s * 0.07, 0, Math.PI * 2);
  ctx.fill();

  const radius = s * 0.26 * (1 + 0.3 * pulse);
  const badge: Point = { x: centre.x + s * 0.5, y: centre.y - s * 0.5 };
  ctx.beginPath();
  ctx.arc(badge.x, badge.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = rgba(mixRgb(palette.muted, palette.accent, Math.max(progress, 0.4)), 1);
  ctx.fill();
  ctx.font = `bold ${Math.round(radius * 2 * BADGE_FONT_RATIO)}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = rgba(palette.surface, 1);
  ctx.fillText(String(count), badge.x, badge.y + 0.5);
  ctx.textAlign = "left";
};

export const drawStorefront = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const layout = storefrontLayout(width, height);
  const tileCount = layout.tiles.length;

  const animated = progress > 0;
  const cycle = animated ? Math.floor(time / CYCLE_MS) : 0;
  const phase = animated ? (time % CYCLE_MS) / CYCLE_MS : 0;
  const activeIndex = animated ? (cycle * 5) % tileCount : -1;
  const arrived = animated && phase >= FLIGHT;

  const brand = layout.area;
  ctx.fillStyle = rgba(palette.strong, 0.5);
  roundedRectPath(
    ctx,
    { x: brand.x, y: brand.y + brand.h * 0.04, w: brand.w * 0.22, h: brand.h * 0.06 },
    brand.h * 0.03
  );
  ctx.fill();
  ctx.fillStyle = rgba(palette.muted, 0.4);
  roundedRectPath(
    ctx,
    {
      x: brand.x + brand.w * 0.26,
      y: brand.y + brand.h * 0.045,
      w: brand.w * 0.12,
      h: brand.h * 0.05,
    },
    brand.h * 0.025
  );
  ctx.fill();

  layout.tiles.forEach((tile, index) => {
    const row = Math.floor(index / STOREFRONT_COLUMNS);
    const col = index % STOREFRONT_COLUMNS;
    const lift = easeOutCubic(staggerProgress(progress, row + col, 4, 0.55));
    drawTile(dc, tile, lift, index === activeIndex);
  });

  const pulse =
    arrived && phase < FLIGHT + PULSE ? Math.sin((Math.PI * (phase - FLIGHT)) / PULSE) : 0;
  const count = BASE_COUNT + (cycle % COUNT_MODULO) + (arrived ? 1 : 0);
  drawCart(dc, layout.cart, layout.cartSize, pulse, count);

  if (animated && !arrived) {
    const tile = layout.tiles[activeIndex];
    const from: Point = { x: tile.x + tile.w / 2, y: tile.y + tile.h / 2 };
    const control: Point = {
      x: (from.x + layout.cart.x) / 2,
      y: Math.min(from.y, layout.cart.y) - layout.area.h * 0.18,
    };
    const point = quadPoint(from, control, layout.cart, easeInOutCubic(phase / FLIGHT));
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(2.5, layout.area.h * 0.025), 0, Math.PI * 2);
    ctx.fillStyle = rgba(palette.accentGlow, clamp01(progress * 1.5));
    ctx.fill();
  }
};

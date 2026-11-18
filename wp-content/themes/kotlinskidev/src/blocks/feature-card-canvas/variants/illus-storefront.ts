import { clamp01, easeOutCubic } from "../easing";
import { fitFullArea } from "../geometry";
import { rgba } from "../palette";
import type { DrawContext, Rect } from "../types";
import {
  circlePath,
  dot,
  drawLabel,
  fillRounded,
  pill,
  roundedRectPath,
  strokeTick,
  tint,
} from "./shared";

interface Product {
  name: string;
  price: number;
  rating: number;
}

const PRODUCTS: readonly Product[] = [
  { name: "Backpack", price: 48, rating: 5 },
  { name: "Desk lamp", price: 62, rating: 4 },
  { name: "Bottle", price: 19, rating: 5 },
];
const SNIPPETS = ["<Hero />", "npm run build"] as const;
const MENU = ["Home", "Shop", "About"] as const;
const CYCLE_MS = 1400;
const SNIPPET_MS = 2600;
const DEVICE_MS = 1000;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const starPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void => {
  ctx.beginPath();
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    const radius = index % 2 === 0 ? r : r * 0.45;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
};

const cartIcon = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  style: string
): void => {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1.2, r * 0.18);
  ctx.strokeStyle = style;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.9, y - r * 0.7);
  ctx.lineTo(x - r * 0.5, y - r * 0.7);
  ctx.lineTo(x - r * 0.25, y + r * 0.3);
  ctx.lineTo(x + r * 0.7, y + r * 0.3);
  ctx.lineTo(x + r * 0.9, y - r * 0.35);
  ctx.lineTo(x - r * 0.42, y - r * 0.35);
  ctx.stroke();
  dot(ctx, x - r * 0.1, y + r * 0.78, r * 0.16, style);
  dot(ctx, x + r * 0.55, y + r * 0.78, r * 0.16, style);
};

export const drawIllusStorefront = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitFullArea(width, height);
  const box = (u: number, v: number, w: number, h: number): Rect => ({
    x: area.x + u * area.w,
    y: area.y + v * area.h,
    w: w * area.w,
    h: h * area.h,
  });
  const soft = rgba(palette.muted, 0.4);
  const faint = rgba(palette.muted, 0.2);
  const strong = rgba(palette.strong, 0.5);
  const ink = rgba(palette.strong, 0.85);
  const surface = rgba(palette.surface, 1);
  const outline = rgba(palette.line, 0.9);
  const win = box(0, 0, 1, 1);
  const live = progress >= 0.8;
  const drift = clamp01(progress * 4);
  const text = area.h * 0.03;
  const small = area.h * 0.024;

  fillRounded(ctx, win, 8, surface);
  [0.04, 0.075, 0.11].forEach((u) =>
    dot(ctx, area.x + u * area.w, area.y + area.h * 0.04, area.h * 0.012, soft)
  );
  const address = box(0.2, 0.017, 0.6, 0.045);
  pill(ctx, address.x, address.y, address.w, address.h, faint);
  drawLabel(
    ctx,
    "shop.example.com",
    address.x + address.w / 2,
    address.y + address.h / 2,
    small,
    rgba(palette.strong, 0.6),
    "center"
  );

  const navMid = area.y + area.h * 0.13;
  const mark = area.h * 0.04;
  const markX = area.x + area.w * 0.035;
  fillRounded(
    ctx,
    { x: markX, y: navMid - mark / 2, w: mark, h: mark },
    mark * 0.3,
    tint(palette, progress, 0.6 + 0.4 * progress)
  );
  dot(ctx, markX + mark / 2, navMid, mark * 0.16, surface);
  drawLabel(ctx, "Atelier", markX + mark + 6, navMid, text, ink, "left", true);
  MENU.forEach((item, index) => {
    const x = area.x + area.w * (0.36 + index * 0.1);
    const active = index === 1;
    drawLabel(
      ctx,
      item,
      x,
      navMid,
      small,
      active ? tint(palette, progress) : rgba(palette.strong, 0.6)
    );
    if (active) {
      const underline = area.w * 0.045 * easeOutCubic(seg(progress, 0.1, 0.5));
      pill(ctx, x, navMid + area.h * 0.025, underline, 2, tint(palette, 1));
    }
  });
  const cartX = area.x + area.w * 0.93;
  const cartR = area.h * 0.032;
  cartIcon(ctx, cartX, navMid, cartR, ink);
  const cycle = Math.floor(time / CYCLE_MS);
  const phase = (time % CYCLE_MS) / CYCLE_MS;
  const landed = live && phase > 0.6 ? 1 : 0;
  const count = Math.round(2 * progress) + (live ? (cycle + landed) % 10 : 0);
  const badgePulse = landed === 1 ? 1 + 0.25 * Math.sin(seg(phase, 0.6, 0.8) * Math.PI) : 1;
  dot(
    ctx,
    cartX + cartR * 0.9,
    navMid - cartR * 0.8,
    cartR * 0.55 * badgePulse,
    tint(palette, progress, 0.6 + 0.4 * progress)
  );
  drawLabel(
    ctx,
    String(count),
    cartX + cartR * 0.9,
    navMid - cartR * 0.8,
    small * 0.85,
    surface,
    "center",
    true
  );
  pill(ctx, area.x + area.w * 0.03, area.y + area.h * 0.175, area.w * 0.94, 1, outline);

  const hero = box(0.03, 0.2, 0.94, 0.26);
  fillRounded(ctx, hero, 6, faint);
  fillRounded(ctx, hero, 6, rgba(palette.accent, 0.1 * progress));
  const line1 = box(0.06, 0.23, 0.36, 0.04);
  pill(ctx, line1.x, line1.y, line1.w, line1.h, strong);
  const line2 = box(0.06, 0.285, 0.26, 0.04);
  pill(ctx, line2.x, line2.y, line2.w, line2.h, strong);
  const sub = box(0.06, 0.34, 0.3, 0.02);
  pill(ctx, sub.x, sub.y, sub.w, sub.h, soft);
  const cta = box(0.06, 0.375, 0.17, 0.06);
  const pulse = 1 + 0.04 * drift * Math.sin(time / 500);
  const ctaW = cta.w * pulse;
  const ctaH = cta.h * pulse;
  pill(
    ctx,
    cta.x + (cta.w - ctaW) / 2,
    cta.y + (cta.h - ctaH) / 2,
    ctaW,
    ctaH,
    tint(palette, progress, 0.6 + 0.4 * progress)
  );
  drawLabel(ctx, "Shop now", cta.x + cta.w / 2, cta.y + cta.h / 2, small, surface, "center", true);

  const art = box(0.64, 0.22, 0.31, 0.22);
  fillRounded(ctx, art, 5, rgba(palette.accent, 0.1 + 0.1 * progress));
  const bob = drift * Math.sin(time / 1300) * art.h * 0.03;
  dot(ctx, art.x + art.w * 0.75, art.y + art.h * 0.3 + bob, art.h * 0.12, tint(palette, progress));
  const base = art.y + art.h;
  ctx.beginPath();
  ctx.moveTo(art.x, base);
  ctx.lineTo(art.x + art.w * 0.3, art.y + art.h * 0.4);
  ctx.lineTo(art.x + art.w * 0.5, art.y + art.h * 0.65);
  ctx.lineTo(art.x + art.w * 0.68, art.y + art.h * 0.5);
  ctx.lineTo(art.x + art.w, base);
  ctx.closePath();
  ctx.fillStyle = tint(palette, progress, 0.45 + 0.2 * progress);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(art.x + art.w * 0.3, art.y + art.h * 0.4);
  ctx.lineTo(art.x + art.w * 0.38, art.y + art.h * 0.52);
  ctx.lineTo(art.x + art.w * 0.3, art.y + art.h * 0.5);
  ctx.lineTo(art.x + art.w * 0.24, art.y + art.h * 0.52);
  ctx.closePath();
  ctx.fillStyle = surface;
  ctx.fill();

  let buttonPoint: [number, number] | null = null;
  PRODUCTS.forEach((product, index) => {
    const lit = seg(progress, index * 0.14, index * 0.14 + 0.3);
    const card = box(0.03 + index * 0.32, 0.49, 0.3, 0.34);
    fillRounded(ctx, card, 6, surface);
    roundedRectPath(ctx, card, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = outline;
    ctx.stroke();
    const image = {
      x: card.x + card.w * 0.05,
      y: card.y + card.h * 0.05,
      w: card.w * 0.9,
      h: card.h * 0.46,
    };
    fillRounded(ctx, image, 4, faint);
    fillRounded(ctx, image, 4, rgba(palette.accent, 0.1 * lit));
    const cx = image.x + image.w / 2;
    const cy = image.y + image.h / 2;
    const s = image.h * 0.3;
    const glyph = tint(palette, lit, 0.7);
    if (index === 0) {
      fillRounded(
        ctx,
        { x: cx - s * 0.8, y: cy - s * 0.7, w: s * 1.6, h: s * 1.7 },
        s * 0.5,
        glyph
      );
      fillRounded(
        ctx,
        { x: cx - s * 0.45, y: cy + s * 0.1, w: s * 0.9, h: s * 0.5 },
        s * 0.15,
        surface
      );
    } else if (index === 1) {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.5, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.5, cy - s * 0.9);
      ctx.lineTo(cx + s * 0.9, cy - s * 0.1);
      ctx.lineTo(cx - s * 0.9, cy - s * 0.1);
      ctx.closePath();
      ctx.fillStyle = glyph;
      ctx.fill();
      fillRounded(ctx, { x: cx - s * 0.08, y: cy - s * 0.1, w: s * 0.16, h: s * 0.9 }, 1, glyph);
      fillRounded(ctx, { x: cx - s * 0.5, y: cy + s * 0.75, w: s, h: s * 0.18 }, 2, glyph);
    } else {
      fillRounded(ctx, { x: cx - s * 0.32, y: cy - s * 0.95, w: s * 0.64, h: s * 0.3 }, 2, glyph);
      fillRounded(
        ctx,
        { x: cx - s * 0.55, y: cy - s * 0.7, w: s * 1.1, h: s * 1.7 },
        s * 0.3,
        glyph
      );
      fillRounded(ctx, { x: cx - s * 0.55, y: cy - s * 0.05, w: s * 1.1, h: s * 0.35 }, 0, surface);
    }

    const left = card.x + card.w * 0.07;
    drawLabel(ctx, product.name, left, card.y + card.h * 0.63, text, ink, "left", true);
    const starR = card.h * 0.055;
    for (let star = 0; star < 5; star += 1) {
      starPath(ctx, left + starR + star * starR * 2.3, card.y + card.h * 0.77, starR);
      ctx.fillStyle = star < product.rating ? tint(palette, lit) : faint;
      ctx.fill();
    }
    drawLabel(
      ctx,
      `€${Math.round(product.price * easeOutCubic(lit))}`,
      left,
      card.y + card.h * 0.91,
      text,
      tint(palette, lit),
      "left",
      true
    );

    const bx = card.x + card.w * 0.84;
    const by = card.y + card.h * 0.85;
    const br = card.h * 0.09;
    const active = live && index === cycle % PRODUCTS.length;
    const squeeze = active ? 1 - 0.18 * Math.sin(seg(phase, 0, 0.25) * Math.PI) : 1;
    dot(ctx, bx, by, br * squeeze, tint(palette, lit, 0.4 + 0.6 * lit));
    ctx.lineCap = "round";
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = surface;
    if (active && phase > 0.25 && phase < 0.85) {
      strokeTick(ctx, bx, by, br, seg(phase, 0.25, 0.4));
    } else {
      ctx.beginPath();
      ctx.moveTo(bx - br * 0.45, by);
      ctx.lineTo(bx + br * 0.45, by);
      ctx.moveTo(bx, by - br * 0.45);
      ctx.lineTo(bx, by + br * 0.45);
      ctx.stroke();
    }
    if (active) {
      if (phase < 0.4) {
        circlePath(ctx, bx, by, br * (1 + 1.2 * seg(phase, 0, 0.4)));
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = tint(palette, 1, 0.8 * (1 - seg(phase, 0, 0.4)));
        ctx.stroke();
      }
      buttonPoint = [bx, by];
    }
  });
  if (buttonPoint !== null && phase > 0.1 && phase < 0.6) {
    const t = easeOutCubic(seg(phase, 0.1, 0.6));
    const [fromX, fromY] = buttonPoint;
    const arc = Math.sin(t * Math.PI) * area.h * 0.12;
    dot(
      ctx,
      fromX + (cartX - fromX) * t,
      fromY + (navMid - fromY) * t - arc,
      cartR * 0.4 * (1 - 0.4 * t),
      tint(palette, 1)
    );
  }

  const devices = [
    box(0.03, 0.885, 0.09, 0.08),
    box(0.14, 0.875, 0.055, 0.09),
    box(0.215, 0.88, 0.032, 0.085),
  ];
  const deviceOn = live ? Math.floor(time / DEVICE_MS) % 3 : 0;
  devices.forEach((device, index) => {
    const on = index === deviceOn ? progress : 0;
    fillRounded(ctx, device, 3, rgba(palette.accent, 0.15 * on));
    roundedRectPath(ctx, device, 3);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, on, 0.55 + 0.45 * on);
    ctx.stroke();
    pill(
      ctx,
      device.x + device.w * 0.15,
      device.y + device.h * 0.18,
      device.w * 0.7,
      Math.max(1.5, device.h * 0.1),
      soft
    );
    fillRounded(
      ctx,
      {
        x: device.x + device.w * 0.15,
        y: device.y + device.h * 0.42,
        w: device.w * 0.7,
        h: device.h * 0.4,
      },
      2,
      tint(palette, on, 0.3 + 0.2 * on)
    );
  });

  const slide = easeOutCubic(seg(progress, 0.3, 0.7));
  const snippet = box(0.31, 0.88, 0.66, 0.085);
  const snippetIndex = live ? Math.floor(time / SNIPPET_MS) % SNIPPETS.length : 0;
  const code = SNIPPETS[snippetIndex];
  const typed = live ? seg((time % SNIPPET_MS) / SNIPPET_MS, 0, 0.3) : seg(progress, 0.4, 0.8);
  const shown = Math.round(code.length * (snippetIndex === 0 && live ? 1 : typed));
  const offset = (1 - slide) * area.w * 0.25;
  ctx.save();
  ctx.globalAlpha = slide;
  const chip = { ...snippet, x: snippet.x + offset };
  fillRounded(ctx, chip, 5, faint);
  roundedRectPath(ctx, chip, 5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, slide, 0.6);
  ctx.stroke();
  drawLabel(
    ctx,
    ">",
    chip.x + chip.w * 0.04,
    chip.y + chip.h / 2,
    text,
    tint(palette, 1),
    "left",
    true
  );
  drawLabel(
    ctx,
    code.slice(0, shown),
    chip.x + chip.w * 0.1,
    chip.y + chip.h / 2,
    text,
    ink,
    "left"
  );
  ctx.restore();

  roundedRectPath(ctx, win, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
};

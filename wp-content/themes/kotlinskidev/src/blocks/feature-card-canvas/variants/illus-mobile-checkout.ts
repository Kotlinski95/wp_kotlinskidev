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

interface OrderLine {
  name: string;
  price: number;
}

const ORDER: readonly OrderLine[] = [
  { name: "Sneakers", price: 89 },
  { name: "Backpack", price: 64 },
  { name: "Cap", price: 43 },
];
const TOTAL = ORDER.reduce((sum, line) => sum + line.price, 0);
const METHODS = ["Card", "Wallet", "Shop"] as const;
const STACK = ["Next.js", "Angular", "Shopify"] as const;
const STOCK: ReadonlyArray<readonly [string, number]> = [
  ["Sneakers", 0.7],
  ["Backpack", 0.45],
  ["Cap", 0.85],
];
const METHOD_MS = 1500;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

type Glyph = "card" | "wallet" | "bag";

const drawGlyph = (
  ctx: CanvasRenderingContext2D,
  kind: Glyph,
  cx: number,
  cy: number,
  s: number,
  style: string,
  cut: string
): void => {
  if (kind === "card") {
    fillRounded(ctx, { x: cx - s, y: cy - s * 0.65, w: s * 2, h: s * 1.3 }, s * 0.2, style);
    ctx.fillStyle = cut;
    ctx.fillRect(cx - s, cy - s * 0.3, s * 2, s * 0.3);
    fillRounded(ctx, { x: cx - s * 0.75, y: cy + s * 0.2, w: s * 0.6, h: s * 0.2 }, 1, cut);
  } else if (kind === "wallet") {
    fillRounded(ctx, { x: cx - s, y: cy - s * 0.6, w: s * 2, h: s * 1.2 }, s * 0.25, style);
    fillRounded(ctx, { x: cx + s * 0.1, y: cy - s * 0.2, w: s * 0.9, h: s * 0.4 }, s * 0.2, cut);
    dot(ctx, cx + s * 0.4, cy, s * 0.1, style);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.8, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.8, cy - s * 0.3);
    ctx.lineTo(cx + s * 0.95, cy + s * 0.8);
    ctx.lineTo(cx - s * 0.95, cy + s * 0.8);
    ctx.closePath();
    ctx.fillStyle = style;
    ctx.fill();
    ctx.lineWidth = Math.max(1.2, s * 0.18);
    ctx.lineCap = "round";
    ctx.strokeStyle = style;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.3, s * 0.45, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = Math.max(1, s * 0.14);
    ctx.strokeStyle = cut;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.2, cy + s * 0.05);
    ctx.quadraticCurveTo(cx + s * 0.3, cy + s * 0.15, cx, cy + s * 0.35);
    ctx.quadraticCurveTo(cx - s * 0.3, cy + s * 0.55, cx + s * 0.2, cy + s * 0.6);
    ctx.stroke();
  }
};

export const drawIllusMobileCheckout = (dc: DrawContext): void => {
  const { ctx, width, height, time, progress, palette } = dc;
  ctx.clearRect(0, 0, width, height);
  const area = fitFullArea(width, height);
  const soft = rgba(palette.muted, 0.4);
  const faint = rgba(palette.muted, 0.2);
  const strong = rgba(palette.strong, 0.5);
  const ink = rgba(palette.strong, 0.85);
  const quiet = rgba(palette.strong, 0.6);
  const surface = rgba(palette.surface, 1);
  const outline = rgba(palette.line, 0.9);
  const text = area.h * 0.027;
  const small = area.h * 0.022;
  const live = progress >= 1;
  const pw = area.h * 0.46;
  const phone = { x: area.x + (area.w - pw) / 2, y: area.y, w: pw, h: area.h };
  const at = (u: number, v: number): [number, number] => [
    phone.x + u * phone.w,
    phone.y + v * phone.h,
  ];
  const radius = phone.w * 0.14;
  const sideW = area.w * 0.25;
  const picked = live ? Math.floor(time / METHOD_MS) % METHODS.length : 0;
  const paid = seg(progress, 0.78, 1);

  const panel = (rect: Rect, title: string): void => {
    fillRounded(ctx, rect, 6, surface);
    roundedRectPath(ctx, rect, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = outline;
    ctx.stroke();
    drawLabel(
      ctx,
      title,
      rect.x + rect.w * 0.08,
      rect.y + rect.h * 0.1,
      small,
      quiet,
      "left",
      true
    );
  };

  const orders = { x: area.x, y: area.y + area.h * 0.05, w: sideW, h: area.h * 0.5 };
  panel(orders, "Order #1042");
  ORDER.forEach((line, index) => {
    const y = orders.y + orders.h * (0.28 + index * 0.17);
    const shown = seg(progress, 0.1 + index * 0.1, 0.3 + index * 0.1);
    ctx.globalAlpha = 0.35 + 0.65 * shown;
    drawLabel(ctx, line.name, orders.x + orders.w * 0.08, y, small, ink);
    drawLabel(ctx, `€${line.price}`, orders.x + orders.w * 0.92, y, small, ink, "right", true);
    ctx.globalAlpha = 1;
  });
  const sum = Math.round(TOTAL * easeOutCubic(seg(progress, 0.3, 0.8)));
  pill(ctx, orders.x + orders.w * 0.08, orders.y + orders.h * 0.76, orders.w * 0.84, 1, outline);
  drawLabel(ctx, "Total", orders.x + orders.w * 0.08, orders.y + orders.h * 0.88, small, quiet);
  drawLabel(
    ctx,
    `€${sum}`,
    orders.x + orders.w * 0.92,
    orders.y + orders.h * 0.88,
    text,
    tint(palette, progress),
    "right",
    true
  );

  const stock = { x: area.x, y: area.y + area.h * 0.6, w: sideW, h: area.h * 0.35 };
  panel(stock, "Inventory");
  STOCK.forEach(([name, level], index) => {
    const y = stock.y + stock.h * (0.38 + index * 0.24);
    const left = level - 0.12 * paid * (index + 1) * 0.5;
    drawLabel(ctx, name, stock.x + stock.w * 0.08, y, small * 0.95, quiet);
    const trackX = stock.x + stock.w * 0.5;
    const trackW = stock.w * 0.42;
    pill(ctx, trackX, y - 2.5, trackW, 5, faint);
    pill(
      ctx,
      trackX,
      y - 2.5,
      Math.max(5, trackW * left),
      5,
      tint(palette, progress, 0.4 + 0.5 * progress)
    );
  });

  const rightX = area.x + area.w - sideW;
  const pay = { x: rightX, y: area.y + area.h * 0.05, w: sideW, h: area.h * 0.5 };
  panel(pay, "Payment");
  const glyphKinds: readonly Glyph[] = ["card", "wallet", "bag"];
  METHODS.forEach((method, index) => {
    const chip = {
      x: pay.x + pay.w * 0.07,
      y: pay.y + pay.h * (0.2 + index * 0.26),
      w: pay.w * 0.86,
      h: pay.h * 0.22,
    };
    const on = index === picked ? seg(progress, 0.15, 0.4) : 0;
    fillRounded(ctx, chip, 5, rgba(palette.accent, 0.12 * on));
    roundedRectPath(ctx, chip, 5);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, on, 0.55 + 0.45 * on);
    ctx.stroke();
    drawGlyph(
      ctx,
      glyphKinds[index],
      chip.x + chip.h * 0.7,
      chip.y + chip.h / 2,
      chip.h * 0.3,
      tint(palette, on, 0.7),
      surface
    );
    drawLabel(ctx, method, chip.x + chip.h * 1.25, chip.y + chip.h / 2, small, ink);
    if (on > 0.5) {
      dot(
        ctx,
        chip.x + chip.w - chip.h * 0.35,
        chip.y + chip.h / 2,
        chip.h * 0.16,
        tint(palette, 1)
      );
    }
  });

  const platforms = { x: rightX, y: area.y + area.h * 0.6, w: sideW, h: area.h * 0.35 };
  panel(platforms, "Stack");
  STACK.forEach((name, index) => {
    const y = platforms.y + platforms.h * (0.38 + index * 0.24);
    const beat = live ? 0.5 + 0.5 * Math.sin(time / 500 + index * 1.7) : 0.5;
    drawLabel(ctx, name, platforms.x + platforms.w * 0.08, y, small, ink, "left", true);
    dot(
      ctx,
      platforms.x + platforms.w * 0.9,
      y,
      small * (0.3 + 0.12 * beat * progress),
      tint(palette, progress, 0.5 + 0.5 * beat * progress)
    );
  });

  const flows: ReadonlyArray<readonly [number, number, number, number, boolean]> = [
    [phone.x, area.y + area.h * 0.25, orders.x + orders.w, orders.y + orders.h * 0.5, false],
    [phone.x, area.y + area.h * 0.78, stock.x + stock.w, stock.y + stock.h * 0.5, false],
    [phone.x + phone.w, area.y + area.h * 0.25, pay.x, pay.y + pay.h * 0.5, true],
    [phone.x + phone.w, area.y + area.h * 0.78, platforms.x, platforms.y + platforms.h * 0.5, true],
  ];
  const flow = seg(progress, 0.3, 0.6);
  flows.forEach(([x1, y1, x2, y2, inbound], index) => {
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.line, 0.9);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    if (flow <= 0) {
      return;
    }
    for (let packet = 0; packet < 2; packet += 1) {
      const raw = (((time / 1100 + index * 0.27 + packet * 0.5) % 1) + 1) % 1;
      const t = inbound ? 1 - raw : raw;
      const fade = Math.sin(raw * Math.PI);
      dot(
        ctx,
        x1 + (x2 - x1) * t,
        y1 + (y2 - y1) * t,
        2.4,
        tint(palette, 1, flow * (0.3 + 0.7 * fade))
      );
    }
  });

  fillRounded(ctx, phone, radius, surface);
  const [headX, headY] = at(0.08, 0.075);
  drawLabel(ctx, "Your cart", headX, headY, text, ink, "left", true);
  drawLabel(ctx, "3 items", phone.x + phone.w * 0.92, headY, small, quiet, "right");
  ORDER.forEach((line, index) => {
    const [rowX, rowY] = at(0.08, 0.13 + index * 0.115);
    const thumb = phone.h * 0.085;
    fillRounded(ctx, { x: rowX, y: rowY, w: thumb, h: thumb }, 5, faint);
    dot(
      ctx,
      rowX + thumb / 2,
      rowY + thumb / 2,
      thumb * 0.22,
      tint(palette, progress, 0.5 + index * 0.15)
    );
    drawLabel(ctx, line.name, rowX + thumb + 8, rowY + thumb * 0.32, text, ink, "left", true);
    drawLabel(ctx, "Qty 1", rowX + thumb + 8, rowY + thumb * 0.72, small, quiet);
    drawLabel(
      ctx,
      `€${line.price}`,
      phone.x + phone.w * 0.92,
      rowY + thumb * 0.32,
      text,
      ink,
      "right",
      true
    );
  });
  const [totalX, totalY] = at(0.08, 0.485);
  pill(ctx, totalX, totalY - phone.h * 0.02, phone.w * 0.84, 1, outline);
  drawLabel(ctx, "Total", totalX, totalY + phone.h * 0.01, text, quiet);
  drawLabel(
    ctx,
    `€${sum}`,
    phone.x + phone.w * 0.92,
    totalY + phone.h * 0.01,
    text,
    tint(palette, progress),
    "right",
    true
  );

  ctx.save();
  roundedRectPath(ctx, phone, radius);
  ctx.clip();
  const slide = easeOutCubic(seg(progress, 0.1, 0.5));
  const sheetY = phone.y + phone.h * (1.02 - 0.5 * slide);
  const sheet = { x: phone.x, y: sheetY, w: phone.w, h: phone.h * 0.5 };
  fillRounded(ctx, { ...sheet, y: sheet.y - 3 }, radius, rgba(palette.strong, 0.1));
  fillRounded(ctx, sheet, radius, surface);
  roundedRectPath(ctx, sheet, radius);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = tint(palette, slide);
  ctx.stroke();
  pill(
    ctx,
    sheet.x + sheet.w * 0.38,
    sheet.y + sheet.h * 0.04,
    sheet.w * 0.24,
    sheet.h * 0.02,
    soft
  );
  const field = {
    x: sheet.x + sheet.w * 0.08,
    y: sheet.y + sheet.h * 0.12,
    w: sheet.w * 0.84,
    h: sheet.h * 0.15,
  };
  fillRounded(ctx, field, 5, faint);
  drawGlyph(
    ctx,
    "card",
    field.x + field.h * 0.8,
    field.y + field.h / 2,
    field.h * 0.28,
    tint(palette, slide, 0.7),
    faint
  );
  drawLabel(ctx, "•••• •••• 4242", field.x + field.h * 1.45, field.y + field.h / 2, small, ink);
  const chipW = sheet.w * 0.26;
  METHODS.forEach((method, index) => {
    const chip = {
      x: sheet.x + sheet.w * (0.08 + index * 0.29),
      y: sheet.y + sheet.h * 0.33,
      w: chipW,
      h: sheet.h * 0.16,
    };
    const on = index === picked ? slide : 0;
    fillRounded(ctx, chip, 5, rgba(palette.accent, 0.14 * on));
    roundedRectPath(ctx, chip, 5);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, on, 0.5 + 0.5 * on);
    ctx.stroke();
    drawGlyph(
      ctx,
      glyphKinds[index],
      chip.x + chip.w * 0.26,
      chip.y + chip.h / 2,
      chip.h * 0.24,
      tint(palette, on, 0.7),
      surface
    );
    drawLabel(
      ctx,
      method.slice(0, 4),
      chip.x + chip.w * 0.52,
      chip.y + chip.h / 2,
      small * 0.85,
      ink
    );
  });
  const press = seg(progress, 0.55, 0.75);
  const scale = 1 - 0.06 * Math.sin(press * Math.PI);
  const buttonW = sheet.w * 0.84 * scale;
  const buttonH = sheet.h * 0.2 * scale;
  const buttonCx = sheet.x + sheet.w / 2;
  const buttonCy = sheet.y + sheet.h * 0.72;
  pill(
    ctx,
    buttonCx - buttonW / 2,
    buttonCy - buttonH / 2,
    buttonW,
    buttonH,
    tint(palette, slide, 0.3 + 0.7 * slide)
  );
  drawLabel(ctx, `Pay €${TOTAL}`, buttonCx, buttonCy, text, surface, "center", true);
  if (press > 0 && press < 1) {
    circlePath(ctx, buttonCx, buttonCy, buttonH * (0.4 + 1.4 * press));
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = tint(palette, progress, 0.8 * (1 - press));
    ctx.stroke();
  }
  if (paid > 0) {
    ctx.globalAlpha = paid;
    fillRounded(ctx, phone, radius, surface);
    const [cx, cy] = at(0.5, 0.4);
    const r = phone.w * 0.2 * easeOutCubic(paid);
    const pulse = Math.sin(time / 700);
    dot(ctx, cx, cy, r * (1.3 + 0.04 * pulse), tint(palette, 1, 0.15));
    dot(ctx, cx, cy, r, rgba(palette.accent, 1));
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(2, r * 0.16);
    ctx.strokeStyle = surface;
    strokeTick(ctx, cx, cy, r, seg(progress, 0.85, 1));
    drawLabel(ctx, "Order confirmed", cx, cy + phone.h * 0.19, text, ink, "center", true);
    drawLabel(ctx, `#1042  €${TOTAL}`, cx, cy + phone.h * 0.245, small, quiet, "center");
    pill(ctx, cx - phone.w * 0.25, cy + phone.h * 0.3, phone.w * 0.5, phone.h * 0.03, strong);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  pill(
    ctx,
    phone.x + phone.w * 0.35,
    phone.y + phone.h * 0.02,
    phone.w * 0.3,
    phone.h * 0.02,
    strong
  );
  roundedRectPath(ctx, phone, radius);
  ctx.lineWidth = 2;
  ctx.strokeStyle = outline;
  ctx.stroke();
};

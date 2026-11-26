import { clamp01, easeOutBack, easeOutCubic } from "../easing";
import { fitFullArea, quadPoint } from "../geometry";
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

interface Scene {
  dc: DrawContext;
  area: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  font: number;
}

const FIELDS = ["Name", "Email", "Message"] as const;
const DAYS = ["M", "T", "W", "T", "F"] as const;
const SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"] as const;
const PICKED_SLOT = 4;
const SEND_MS = 4200;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const createScene = (dc: DrawContext): Scene => {
  const full = fitFullArea(dc.width, dc.height);
  const inset = Math.round(Math.min(dc.width, dc.height) * 0.05);
  const area: Rect = {
    x: full.x + inset,
    y: full.y + inset,
    w: full.w - inset * 2,
    h: full.h - inset,
  };
  const { palette } = dc;
  return {
    dc,
    area,
    box: (u, v, w, h) => ({
      x: area.x + u * area.w,
      y: area.y + v * area.h,
      w: w * area.w,
      h: h * area.h,
    }),
    faint: rgba(palette.muted, 0.2),
    soft: rgba(palette.muted, 0.4),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    font: Math.max(7, area.h * 0.04),
  };
};

const drawChat = (scene: Scene): void => {
  const { dc, box, faint, soft, surface, outline, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const first = easeOutCubic(seg(progress, 0, 0.25));
  const reply = easeOutBack(seg(progress, 0.4, 0.6), 1);
  const incoming = box(0, 0.01, 0.4, 0.14);
  ctx.globalAlpha = 0.4 + 0.6 * first;
  fillRounded(ctx, incoming, 8, surface);
  roundedRectPath(ctx, incoming, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  pill(
    ctx,
    incoming.x + incoming.w * 0.1,
    incoming.y + incoming.h * 0.3,
    incoming.w * 0.75,
    incoming.h * 0.14,
    soft
  );
  pill(
    ctx,
    incoming.x + incoming.w * 0.1,
    incoming.y + incoming.h * 0.58,
    incoming.w * 0.45,
    incoming.h * 0.14,
    faint
  );
  ctx.globalAlpha = 1;
  const outgoing = box(0.1, 0.18, 0.34, 0.11);
  const grown = Math.max(0, reply);
  ctx.save();
  ctx.translate(outgoing.x + outgoing.w, outgoing.y + outgoing.h);
  ctx.scale(grown, grown);
  fillRounded(
    ctx,
    { x: -outgoing.w, y: -outgoing.h, w: outgoing.w, h: outgoing.h },
    8,
    tint(palette, reply, 0.2 + 0.18 * reply)
  );
  roundedRectPath(ctx, { x: -outgoing.w, y: -outgoing.h, w: outgoing.w, h: outgoing.h }, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, reply, 0.4 + 0.5 * reply);
  ctx.stroke();
  pill(
    ctx,
    -outgoing.w * 0.88,
    -outgoing.h * 0.62,
    outgoing.w * 0.7,
    outgoing.h * 0.18,
    rgba(palette.strong, 0.5)
  );
  pill(ctx, -outgoing.w * 0.88, -outgoing.h * 0.32, outgoing.w * 0.4, outgoing.h * 0.18, soft);
  ctx.restore();
  const typing = box(0, 0.32, 0.2, 0.09);
  fillRounded(ctx, typing, typing.h / 2, faint);
  for (let index = 0; index < 3; index += 1) {
    const hop = Math.max(0, Math.sin(time / 260 - index * 0.7)) * font * 0.35 * progress;
    dot(
      ctx,
      typing.x + typing.w * (0.27 + index * 0.23),
      typing.y + typing.h / 2 - hop,
      font * 0.2,
      tint(palette, progress, 0.4 + 0.5 * progress)
    );
  }
};

const drawForm = (scene: Scene): Rect => {
  const { dc, box, soft, faint, ink, surface, muted, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const form = box(0.52, 0, 0.48, 0.52);
  fillRounded(ctx, form, 7, surface);
  roundedRectPath(ctx, form, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.4 + 0.5 * progress);
  ctx.stroke();
  const caretOn = Math.sin(time / 200) > 0;
  FIELDS.forEach((name, index) => {
    const tall = index === 2;
    const field = {
      x: form.x + form.w * 0.07,
      y: form.y + form.h * (0.12 + index * 0.24),
      w: form.w * 0.86,
      h: form.h * (tall ? 0.18 : 0.14),
    };
    drawLabel(ctx, name, field.x, field.y - form.h * 0.055, font * 0.75, muted);
    fillRounded(ctx, field, 3, faint);
    const fill = seg(progress, index * 0.2, 0.3 + index * 0.2);
    const typed = field.w * 0.72 * fill;
    pill(
      ctx,
      field.x + field.w * 0.05,
      field.y + field.h * (tall ? 0.22 : 0.4),
      typed,
      field.h * (tall ? 0.14 : 0.2),
      index === 0 ? tint(palette, fill, 0.6) : soft
    );
    if (tall && fill > 0.3) {
      pill(
        ctx,
        field.x + field.w * 0.05,
        field.y + field.h * 0.5,
        typed * 0.6,
        field.h * 0.14,
        soft
      );
    }
    const focused = fill > 0 && fill < 1;
    if (focused && caretOn) {
      ctx.fillStyle = tint(palette, 1);
      ctx.fillRect(
        field.x + field.w * 0.05 + typed + 2,
        field.y + field.h * 0.25,
        1.5,
        field.h * 0.5
      );
    }
    if (progress > 0 && fill > 0) {
      roundedRectPath(ctx, field, 3);
      ctx.lineWidth = 1;
      ctx.strokeStyle = tint(palette, focused ? 1 : fill, 0.4 + 0.5 * fill);
      ctx.stroke();
    }
  });
  const press = seg(progress, 0.7, 0.78) * (1 - seg(progress, 0.78, 0.86));
  const base = {
    x: form.x + form.w * 0.62,
    y: form.y + form.h * 0.83,
    w: form.w * 0.31,
    h: form.h * 0.11,
  };
  const button = {
    x: base.x + (base.w * 0.06 * press) / 2,
    y: base.y + (base.h * 0.1 * press) / 2,
    w: base.w * (1 - 0.06 * press),
    h: base.h * (1 - 0.1 * press),
  };
  const ready = seg(progress, 0.6, 0.75);
  fillRounded(ctx, button, button.h / 2, tint(palette, ready, 0.3 + 0.5 * ready - 0.12 * press));
  roundedRectPath(ctx, button, button.h / 2);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, ready);
  ctx.stroke();
  drawLabel(
    ctx,
    "Send",
    button.x + button.w / 2,
    button.y + button.h / 2,
    font * 0.9,
    ink,
    "center",
    true
  );
  return base;
};

const drawEnvelope = (scene: Scene, origin: Rect): void => {
  const { dc, area, box, surface, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const flight = progress >= 1 ? ((time % SEND_MS) / SEND_MS) * 1.4 : seg(progress, 0.8, 1) * 1.1;
  if (flight <= 0 || flight > 1.25) {
    return;
  }
  const t = clamp01(flight);
  const from = { x: origin.x + origin.w * 0.5, y: origin.y + origin.h };
  const to = { x: area.x + area.w * 0.46, y: box(0, 0.52, 0, 0).y + area.h * 0.045 };
  const control = { x: area.x + area.w * 0.72, y: area.y + area.h * 0.72 };
  for (let index = 5; index >= 1; index -= 1) {
    const p = quadPoint(from, control, to, clamp01(t - index * 0.05));
    dot(
      ctx,
      p.x,
      p.y,
      font * (0.32 - index * 0.04),
      rgba(palette.accentGlow, 0.5 * (1 - index / 6) * Math.min(1, progress))
    );
  }
  const p = quadPoint(from, control, to, easeOutCubic(t));
  const w = font * 2.1;
  const h = font * 1.5;
  const alpha = 1 - seg(flight, 1, 1.25);
  ctx.globalAlpha = alpha;
  const env = { x: p.x - w / 2, y: p.y - h / 2, w, h };
  fillRounded(ctx, env, 2, surface);
  roundedRectPath(ctx, env, 2);
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(env.x, env.y);
  ctx.lineTo(p.x, p.y + h * 0.1);
  ctx.lineTo(env.x + w, env.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
};

const drawStatus = (scene: Scene): void => {
  const { dc, box, ink, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const row = box(0, 0.48, 0.5, 0.09);
  const t = easeOutCubic(seg(progress, 0.7, 1));
  const cy = row.y + row.h / 2;
  const ping = ((time / 1400) % 1) * progress;
  circlePath(ctx, row.x + font * 0.7, cy, font * (0.4 + 0.7 * ping));
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, (1 - ping) * 0.6 * progress);
  ctx.stroke();
  dot(ctx, row.x + font * 0.7, cy, font * 0.4, tint(palette, t));
  drawLabel(ctx, "Replies within 24h", row.x + font * 1.6, cy, font * 0.9, ink, "left", true);
};

const drawChannels = (scene: Scene): void => {
  const { dc, box, surface, muted, font } = scene;
  const { ctx, progress, palette } = dc;
  const size = box(0, 0, 0, 0.16).h;
  const names = ["mail", "in", "phone"] as const;
  names.forEach((kind, index) => {
    const t = easeOutCubic(seg(progress, 0.3 + index * 0.1, 0.6 + index * 0.1));
    const tile = box(index * 0.125, 0.6, 0, 0);
    const rect = { x: tile.x, y: tile.y, w: size, h: size };
    fillRounded(ctx, rect, 6, surface);
    roundedRectPath(ctx, rect, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, t, 0.35 + 0.6 * t);
    ctx.stroke();
    const style = tint(palette, t, 0.6 + 0.4 * t);
    const cx = rect.x + size / 2;
    const cy = rect.y + size / 2;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = style;
    if (kind === "mail") {
      ctx.strokeRect(cx - size * 0.28, cy - size * 0.2, size * 0.56, size * 0.4);
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.28, cy - size * 0.2);
      ctx.lineTo(cx, cy + size * 0.04);
      ctx.lineTo(cx + size * 0.28, cy - size * 0.2);
      ctx.stroke();
    } else if (kind === "in") {
      drawLabel(ctx, "in", cx, cy, size * 0.42, style, "center", true);
    } else {
      roundedRectPath(
        ctx,
        { x: cx - size * 0.15, y: cy - size * 0.28, w: size * 0.3, h: size * 0.56 },
        3
      );
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.05, cy - size * 0.19);
      ctx.lineTo(cx + size * 0.05, cy - size * 0.19);
      ctx.moveTo(cx - size * 0.04, cy + size * 0.2);
      ctx.lineTo(cx + size * 0.04, cy + size * 0.2);
      ctx.stroke();
    }
  });
  drawLabel(
    ctx,
    "Get in touch",
    box(0, 0.9, 0, 0).x + 2,
    box(0, 0.9, 0, 0).y,
    font * 0.95,
    muted,
    "left",
    true
  );
};

const drawCalendar = (scene: Scene): void => {
  const { dc, box, surface, faint, ink, muted, outline, font } = scene;
  const { ctx, progress, time, palette } = dc;
  const cal = box(0.52, 0.58, 0.48, 0.42);
  fillRounded(ctx, cal, 7, surface);
  roundedRectPath(ctx, cal, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();
  DAYS.forEach((day, index) => {
    const x = cal.x + cal.w * (0.12 + index * 0.19);
    const y = cal.y + cal.h * 0.14;
    const pick = index === 2 ? easeOutCubic(seg(progress, 0.5, 0.75)) : 0;
    dot(ctx, x, y, font * 0.7, tint(palette, pick, 0.12 + 0.6 * pick));
    drawLabel(ctx, day, x, y, font * 0.8, pick > 0.5 ? surface : muted, "center", true);
  });
  SLOTS.forEach((slot, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const chip = {
      x: cal.x + cal.w * (0.06 + col * 0.31),
      y: cal.y + cal.h * (0.34 + row * 0.33),
      w: cal.w * 0.28,
      h: cal.h * 0.26,
    };
    const picked = index === PICKED_SLOT ? easeOutCubic(seg(progress, 0.65, 0.9)) : 0;
    const glow = picked * (0.5 + 0.5 * Math.sin(time / 500)) * 0.15;
    fillRounded(
      ctx,
      chip,
      4,
      picked > 0 ? tint(palette, picked, 0.2 + 0.2 * picked + glow) : faint
    );
    roundedRectPath(ctx, chip, 4);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, picked, 0.3 + 0.7 * picked);
    ctx.stroke();
    drawLabel(
      ctx,
      slot,
      chip.x + chip.w / 2,
      chip.y + chip.h / 2,
      font * 0.8,
      ink,
      "center",
      picked > 0.5
    );
    if (picked > 0) {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = tint(palette, picked);
      strokeTick(ctx, chip.x + chip.w - font * 0.6, chip.y + font * 0.2, font * 0.5, picked);
    }
  });
};

export const drawNavContact = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawChat(scene);
  drawCalendar(scene);
  drawChannels(scene);
  drawStatus(scene);
  const origin = drawForm(scene);
  drawEnvelope(scene, origin);
};

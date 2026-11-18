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

interface Scene {
  dc: DrawContext;
  area: Rect;
  box: (u: number, v: number, w: number, h: number) => Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  text: number;
  small: number;
}

const CHAR_WIDTH = 0.62;
const FLOW_MS = 2600;
const PIPE_MS = 3600;
const LAYERS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ["Frontend", ["React", "Next.js", "Angular"]],
  ["Backend", ["Node", "PHP", "WordPress"]],
  ["Delivery", ["CDN", "Cache", "Edge"]],
];
const STAGES = ["Code", "Build", "Test", "Audit", "Deploy"] as const;
const STAGE_BUDGET = [0.6, 0.72, 0.5, 0.82, 0.4] as const;
const TERMINAL: readonly string[] = ["main.js     43 KB", "main.css     9 KB", "images     180 KB"];
const COMMAND = "$ npm run build";
const BUDGETS: ReadonlyArray<readonly [string, number]> = [
  ["JS", 0.72],
  ["CSS", 0.45],
  ["Images", 0.6],
];
const DASH: number[] = [3, 3];
const NO_DASH: number[] = [];

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const fit = (chars: number, room: number, base: number): number =>
  Math.max(6, Math.min(base, room / (chars * CHAR_WIDTH)));

const createScene = (dc: DrawContext): Scene => {
  const area = fitFullArea(dc.width, dc.height);
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
    text: Math.max(7, area.h * 0.036),
    small: Math.max(6, area.h * 0.029),
  };
};

const drawStack = (scene: Scene): void => {
  const { dc, box, surface, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  LAYERS.forEach(([name, chips], index) => {
    const t = easeOutCubic(seg(progress, index * 0.14, 0.3 + index * 0.14));
    const band = box(0, index * 0.138, 0.47, 0.122);
    ctx.globalAlpha = 0.4 + 0.6 * t;
    fillRounded(ctx, band, 6, surface);
    roundedRectPath(ctx, band, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, t, 0.35 + 0.55 * t);
    ctx.stroke();
    const chars = name.length + chips.reduce((sum, chip) => sum + chip.length, 0);
    const font = fit(chars + 2, band.w - chips.length * 13 - 14, small);
    drawLabel(ctx, name, band.x + 8, band.y + band.h / 2, font, muted, "left", true);
    let cursor = band.x + band.w - 6;
    for (let item = chips.length - 1; item >= 0; item -= 1) {
      const chip = chips[item];
      const w = chip.length * font * CHAR_WIDTH + 10;
      cursor -= w;
      pill(ctx, cursor, band.y + band.h * 0.2, w, band.h * 0.6, tint(palette, t, 0.12 + 0.14 * t));
      drawLabel(ctx, chip, cursor + w / 2, band.y + band.h / 2, font, ink, "center");
      cursor -= 3;
    }
    ctx.globalAlpha = 1;
  });
};

const drawTerminal = (scene: Scene): void => {
  const { dc, box, surface, faint, soft, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const term = box(0.51, 0, 0.49, 0.43);
  fillRounded(ctx, term, 7, surface);
  roundedRectPath(ctx, term, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.4 + 0.5 * progress);
  ctx.stroke();
  const head = term.h * 0.16;
  [0, 1, 2].forEach((i) =>
    dot(
      ctx,
      term.x + head * (0.7 + i * 0.7),
      term.y + head / 2,
      head * 0.2,
      i === 0 ? tint(palette, progress, 0.6) : soft
    )
  );
  ctx.fillStyle = faint;
  ctx.fillRect(term.x + 1, term.y + head, term.w - 2, 1);
  const font = fit(COMMAND.length + 2, term.w - 20, small * 1.1);
  const typed = Math.floor(COMMAND.length * seg(progress, 0, 0.3));
  const rowH = (term.h - head - 8) / 4.9;
  const y0 = term.y + head + rowH * 0.6;
  drawLabel(ctx, COMMAND.slice(0, typed), term.x + 10, y0, font, ink, "left", true);
  TERMINAL.forEach((line, index) => {
    ctx.globalAlpha = seg(progress, 0.32 + index * 0.12, 0.45 + index * 0.12);
    drawLabel(ctx, line, term.x + 10, y0 + rowH * (index + 1), font, muted, "left");
    ctx.globalAlpha = 1;
  });
  const done = easeOutCubic(seg(progress, 0.75, 0.95));
  const doneY = y0 + rowH * 4;
  ctx.globalAlpha = done;
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = tint(palette, done);
  strokeTick(ctx, term.x + 10 + font * 0.5, doneY, font * 0.6, done);
  drawLabel(
    ctx,
    "built in 2.1s",
    term.x + 10 + font * 1.5,
    doneY,
    font,
    tint(palette, done),
    "left",
    true
  );
  ctx.globalAlpha = 1;
  if (typed < COMMAND.length || Math.sin(time / 220) > 0) {
    ctx.fillStyle = muted;
    ctx.fillRect(term.x + 10 + typed * font * CHAR_WIDTH + 1, y0 - font * 0.5, 1.6, font);
  }
};

const drawPipeline = (scene: Scene): void => {
  const { dc, box, surface, faint, ink, muted, small, area } = scene;
  const { ctx, progress, time, palette } = dc;
  const strip = box(0, 0.47, 1, 0.17);
  const left = strip.x + strip.w * 0.08;
  const right = strip.x + strip.w * 0.92;
  const y = strip.y + strip.h * 0.3;
  const lead = progress >= 1 ? 1 : seg(progress, 0.15, 0.9);
  ctx.lineCap = "round";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(right, y);
  ctx.strokeStyle = faint;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + (right - left) * lead, y);
  ctx.strokeStyle = tint(palette, lead);
  ctx.stroke();
  const pulse = ((time % PIPE_MS) / PIPE_MS) * progress;
  dot(
    ctx,
    left + (right - left) * pulse,
    y,
    area.h * 0.012,
    rgba(palette.accentGlow, 0.9 * progress)
  );
  STAGES.forEach((name, index) => {
    const x = left + ((right - left) * index) / (STAGES.length - 1);
    const on = seg(lead, index / 4 - 0.04, index / 4 + 0.04);
    const r = strip.h * 0.18;
    dot(ctx, x, y, r * 1.25, surface);
    circlePath(ctx, x, y, r);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = tint(palette, on, 0.4 + 0.6 * on);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    strokeTick(ctx, x, y, r * 0.85, on);
    drawLabel(
      ctx,
      name,
      x,
      y + strip.h * 0.4,
      fit(6, (right - left) / 4 - 6, small),
      on > 0.5 ? ink : muted,
      "center",
      on > 0.5
    );
    const bw = (right - left) * 0.12;
    const by = strip.y + strip.h * 0.84;
    const bh = strip.h * 0.07;
    pill(ctx, x - bw / 2, by, bw, bh, faint);
    pill(
      ctx,
      x - bw / 2,
      by,
      Math.max(bh, bw * STAGE_BUDGET[index] * on),
      bh,
      tint(palette, on, 0.4 + 0.6 * on)
    );
  });
};

const drawFlow = (scene: Scene): void => {
  const { dc, box, surface, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const zone = box(0, 0.7, 0.36, 0.3);
  const names = ["Browser", "Edge", "Origin"] as const;
  const nodeW = zone.w * 0.24;
  const nodeH = zone.h * 0.3;
  const font = fit(7, nodeW - 12, small);
  const cy = zone.y + zone.h * 0.4;
  const xs = [0, 1, 2].map((i) => zone.x + nodeW / 2 + ((zone.w - nodeW) * i) / 2);
  const reveal = easeOutCubic(seg(progress, 0.2, 0.6));
  const lane = xs[1] - xs[0] - nodeW;
  [0, 1].forEach((hop) => {
    ctx.setLineDash(DASH);
    ctx.beginPath();
    ctx.moveTo(xs[hop] + nodeW / 2, cy);
    ctx.lineTo(xs[hop + 1] - nodeW / 2, cy);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = tint(palette, reveal, 0.4 + 0.5 * reveal);
    ctx.stroke();
    ctx.setLineDash(NO_DASH);
  });
  names.forEach((name, index) => {
    const rect = { x: xs[index] - nodeW / 2, y: cy - nodeH / 2, w: nodeW, h: nodeH };
    fillRounded(ctx, rect, 4, surface);
    roundedRectPath(ctx, rect, 4);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, index === 1 ? reveal : 0, 0.4 + 0.5 * reveal);
    ctx.stroke();
    drawLabel(ctx, name, xs[index], cy, font, index === 1 ? ink : muted, "center", index === 1);
  });
  const phase = (time % FLOW_MS) / FLOW_MS;
  const glow = rgba(palette.accentGlow, 0.9 * progress * reveal);
  [0, 1, 2].forEach((packet) => {
    const f = 0.12 + 0.76 * ((phase + packet / 3) % 1);
    dot(ctx, xs[0] + nodeW / 2 + lane * f, cy - 3, small * 0.28, glow);
    if (packet === 1) {
      dot(ctx, xs[1] + nodeW / 2 + lane * f, cy - 3, small * 0.28, glow);
    } else {
      dot(
        ctx,
        xs[1] - nodeW / 2 - lane * f,
        cy + 4,
        small * 0.24,
        rgba(palette.accent, 0.6 * progress * reveal)
      );
    }
  });
  drawLabel(ctx, "request flow", zone.x, zone.y + zone.h * 0.85, small, muted, "left");
};

const drawGauge = (scene: Scene): void => {
  const { dc, box, surface, faint, ink, muted, small, text } = scene;
  const { ctx, progress, time, palette } = dc;
  const zone = box(0.39, 0.7, 0.24, 0.3);
  const e = easeOutCubic(seg(progress, 0.3, 0.85));
  const r = Math.min(zone.w * 0.38, zone.h * 0.5);
  const cx = zone.x + zone.w / 2;
  const cy = zone.y + zone.h * 0.62;
  fillRounded(ctx, zone, 7, surface);
  roundedRectPath(ctx, zone, 7);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, e, 0.35 + 0.55 * e);
  ctx.stroke();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(3, r * 0.22);
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
  ctx.strokeStyle = faint;
  ctx.stroke();
  const hit = 0.98 * e + 0.004 * Math.sin(time / 600) * progress;
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * hit);
  ctx.strokeStyle = tint(palette, e);
  ctx.stroke();
  drawLabel(
    ctx,
    `${Math.round(98 * e)}%`,
    cx,
    cy - r * 0.15,
    fit(4, r * 1.4, text * 1.3),
    ink,
    "center",
    true
  );
  drawLabel(ctx, "HIT", cx, zone.y + zone.h * 0.9, small, muted, "center", true);
};

const drawBudgets = (scene: Scene): void => {
  const { dc, box, faint, soft, ink, muted, small } = scene;
  const { ctx, progress, palette } = dc;
  const zone = box(0.67, 0.7, 0.33, 0.3);
  const label = zone.w * 0.26;
  drawLabel(
    ctx,
    "perf budget",
    zone.x,
    zone.y + zone.h * 0.08,
    fit(11, zone.w, small),
    muted,
    "left",
    true
  );
  BUDGETS.forEach(([name, used], index) => {
    const e = easeOutCubic(seg(progress, 0.35 + index * 0.1, 0.85 + index * 0.1));
    const y = zone.y + zone.h * (0.36 + index * 0.27);
    const trackX = zone.x + label;
    const trackW = zone.w - label - 4;
    const h = zone.h * 0.11;
    drawLabel(ctx, name, zone.x, y, fit(6, label - 2, small), ink, "left");
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

export const drawIllusAppServices = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  drawStack(scene);
  drawTerminal(scene);
  drawPipeline(scene);
  drawFlow(scene);
  drawGauge(scene);
  drawBudgets(scene);
};

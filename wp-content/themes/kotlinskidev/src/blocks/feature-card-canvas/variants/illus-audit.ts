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

interface Finding {
  title: string;
  tag: string;
  severity: number;
  saving: string;
  region: readonly [number, number, number, number];
}

const FINDINGS: readonly Finding[] = [
  {
    title: "Oversized images",
    tag: "Images",
    severity: 3,
    saving: "-1.9 MB",
    region: [0.06, 0.16, 0.88, 0.26],
  },
  {
    title: "Render-blocking JS",
    tag: "JS",
    severity: 3,
    saving: "-310 KB",
    region: [0.06, 0.5, 0.88, 0.3],
  },
  {
    title: "Unused CSS",
    tag: "CSS",
    severity: 2,
    saving: "-96 KB",
    region: [0.06, 0.84, 0.88, 0.12],
  },
  {
    title: "Missing alt text",
    tag: "A11y",
    severity: 1,
    saving: "+4 fixed",
    region: [0.04, 0.04, 0.34, 0.08],
  },
];
const DASH: number[] = [3, 3];
const NO_DASH: number[] = [];
const START_SCORE = 43;
const END_SCORE = 96;
const START_KB = 2400;
const END_KB = 480;
const SCAN_MS = 4200;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const weight = (kb: number): string =>
  kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${Math.round(kb)} KB`;

export const drawIllusAudit = (dc: DrawContext): void => {
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
  const text = area.h * 0.028;
  const small = area.h * 0.023;
  const page = box(0, 0, 0.46, 1);
  const drift = seg(progress, 0.9, 1);
  const sweep = easeOutCubic(seg(progress, 0, 0.9));
  const frac = (time % SCAN_MS) / SCAN_MS;
  const loop = 1 - Math.abs(1 - 2 * frac);
  const scan = sweep * (1 - drift) + loop * drift;

  fillRounded(ctx, page, 8, surface);
  const part = (u: number, v: number, w: number, h: number): Rect => ({
    x: page.x + u * page.w,
    y: page.y + v * page.h,
    w: w * page.w,
    h: h * page.h,
  });
  const logo = part(0.06, 0.05, 0.22, 0.04);
  pill(ctx, logo.x, logo.y + page.h * 0.01, logo.w, logo.h, strong);
  [0.5, 0.64, 0.78].forEach((u) => {
    const link = part(u, 0.065, 0.1, 0.03);
    pill(ctx, link.x, link.y, link.w, link.h, faint);
  });
  const heroBox = part(0.06, 0.16, 0.88, 0.26);
  fillRounded(ctx, heroBox, 5, faint);
  dot(ctx, heroBox.x + heroBox.w * 0.78, heroBox.y + heroBox.h * 0.3, heroBox.h * 0.1, soft);
  ctx.beginPath();
  ctx.moveTo(heroBox.x + heroBox.w * 0.08, heroBox.y + heroBox.h * 0.9);
  ctx.lineTo(heroBox.x + heroBox.w * 0.36, heroBox.y + heroBox.h * 0.4);
  ctx.lineTo(heroBox.x + heroBox.w * 0.55, heroBox.y + heroBox.h * 0.7);
  ctx.lineTo(heroBox.x + heroBox.w * 0.7, heroBox.y + heroBox.h * 0.55);
  ctx.lineTo(heroBox.x + heroBox.w * 0.92, heroBox.y + heroBox.h * 0.9);
  ctx.closePath();
  ctx.fillStyle = soft;
  ctx.fill();
  for (let index = 0; index < 5; index += 1) {
    const line = part(0.06, 0.5 + index * 0.065, 0.88 - (index % 3) * 0.18, 0.03);
    pill(ctx, line.x, line.y, line.w, line.h, soft);
  }
  fillRounded(ctx, part(0.06, 0.86, 0.4, 0.09), 4, faint);
  fillRounded(ctx, part(0.54, 0.86, 0.4, 0.09), 4, faint);

  const dones = FINDINGS.map((_, index) => seg(progress, 0.12 + index * 0.2, 0.28 + index * 0.2));
  FINDINGS.forEach((finding, index) => {
    const region = part(...finding.region);
    const done = dones[index];
    roundedRectPath(ctx, region, 4);
    ctx.lineWidth = 1.2;
    ctx.setLineDash(done > 0.5 ? NO_DASH : DASH);
    ctx.strokeStyle = tint(palette, done, 0.45 + 0.5 * done);
    ctx.stroke();
    ctx.setLineDash(NO_DASH);
    const tagW = finding.tag.length * small * 0.62 + 10;
    const tagH = small * 1.5;
    const tagX = region.x + region.w - tagW - 3;
    const tagY = region.y - tagH * 0.55;
    pill(ctx, tagX, tagY, tagW, tagH, surface);
    pill(ctx, tagX, tagY, tagW, tagH, tint(palette, done, 0.2 + 0.2 * done));
    drawLabel(
      ctx,
      finding.tag,
      tagX + tagW / 2,
      tagY + tagH / 2,
      small * 0.9,
      tint(palette, done),
      "center",
      true
    );
  });
  roundedRectPath(ctx, page, 8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = outline;
  ctx.stroke();

  ctx.save();
  roundedRectPath(ctx, page, 8);
  ctx.clip();
  const scanY = page.y + page.h * (0.04 + 0.92 * scan);
  ctx.fillStyle = rgba(palette.accent, 0.12 * progress);
  ctx.fillRect(page.x, scanY - page.h * 0.05, page.w, page.h * 0.05);
  ctx.fillStyle = tint(palette, progress, 0.4 + 0.6 * progress);
  ctx.fillRect(page.x, scanY - 1, page.w, 2);
  ctx.restore();

  const lensR = page.w * 0.15;
  const lensX =
    page.x +
    page.w * ((0.22 + 0.4 * sweep) * (1 - drift) + (0.4 + 0.2 * Math.sin(time / 1900)) * drift);
  const lensY = scanY + Math.sin(time / 700) * drift * page.h * 0.01;
  ctx.save();
  circlePath(ctx, lensX, lensY, lensR);
  ctx.clip();
  ctx.fillStyle = rgba(palette.accent, 0.14 * progress);
  ctx.fillRect(lensX - lensR, lensY - lensR, lensR * 2, lensR * 2);
  ctx.restore();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(3, lensR * 0.16);
  ctx.strokeStyle = tint(palette, progress, 0.5 + 0.5 * progress);
  ctx.beginPath();
  ctx.moveTo(lensX + lensR * 0.72, lensY + lensR * 0.72);
  ctx.lineTo(lensX + lensR * 1.5, lensY + lensR * 1.5);
  ctx.stroke();
  circlePath(ctx, lensX, lensY, lensR);
  ctx.lineWidth = Math.max(2, lensR * 0.1);
  ctx.strokeStyle = tint(palette, progress);
  ctx.stroke();
  circlePath(ctx, lensX, lensY, lensR * 0.8);
  ctx.lineWidth = 1;
  ctx.strokeStyle = tint(palette, progress, 0.35);
  ctx.stroke();

  const scoreEase = easeOutCubic(seg(progress, 0.05, 0.95));
  const score = Math.round(START_SCORE + (END_SCORE - START_SCORE) * scoreEase);
  const ringX = area.x + area.w * 0.62;
  const ringY = area.y + area.h * 0.15;
  const ringR = area.h * 0.1;
  ctx.lineCap = "round";
  ctx.lineWidth = ringR * 0.2;
  circlePath(ctx, ringX, ringY, ringR);
  ctx.strokeStyle = rgba(palette.line, 0.8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ringX, ringY, ringR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * score) / 100);
  ctx.strokeStyle = tint(palette, scoreEase);
  ctx.stroke();
  drawLabel(
    ctx,
    String(score),
    ringX,
    ringY - ringR * 0.08,
    ringR * 0.7,
    tint(palette, scoreEase, 0.7 + 0.3 * scoreEase),
    "center",
    true
  );
  drawLabel(
    ctx,
    "score",
    ringX,
    ringY + ringR * 0.52,
    small * 0.9,
    rgba(palette.strong, 0.6),
    "center"
  );

  const barX = area.x + area.w * 0.78;
  const barW = area.x + area.w - 2 - barX;
  const shrink = easeOutCubic(seg(progress, 0.15, 0.9));
  const kb = START_KB + (END_KB - START_KB) * shrink;
  const bars: ReadonlyArray<readonly [string, string, number, number]> = [
    ["before", weight(START_KB), 1, 0.3],
    ["after", weight(kb), kb / START_KB, 0.8],
  ];
  bars.forEach(([name, value, fill, strength], index) => {
    const top = area.y + area.h * (0.05 + index * 0.13);
    drawLabel(ctx, value, barX, top + text * 0.5, text, ink, "left", true);
    drawLabel(
      ctx,
      name,
      barX + barW,
      top + text * 0.5,
      small * 0.9,
      rgba(palette.strong, 0.6),
      "right"
    );
    const trackY = top + text * 1.3;
    pill(ctx, barX, trackY, barW, area.h * 0.025, faint);
    pill(
      ctx,
      barX,
      trackY,
      Math.max(area.h * 0.025, barW * fill),
      area.h * 0.025,
      index === 0 ? soft : tint(palette, shrink, strength)
    );
  });

  FINDINGS.forEach((finding, index) => {
    const done = dones[index];
    const row = box(0.49, 0.32 + index * 0.17, 0.5, 0.155);
    fillRounded(ctx, row, 6, surface);
    roundedRectPath(ctx, row, 6);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, done, 0.4 + 0.4 * done);
    ctx.stroke();
    const dotR = row.h * 0.17;
    const dotX = row.x + row.h * 0.32;
    const dotY = row.y + row.h / 2;
    dot(ctx, dotX, dotY, dotR, tint(palette, done, 0.3 + 0.7 * done));
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = surface;
    strokeTick(ctx, dotX, dotY, dotR, done);
    drawLabel(
      ctx,
      finding.title,
      row.x + row.h * 0.65,
      row.y + row.h * 0.34,
      text,
      ink,
      "left",
      true
    );
    const tagW = finding.tag.length * small * 0.62 + 10;
    const tagH = small * 1.5;
    const tagX = row.x + row.h * 0.65;
    const tagY = row.y + row.h * 0.55;
    pill(ctx, tagX, tagY, tagW, tagH, faint);
    drawLabel(ctx, finding.tag, tagX + tagW / 2, tagY + tagH / 2, small * 0.9, ink, "center");
    for (let level = 0; level < 3; level += 1) {
      dot(
        ctx,
        tagX + tagW + 8 + level * small * 0.9,
        tagY + tagH / 2,
        small * 0.3,
        level < finding.severity ? strong : faint
      );
    }
    ctx.globalAlpha = done;
    drawLabel(
      ctx,
      finding.saving,
      row.x + row.w - 8,
      row.y + row.h * 0.72,
      small,
      tint(palette, 1),
      "right",
      true
    );
    ctx.globalAlpha = 1;
  });
};

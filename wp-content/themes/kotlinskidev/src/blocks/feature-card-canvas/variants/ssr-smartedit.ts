import { clamp01, easeInOutCubic, easeOutBack, easeOutCubic } from "../easing";
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
  box: (u: number, v: number, w: number, h: number) => Rect;
  faint: string;
  soft: string;
  ink: string;
  muted: string;
  surface: string;
  outline: string;
  text: number;
  small: number;
}

interface Edit {
  ov: number;
  index: number;
  cycle: number;
  phase: number;
  env: number;
  pop: number;
}

interface WindowLayout {
  win: Rect;
  bar: Rect;
  nav: Rect;
  hero: Rect;
  carousel: Rect;
  grid: Rect;
}

const CHAR_WIDTH = 0.62;
const EDIT_MS = 2600;
const FLOW_MS = 3600;
const SWEEP_MS = 5200;
const DASH: number[] = [3, 3];
const NO_DASH: number[] = [];
const SECTIONS = ["Hero", "Carousel", "Grid"] as const;
const TOOLBAR = ["Edit", "Preview", "Publish"] as const;
const SHARED = ["Header", "ProductCard", "Footer"] as const;
const TEMPLATES = ["Home", "Category", "Product"] as const;

const seg = (value: number, from: number, to: number): number =>
  clamp01((value - from) / (to - from));

const fit = (chars: number, room: number, base: number): number =>
  Math.max(6, Math.min(base, room / (chars * CHAR_WIDTH)));

const createScene = (dc: DrawContext): Scene => {
  const area = fitFullArea(dc.width, dc.height);
  const inner = {
    x: area.x + area.w * 0.05,
    y: area.y + area.h * 0.05,
    w: area.w * 0.9,
    h: area.h * 0.93,
  };
  const { palette } = dc;
  return {
    dc,
    box: (u, v, w, h) => ({
      x: inner.x + u * inner.w,
      y: inner.y + v * inner.h,
      w: w * inner.w,
      h: h * inner.h,
    }),
    faint: rgba(palette.muted, 0.2),
    soft: rgba(palette.muted, 0.4),
    ink: rgba(palette.strong, 0.85),
    muted: rgba(palette.strong, 0.6),
    surface: rgba(palette.surface, 1),
    outline: rgba(palette.line, 0.9),
    text: Math.max(7, inner.h * 0.034),
    small: Math.max(6, inner.h * 0.028),
  };
};

const part = (rect: Rect, u: number, v: number, w: number, h: number): Rect => ({
  x: rect.x + u * rect.w,
  y: rect.y + v * rect.h,
  w: w * rect.w,
  h: h * rect.h,
});

const centre = (rect: Rect): { x: number; y: number } => ({
  x: rect.x + rect.w / 2,
  y: rect.y + rect.h / 2,
});

const outlineRect = (
  ctx: CanvasRenderingContext2D,
  rect: Rect,
  radius: number,
  style: string,
  width = 1
): void => {
  roundedRectPath(ctx, rect, radius);
  ctx.lineWidth = width;
  ctx.strokeStyle = style;
  ctx.stroke();
};

const windowLayout = (scene: Scene): WindowLayout => {
  const win = scene.box(0, 0, 0.5, 0.54);
  const bar = { x: win.x, y: win.y, w: win.w, h: win.h * 0.1 };
  const body = {
    x: win.x + win.w * 0.04,
    y: win.y + bar.h + win.h * 0.03,
    w: win.w * 0.92,
    h: win.h * 0.84,
  };
  return {
    win,
    bar,
    nav: part(body, 0, 0, 1, 0.1),
    hero: part(body, 0, 0.13, 1, 0.33),
    carousel: part(body, 0, 0.5, 1, 0.15),
    grid: part(body, 0, 0.69, 1, 0.31),
  };
};

const computeEdit = (dc: DrawContext): Edit => {
  const { progress, time } = dc;
  const cyc = progress >= 1 ? time / EDIT_MS : seg(progress, 0.6, 1) * 0.95;
  const cycle = Math.floor(cyc);
  const phase = cyc - cycle;
  return {
    ov: easeOutCubic(seg(progress, 0.55, 0.7)),
    index: cycle % SECTIONS.length,
    cycle,
    phase,
    env: easeOutCubic(seg(phase, 0.35, 0.55)) * (1 - seg(phase, 0.9, 1)),
    pop: easeOutBack(seg(phase, 0.62, 0.78)) * (1 - seg(phase, 0.92, 1)),
  };
};

const toolbarState = (index: number, edit: Edit): number => {
  if (index === 0) {
    return edit.ov;
  }
  return index === 2 ? Math.min(1, edit.pop) : 0;
};

const PACKET_WINDOWS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [
    [0, 0.2],
    [0.62, 0.82],
  ],
  [
    [0.2, 0.4],
    [0.4, 0.6],
  ],
];

const streamValue = (dc: DrawContext): number => seg(dc.progress, 0, 0.65);

const drawPage = (scene: Scene, layout: WindowLayout, edit: Edit): void => {
  const { dc, faint, soft, surface, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const { win, bar, nav, hero, carousel, grid } = layout;
  fillRounded(ctx, win, 8, surface);
  outlineRect(ctx, win, 8, tint(palette, progress, 0.4 + 0.45 * progress));
  [0, 1, 2].forEach((i) =>
    dot(
      ctx,
      win.x + bar.h * (0.7 + i * 0.7),
      bar.y + bar.h / 2,
      bar.h * 0.16,
      i === 0 ? tint(palette, progress, 0.6) : soft
    )
  );
  const urlX = win.x + bar.h * 3;
  pill(ctx, urlX, bar.y + bar.h * 0.2, win.w - bar.h * 3.6, bar.h * 0.6, faint);
  drawLabel(
    ctx,
    "shop.example",
    urlX + 6,
    bar.y + bar.h / 2,
    fit(12, win.w - bar.h * 4.5, small),
    muted,
    "left"
  );
  ctx.fillStyle = faint;
  ctx.fillRect(win.x + 1, bar.y + bar.h, win.w - 2, 1);
  const s = streamValue(dc);
  const reveal = (top: number): number => easeOutCubic(seg(s, top * 0.85, top * 0.85 + 0.2));
  const layer = (rect: Rect, top: number, radius: number, draw: (t: number) => void): void => {
    fillRounded(ctx, rect, radius, faint);
    const t = reveal(top);
    ctx.globalAlpha = t;
    draw(t);
    ctx.globalAlpha = 1;
  };
  layer(nav, 0, 3, (t) => {
    fillRounded(ctx, part(nav, 0.02, 0.2, 0.06, 0.6), 2, tint(palette, t, 0.75));
    pill(ctx, nav.x + nav.w * 0.1, nav.y + nav.h * 0.35, nav.w * 0.16, nav.h * 0.3, soft);
    [0.4, 0.52, 0.64].forEach((u) =>
      pill(ctx, nav.x + nav.w * u, nav.y + nav.h * 0.38, nav.w * 0.09, nav.h * 0.24, soft)
    );
    const cart = { x: nav.x + nav.w * 0.92, y: nav.y + nav.h / 2 };
    dot(ctx, cart.x, cart.y + nav.h * 0.12, nav.h * 0.2, soft);
    dot(ctx, cart.x + nav.h * 0.22, cart.y - nav.h * 0.18, nav.h * 0.12, tint(palette, t, 0.8));
  });
  const shrink = edit.index === 0 ? 0.17 * edit.env : 0;
  layer(hero, 0.13, 4, (t) => {
    fillRounded(ctx, part(hero, 0.04, 0.06, 0.92, 0.88), 3, tint(palette, t, 0.14));
    pill(
      ctx,
      hero.x + hero.w * 0.09,
      hero.y + hero.h * 0.24,
      hero.w * (0.5 - shrink),
      hero.h * 0.13,
      rgba(palette.strong, 0.5)
    );
    pill(ctx, hero.x + hero.w * 0.09, hero.y + hero.h * 0.46, hero.w * 0.34, hero.h * 0.09, soft);
    pill(
      ctx,
      hero.x + hero.w * 0.09,
      hero.y + hero.h * 0.68,
      hero.w * 0.2,
      hero.h * 0.14,
      tint(palette, t, 0.65)
    );
    circlePath(ctx, hero.x + hero.w * 0.78, hero.y + hero.h * 0.5, hero.h * 0.26);
    ctx.fillStyle = tint(palette, t, 0.2);
    ctx.fill();
    if (edit.index === 0 && edit.env > 0 && edit.env < 1 && Math.sin(time / 160) > 0) {
      ctx.fillStyle = tint(palette, progress);
      ctx.fillRect(
        hero.x + hero.w * (0.09 + 0.5 - shrink) + 2,
        hero.y + hero.h * 0.24,
        1.5,
        hero.h * 0.13
      );
    }
  });
  layer(carousel, 0.5, 3, (t) => {
    for (let i = 0; i < 4; i += 1) {
      const slide = part(carousel, 0.03 + i * 0.235, 0.12, 0.21, 0.5);
      fillRounded(ctx, slide, 2, tint(palette, t, 0.1 + 0.08 * ((i + 1) % 2)));
    }
    const lit = edit.index === 1 && edit.env > 0.5 ? 2 : 0;
    [0, 1, 2, 3].forEach((i) =>
      dot(
        ctx,
        carousel.x + carousel.w * (0.4 + i * 0.07),
        carousel.y + carousel.h * 0.85,
        carousel.h * 0.06,
        i === lit ? tint(palette, t) : soft
      )
    );
  });
  layer(grid, 0.69, 3, (t) => {
    for (let i = 0; i < 3; i += 1) {
      const card = part(grid, i * 0.345, 0, 0.31, 1);
      fillRounded(ctx, card, 3, faint);
      fillRounded(ctx, part(card, 0.06, 0.06, 0.88, 0.5), 2, tint(palette, t, 0.14 + 0.06 * i));
      pill(ctx, card.x + card.w * 0.08, card.y + card.h * 0.64, card.w * 0.55, card.h * 0.08, soft);
      const price = i === 1 && edit.index === 2 && edit.env > 0.5 ? "AED 89" : "AED 99";
      drawLabel(
        ctx,
        price,
        card.x + card.w * 0.08,
        card.y + card.h * 0.86,
        fit(6, card.w * 0.84, small),
        tint(palette, t, 0.9),
        "left",
        true
      );
    }
  });
  if (s > 0 && s < 1) {
    const body = part(hero, 0, 0, 1, 1);
    const y = nav.y + (grid.y + grid.h - nav.y) * s;
    ctx.fillStyle = rgba(palette.accent, 0.12);
    ctx.fillRect(win.x + 2, y - body.h * 0.12, win.w - 4, body.h * 0.12);
    ctx.fillStyle = tint(palette, progress);
    ctx.fillRect(win.x + 2, y - 1, win.w - 4, 2);
  } else if (progress >= 1) {
    const sweep = (time % SWEEP_MS) / SWEEP_MS;
    ctx.fillStyle = rgba(palette.accent, 0.06 * Math.sin(sweep * Math.PI));
    ctx.fillRect(win.x + 2, nav.y + (grid.y + grid.h - nav.y) * sweep - 3, win.w - 4, 6);
  }
};

const drawOverlay = (scene: Scene, layout: WindowLayout, edit: Edit): void => {
  const { dc, small } = scene;
  const { ctx, palette } = dc;
  if (edit.ov <= 0) {
    return;
  }
  const rects = [layout.hero, layout.carousel, layout.grid];
  ctx.globalAlpha = edit.ov;
  rects.forEach((rect, index) => {
    const active = index === edit.index;
    const frame = { x: rect.x - 2, y: rect.y - 2, w: rect.w + 4, h: rect.h + 4 };
    ctx.setLineDash(active ? NO_DASH : DASH);
    outlineRect(
      ctx,
      frame,
      4,
      tint(palette, active ? 1 : 0, active ? 0.9 : 0.55),
      active ? 1.4 : 1
    );
    ctx.setLineDash(NO_DASH);
    const hx = frame.x + frame.w - small * 0.9;
    const hy = frame.y + small * 0.2;
    dot(ctx, hx, hy, small * 0.75, rgba(palette.surface, 1));
    circlePath(ctx, hx, hy, small * 0.75);
    ctx.lineWidth = 1;
    ctx.strokeStyle = tint(palette, active ? 1 : 0, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(hx - small * 0.3, hy + small * 0.3);
    ctx.lineTo(hx + small * 0.3, hy - small * 0.3);
    ctx.lineWidth = 1.4;
    ctx.lineCap = "round";
    ctx.stroke();
    if (active) {
      const label = `${SECTIONS[index]} slot`;
      const w = label.length * small * 0.85 * CHAR_WIDTH + 10;
      const tag = { x: frame.x + 4, y: frame.y - small * 0.9, w, h: small * 1.7 };
      fillRounded(ctx, tag, tag.h / 2, rgba(palette.surface, 1));
      fillRounded(ctx, tag, tag.h / 2, tint(palette, 1, 0.2));
      outlineRect(ctx, tag, tag.h / 2, tint(palette, 1, 0.9));
      drawLabel(
        ctx,
        label,
        tag.x + w / 2,
        tag.y + tag.h / 2,
        small * 0.85,
        rgba(palette.strong, 0.85),
        "center",
        true
      );
    }
  });
  ctx.globalAlpha = 1;
};

const panelLayout = (scene: Scene): { panel: Rect; chips: Rect[]; rows: Rect[]; foot: Rect } => {
  const panel = scene.box(0.54, 0, 0.46, 0.54);
  const total = TOOLBAR.reduce((sum, name) => sum + name.length, 0);
  const font = fit(total, panel.w - 12 - TOOLBAR.length * 12, scene.small);
  let cursor = panel.x + 8;
  const chips = TOOLBAR.map((name) => {
    const w = name.length * font * CHAR_WIDTH + 10;
    const rect = { x: cursor, y: panel.y + panel.h * 0.17, w, h: panel.h * 0.14 };
    cursor += w + 4;
    return rect;
  });
  const rows = SECTIONS.map((_, i) => part(panel, 0.04, 0.35 + i * 0.14, 0.92, 0.125));
  return { panel, chips, rows, foot: part(panel, 0.04, 0.8, 0.92, 0.16) };
};

const drawBot = (scene: Scene, x: number, y: number, r: number, t: number): void => {
  const { dc, soft, surface } = scene;
  const { ctx, palette } = dc;
  const head = { x: x - r, y: y - r * 0.7, w: r * 2, h: r * 1.5 };
  fillRounded(ctx, head, r * 0.4, surface);
  outlineRect(ctx, head, r * 0.4, tint(palette, t, 0.5 + 0.5 * t), 1.2);
  dot(ctx, x - r * 0.42, y, r * 0.2, tint(palette, t));
  dot(ctx, x + r * 0.42, y, r * 0.2, tint(palette, t));
  ctx.beginPath();
  ctx.moveTo(x, head.y);
  ctx.lineTo(x, head.y - r * 0.45);
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = soft;
  ctx.stroke();
  dot(ctx, x, head.y - r * 0.55, r * 0.15, tint(palette, t));
};

const drawPanel = (scene: Scene, edit: Edit): void => {
  const { dc, surface, faint, soft, ink, muted, small, text } = scene;
  const { ctx, progress, palette } = dc;
  const { panel, chips, rows, foot } = panelLayout(scene);
  fillRounded(ctx, panel, 8, surface);
  outlineRect(ctx, panel, 8, tint(palette, edit.ov, 0.35 + 0.5 * edit.ov));
  ctx.beginPath();
  ctx.moveTo(panel.x + 10, panel.y + panel.h * 0.12);
  ctx.lineTo(panel.x + 10 + text * 0.8, panel.y + panel.h * 0.12 - text * 0.8);
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.strokeStyle = tint(palette, edit.ov, 0.6 + 0.4 * edit.ov);
  ctx.stroke();
  drawLabel(
    ctx,
    "SmartEdit",
    panel.x + 10 + text * 1.4,
    panel.y + panel.h * 0.085,
    fit(9, panel.w * 0.7, text),
    ink,
    "left",
    true
  );
  const press = edit.pop > 0 ? 1 - Math.min(1, Math.abs(edit.pop - 0.5)) * 0.1 : 1;
  chips.forEach((chip, index) => {
    const on = toolbarState(index, edit);
    const rect =
      index === 2
        ? { x: chip.x + (chip.w * (1 - press)) / 2, y: chip.y, w: chip.w * press, h: chip.h }
        : chip;
    fillRounded(ctx, rect, rect.h / 2, tint(palette, on, 0.1 + 0.2 * on));
    outlineRect(ctx, rect, rect.h / 2, tint(palette, on, 0.3 + 0.6 * on));
    drawLabel(
      ctx,
      TOOLBAR[index],
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
      fit(TOOLBAR[index].length, rect.w - 8, small),
      on > 0.5 ? ink : muted,
      "center",
      on > 0.5
    );
  });
  rows.forEach((row, index) => {
    const active = index === edit.index && edit.ov > 0;
    const t = active ? edit.ov : 0;
    fillRounded(ctx, row, 4, active ? tint(palette, t, 0.08 + 0.1 * t) : faint);
    dot(
      ctx,
      row.x + row.h * 0.55,
      row.y + row.h / 2,
      row.h * 0.17,
      active ? tint(palette, t) : soft
    );
    drawLabel(
      ctx,
      SECTIONS[index],
      row.x + row.h * 1.0,
      row.y + row.h / 2,
      fit(8, row.w * 0.4, small),
      active ? ink : muted,
      "left",
      active
    );
    if (active) {
      const tagW = 4 * small * 0.85 * CHAR_WIDTH + 10;
      pill(
        ctx,
        row.x + row.w - tagW - row.h * 0.4,
        row.y + row.h * 0.2,
        tagW,
        row.h * 0.6,
        tint(palette, t, 0.25)
      );
      drawLabel(
        ctx,
        "slot",
        row.x + row.w - tagW / 2 - row.h * 0.4,
        row.y + row.h / 2,
        small * 0.85,
        ink,
        "center",
        true
      );
    }
  });
  const crawl = easeOutCubic(seg(progress, 0.7, 1));
  drawBot(scene, foot.x + foot.h * 0.5, foot.y + foot.h * 0.55, foot.h * 0.33, crawl);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = tint(palette, crawl);
  strokeTick(ctx, foot.x + foot.h * 1.55, foot.y + foot.h * 0.5, foot.h * 0.3, crawl);
  drawLabel(
    ctx,
    "full HTML",
    foot.x + foot.h * 2.0,
    foot.y + foot.h * 0.5,
    fit(9, foot.w * 0.38, small),
    muted,
    "left"
  );
  const label = "Published";
  const font = fit(label.length + 2, foot.w * 0.4, small);
  const w = (label.length + 2) * font * CHAR_WIDTH + 8;
  const chip = { x: foot.x + foot.w - w, y: foot.y + foot.h * 0.12, w, h: foot.h * 0.76 };
  const pop = Math.max(0, edit.pop);
  ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, pop);
  fillRounded(ctx, chip, chip.h / 2, tint(palette, pop, 0.15 + 0.2 * pop));
  outlineRect(ctx, chip, chip.h / 2, tint(palette, pop, 0.4 + 0.5 * pop));
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = tint(palette, pop);
  strokeTick(
    ctx,
    chip.x + chip.h * 0.55,
    chip.y + chip.h / 2,
    chip.h * 0.3 * Math.max(0.01, pop),
    pop
  );
  drawLabel(
    ctx,
    label,
    chip.x + chip.h * 0.95 + (chip.w - chip.h * 0.95) / 2,
    chip.y + chip.h / 2,
    font,
    ink,
    "center",
    true
  );
  ctx.globalAlpha = 1;
};

const drawLane = (scene: Scene): void => {
  const { dc, surface, faint, ink, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const lane = scene.box(0, 0.6, 1, 0.19);
  const phase = progress >= 1 ? (time % FLOW_MS) / FLOW_MS : progress;
  const nodeY = lane.y + lane.h * 0.36;
  const nodeH = lane.h * 0.64;
  const browser = { x: lane.x, y: nodeY, w: lane.w * 0.2, h: nodeH };
  const server = { x: lane.x + lane.w * 0.38, y: nodeY, w: lane.w * 0.24, h: nodeH };
  const api = { x: lane.x + lane.w * 0.8, y: nodeY, w: lane.w * 0.2, h: nodeH };
  const reveal = easeOutCubic(seg(progress, 0.1, 0.5));
  const hydrate = progress >= 1 ? easeOutCubic(seg(phase, 0.7, 0.92)) : seg(progress, 0.65, 0.95);
  const node = (rect: Rect, on: number): void => {
    fillRounded(ctx, rect, 5, surface);
    outlineRect(ctx, rect, 5, tint(palette, on, 0.35 + 0.6 * on));
  };
  node(browser, reveal);
  node(server, reveal);
  drawLabel(
    ctx,
    "Browser",
    browser.x + browser.w / 2,
    browser.y + browser.h * 0.3,
    fit(7, browser.w - 12, small),
    ink,
    "center",
    true
  );
  pill(
    ctx,
    browser.x + browser.w * 0.1,
    browser.y + browser.h * 0.62,
    browser.w * 0.8,
    browser.h * 0.16,
    faint
  );
  pill(
    ctx,
    browser.x + browser.w * 0.1,
    browser.y + browser.h * 0.62,
    Math.max(browser.h * 0.16, browser.w * 0.8 * hydrate),
    browser.h * 0.16,
    tint(palette, hydrate, 0.4 + 0.6 * hydrate)
  );
  drawLabel(
    ctx,
    "Next.js",
    server.x + server.w / 2,
    server.y + server.h * 0.3,
    fit(7, server.w - 12, small),
    ink,
    "center",
    true
  );
  const tagW = server.w * 0.4;
  pill(
    ctx,
    server.x + (server.w - tagW) / 2,
    server.y + server.h * 0.52,
    tagW,
    server.h * 0.34,
    tint(palette, reveal, 0.2 + 0.2 * reveal)
  );
  drawLabel(
    ctx,
    "SSR",
    server.x + server.w / 2,
    server.y + server.h * 0.69,
    fit(3, tagW - 4, small),
    ink,
    "center",
    true
  );
  const services = ["Commerce API", "CMS"] as const;
  services.forEach((name, i) => {
    const rect = { x: api.x, y: api.y + i * api.h * 0.54, w: api.w, h: api.h * 0.46 };
    node(rect, reveal);
    drawLabel(
      ctx,
      name,
      rect.x + rect.w / 2,
      rect.y + rect.h / 2,
      fit(name.length, rect.w - 12, small),
      ink,
      "center",
      i === 0
    );
  });
  const gaps: ReadonlyArray<readonly [number, number]> = [
    [browser.x + browser.w, server.x],
    [server.x + server.w, api.x],
  ];
  const lanes = [nodeY + nodeH * 0.3, nodeY + nodeH * 0.7];
  gaps.forEach(([from, to], index) => {
    lanes.forEach((y, row) => {
      ctx.setLineDash(DASH);
      ctx.beginPath();
      ctx.moveTo(from + 3, y);
      ctx.lineTo(to - 3, y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = tint(palette, reveal, 0.3 + 0.5 * reveal);
      ctx.stroke();
      ctx.setLineDash(NO_DASH);
      const [start, end] = PACKET_WINDOWS[index][row];
      const f = seg(phase, start, end);
      if (f > 0 && f < 1) {
        const span = to - from - 12;
        const x = row === 0 ? from + 6 + span * f : to - 6 - span * f;
        const long = row === 1 && index === 0 ? small * 1.2 : small * 0.4;
        pill(
          ctx,
          x - long / 2,
          y - small * 0.22,
          long,
          small * 0.44,
          rgba(palette.accentGlow, 0.9 * Math.min(1, progress * 4))
        );
      }
    });
  });
  const chips: ReadonlyArray<readonly [string, number, number]> = [
    ["TTFB 120ms", gaps[0][0], gaps[0][1] - gaps[0][0]],
    ["HTML 38 KB", gaps[1][0], gaps[1][1] - gaps[1][0]],
    [`hydrate ${Math.round(hydrate * 100)}%`, browser.x, browser.w],
  ];
  chips.forEach(([label, x, w]) => {
    const font = fit(label.length, w - 8, small);
    const chipH = font * 1.7;
    const cx = x + w / 2;
    const cw = Math.min(w, label.length * font * CHAR_WIDTH + 8);
    pill(
      ctx,
      cx - cw / 2,
      lane.y + (lane.h * 0.3 - chipH) / 2,
      cw,
      chipH,
      tint(palette, reveal, 0.12 + 0.12 * reveal)
    );
    drawLabel(ctx, label, cx, lane.y + lane.h * 0.15, font, ink, "center");
  });
};

const drawThumb = (scene: Scene, rect: Rect, kind: number, pulse: number): void => {
  const { dc, surface, faint, soft } = scene;
  const { ctx, palette } = dc;
  fillRounded(ctx, rect, 3, surface);
  outlineRect(ctx, rect, 3, tint(palette, pulse, 0.35 + 0.55 * pulse));
  const head = part(rect, 0.08, 0.1, 0.84, 0.16);
  fillRounded(ctx, head, 1.5, tint(palette, pulse, 0.25 + 0.4 * pulse));
  const foot = part(rect, 0.08, 0.84, 0.84, 0.1);
  fillRounded(ctx, foot, 1.5, tint(palette, pulse, 0.25 + 0.4 * pulse));
  if (kind === 0) {
    fillRounded(ctx, part(rect, 0.08, 0.32, 0.84, 0.28), 2, faint);
    [0, 1, 2].forEach((i) =>
      fillRounded(ctx, part(rect, 0.08 + i * 0.29, 0.64, 0.26, 0.16), 1.5, soft)
    );
  } else if (kind === 1) {
    [0, 1].forEach((r) =>
      [0, 1, 2].forEach((i) =>
        fillRounded(
          ctx,
          part(rect, 0.08 + i * 0.29, 0.32 + r * 0.26, 0.26, 0.22),
          1.5,
          r === 0 ? tint(palette, pulse, 0.3 + 0.3 * pulse) : soft
        )
      )
    );
  } else {
    fillRounded(ctx, part(rect, 0.08, 0.32, 0.4, 0.48), 2, faint);
    pill(ctx, rect.x + rect.w * 0.54, rect.y + rect.h * 0.34, rect.w * 0.38, rect.h * 0.08, soft);
    pill(ctx, rect.x + rect.w * 0.54, rect.y + rect.h * 0.5, rect.w * 0.3, rect.h * 0.08, faint);
    pill(
      ctx,
      rect.x + rect.w * 0.54,
      rect.y + rect.h * 0.68,
      rect.w * 0.34,
      rect.h * 0.12,
      tint(palette, pulse, 0.5 + 0.4 * pulse)
    );
  }
};

const drawReuse = (scene: Scene): void => {
  const { dc, ink, muted, small } = scene;
  const { ctx, progress, time, palette } = dc;
  const strip = scene.box(0, 0.83, 1, 0.17);
  const chipH = strip.h / 3.4;
  const total = SHARED.reduce((sum, name) => sum + name.length, 0);
  const font = fit(total / 3 + 1, strip.w * 0.36 - 10, small);
  SHARED.forEach((name, index) => {
    const t = easeOutCubic(seg(progress, 0.3 + index * 0.1, 0.6 + index * 0.1));
    const w = Math.min(strip.w * 0.36, (name.length + 1) * font * CHAR_WIDTH + 10);
    const y = strip.y + index * (chipH + strip.h * 0.04);
    ctx.globalAlpha = 0.4 + 0.6 * t;
    pill(ctx, strip.x, y, w, chipH, tint(palette, t, 0.12 + 0.14 * t));
    outlineRect(ctx, { x: strip.x, y, w, h: chipH }, chipH / 2, tint(palette, t, 0.3 + 0.6 * t));
    drawLabel(ctx, name, strip.x + w / 2, y + chipH / 2, font, ink, "center");
    ctx.globalAlpha = 1;
  });
  const arrow = easeOutCubic(seg(progress, 0.5, 0.85));
  const ay = strip.y + strip.h * 0.45;
  const ax0 = strip.x + strip.w * 0.4;
  const ax1 = strip.x + strip.w * 0.5;
  ctx.beginPath();
  ctx.moveTo(ax0, ay);
  ctx.lineTo(ax0 + (ax1 - ax0) * arrow, ay);
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.strokeStyle = tint(palette, arrow);
  ctx.stroke();
  if (arrow > 0.9) {
    ctx.beginPath();
    ctx.moveTo(ax1 - small * 0.7, ay - small * 0.6);
    ctx.lineTo(ax1, ay);
    ctx.lineTo(ax1 - small * 0.7, ay + small * 0.6);
    ctx.stroke();
  }
  const cycle = progress >= 1 ? time / 1500 : 0;
  TEMPLATES.forEach((name, index) => {
    const t = easeOutCubic(seg(progress, 0.55 + index * 0.1, 0.85 + index * 0.1));
    const pulse =
      progress >= 1 ? Math.max(0, Math.sin((cycle - index * 0.6) * Math.PI)) ** 2 : t * 0.5;
    const thumb = {
      x: strip.x + strip.w * (0.52 + index * 0.17),
      y: strip.y,
      w: strip.w * 0.15,
      h: strip.h * 0.7,
    };
    ctx.globalAlpha = 0.4 + 0.6 * t;
    drawThumb(scene, thumb, index, pulse * t);
    drawLabel(
      ctx,
      name,
      thumb.x + thumb.w / 2,
      strip.y + strip.h * 0.88,
      fit(8, strip.w * 0.16, small),
      t > 0.5 ? ink : muted,
      "center"
    );
    ctx.globalAlpha = 1;
  });
};

const drawCursor = (scene: Scene, layout: WindowLayout, edit: Edit): void => {
  const { dc, surface, text } = scene;
  const { ctx, time, palette } = dc;
  if (edit.ov <= 0) {
    return;
  }
  const { chips } = panelLayout(scene);
  const targets = [
    centre(part(layout.hero, 0.3, 0.45, 0.4, 0.3)),
    centre(part(layout.carousel, 0.2, 0.3, 0.6, 0.5)),
    centre(part(layout.grid, 0.35, 0.3, 0.3, 0.5)),
  ];
  const from =
    edit.cycle === 0
      ? centre(chips[0])
      : targets[(edit.index + targets.length - 1) % targets.length];
  const move = easeInOutCubic(seg(edit.phase, 0, 0.35));
  const target = targets[edit.index];
  const x = from.x + (target.x - from.x) * move;
  const y = from.y + (target.y - from.y) * move + Math.sin(time / 420) * 1.5 * edit.ov;
  const s = text * 1.3;
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = edit.ov;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(s * 0.28, s * 0.74);
  ctx.lineTo(s * 0.5, s * 1.15);
  ctx.lineTo(s * 0.66, s * 1.07);
  ctx.lineTo(s * 0.45, s * 0.68);
  ctx.lineTo(s * 0.8, s * 0.66);
  ctx.closePath();
  ctx.fillStyle = surface;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.lineJoin = "round";
  ctx.strokeStyle = tint(palette, edit.ov);
  ctx.stroke();
  ctx.restore();
};

export const drawSsrSmartedit = (dc: DrawContext): void => {
  dc.ctx.clearRect(0, 0, dc.width, dc.height);
  const scene = createScene(dc);
  const layout = windowLayout(scene);
  const edit = computeEdit(dc);
  drawPage(scene, layout, edit);
  drawOverlay(scene, layout, edit);
  drawPanel(scene, edit);
  drawLane(scene);
  drawReuse(scene);
  drawCursor(scene, layout, edit);
};

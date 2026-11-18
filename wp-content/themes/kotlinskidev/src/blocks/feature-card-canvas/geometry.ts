import type { Point, Rect } from "./types";

export const mountainHeight = (x: number, width: number, height: number, seed: number): number => {
  if (width <= 0 || height <= 0) {
    return 0;
  }
  const u = (x / width) * Math.PI * 2;
  const sum =
    Math.sin(u * 1.3 + seed) +
    Math.sin(u * 2.9 + seed * 1.7) * 0.5 +
    Math.sin(u * 5.3 + seed * 2.3) * 0.25;
  const normalised = (sum / 1.75) * 0.5 + 0.5;
  return Math.min(height, Math.max(0, height * (0.15 + normalised * 0.6)));
};

export const perimeterPoint = (rect: Rect, t: number): Point => {
  const wrapped = ((t % 1) + 1) % 1;
  const perimeter = 2 * (rect.w + rect.h);
  const distance = wrapped * perimeter;
  if (distance < rect.w) {
    return { x: rect.x + distance, y: rect.y };
  }
  if (distance < rect.w + rect.h) {
    return { x: rect.x + rect.w, y: rect.y + (distance - rect.w) };
  }
  if (distance < 2 * rect.w + rect.h) {
    return { x: rect.x + rect.w - (distance - rect.w - rect.h), y: rect.y + rect.h };
  }
  return { x: rect.x, y: rect.y + rect.h - (distance - 2 * rect.w - rect.h) };
};

export interface TreeLayout {
  nodes: Point[];
  edges: ReadonlyArray<readonly [number, number]>;
  activePath: readonly number[];
}

export const treeLayout = (width: number, height: number): TreeLayout => {
  const rows = [height * 0.14, height * 0.5, height * 0.86];
  const nodes: Point[] = [
    { x: width * 0.5, y: rows[0] },
    { x: width * 0.31, y: rows[1] },
    { x: width * 0.69, y: rows[1] },
    { x: width * 0.12, y: rows[2] },
    { x: width * 0.37, y: rows[2] },
    { x: width * 0.63, y: rows[2] },
    { x: width * 0.88, y: rows[2] },
  ];
  return {
    nodes,
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [2, 6],
    ],
    activePath: [0, 2, 5],
  };
};

export interface ChartGeometry {
  bars: Rect[];
  line: Point[];
  baseline: number;
  left: number;
  top: number;
  right: number;
}

const CHART_VALUES = [0.25, 0.4, 0.35, 0.6, 0.75, 0.95];

export const chartPoints = (width: number, height: number, progress: number): ChartGeometry => {
  const clamped = Math.min(1, Math.max(0, progress));
  const left = width * 0.08;
  const right = width * 0.92;
  const top = height * 0.1;
  const baseline = height * 0.9;
  const span = right - left;
  const slot = span / CHART_VALUES.length;
  const plotHeight = baseline - top;
  const grow = 0.35 + 0.65 * clamped;

  const bars = CHART_VALUES.map((value, index) => {
    const h = plotHeight * value * 0.8 * grow;
    return { x: left + slot * index + slot * 0.2, y: baseline - h, w: slot * 0.6, h };
  });

  const full = CHART_VALUES.map((value, index) => ({
    x: left + slot * index + slot * 0.5,
    y: baseline - plotHeight * value,
  }));
  const segments = full.length - 1;
  const reach = clamped * segments;
  const whole = Math.floor(reach);
  const line = full.slice(0, whole + 1);
  if (whole < segments && reach > whole) {
    const from = full[whole];
    const to = full[whole + 1];
    const f = reach - whole;
    line.push({ x: from.x + (to.x - from.x) * f, y: from.y + (to.y - from.y) * f });
  }

  return { bars, line, baseline, left, top, right };
};

const STACK_SCALES = [0.62, 0.5, 0.38] as const;
const STACK_MARGIN = 0.05;

export const stackRects = (width: number, height: number, progress: number): Rect[] => {
  const clamped = Math.min(1, Math.max(0, progress));
  const sizes = STACK_SCALES.map((scale) => ({ w: width * scale, h: height * scale }));
  const back = sizes[0];
  const front = sizes[sizes.length - 1];
  const backTopLeft: Point = {
    x: width * (1 - STACK_MARGIN) - back.w,
    y: height * STACK_MARGIN,
  };
  const frontTopLeft: Point = {
    x: width * STACK_MARGIN,
    y: height * (1 - STACK_MARGIN) - front.h,
  };
  const spread = 0.85 + 0.15 * clamped;
  const centre: Point = { x: width / 2, y: height / 2 };
  const last = sizes.length - 1;
  return sizes.map((size, index) => {
    const t = index / last;
    const x = backTopLeft.x + (frontTopLeft.x - backTopLeft.x) * t;
    const y = backTopLeft.y + (frontTopLeft.y - backTopLeft.y) * t;
    const cx = x + size.w / 2;
    const cy = y + size.h / 2;
    const dx = (cx - centre.x) * spread;
    const dy = (cy - centre.y) * spread;
    return { x: centre.x + dx - size.w / 2, y: centre.y + dy - size.h / 2, w: size.w, h: size.h };
  });
};

const FILL = 0.85;

export const fitArea = (width: number, height: number): Rect => ({
  x: (width * (1 - FILL)) / 2,
  y: (height * (1 - FILL)) / 2,
  w: width * FILL,
  h: height * FILL,
});

export const fitFullArea = (width: number, height: number): Rect => ({
  x: 1,
  y: 1,
  w: width - 2,
  h: height - 2,
});

export const quadPoint = (from: Point, control: Point, to: Point, t: number): Point => {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
  };
};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

export interface StorefrontLayout {
  area: Rect;
  tiles: Rect[];
  cart: Point;
  cartSize: number;
}

export const STOREFRONT_COLUMNS = 3;
export const STOREFRONT_ROWS = 2;

export const storefrontLayout = (width: number, height: number): StorefrontLayout => {
  const area = fitArea(width, height);
  const headerHeight = area.h * 0.14;
  const gapY = area.h * 0.04;
  const gapX = area.w * 0.03;
  const tileW = (area.w - gapX * (STOREFRONT_COLUMNS - 1)) / STOREFRONT_COLUMNS;
  const tileH = (area.h - headerHeight - gapY * STOREFRONT_ROWS) / STOREFRONT_ROWS;
  const tiles: Rect[] = [];
  for (let row = 0; row < STOREFRONT_ROWS; row += 1) {
    for (let col = 0; col < STOREFRONT_COLUMNS; col += 1) {
      tiles.push({
        x: area.x + col * (tileW + gapX),
        y: area.y + headerHeight + gapY + row * (tileH + gapY),
        w: tileW,
        h: tileH,
      });
    }
  }
  const cartSize = headerHeight * 0.8;
  return {
    area,
    tiles,
    cart: { x: area.x + area.w - cartSize * 0.7, y: area.y + headerHeight / 2 },
    cartSize,
  };
};

export interface BuilderLayout {
  frame: Rect;
  blocks: Rect[];
}

export const BUILDER_BLOCK_COUNT = 6;

export const builderLayout = (width: number, height: number): BuilderLayout => {
  const frame = fitArea(width, height);
  const page: Rect = {
    x: frame.x + frame.w * 0.04,
    y: frame.y + frame.h * 0.06,
    w: frame.w * 0.92,
    h: frame.h * 0.88,
  };
  const gap = page.h * 0.04;
  const headerH = page.h * 0.12;
  const heroH = page.h * 0.34;
  const footerH = page.h * 0.1;
  const cardsH = page.h - headerH - heroH - footerH - gap * 4;
  const cardGap = page.w * 0.03;
  const cardW = (page.w - cardGap * 2) / 3;
  const heroY = page.y + headerH + gap;
  const cardsY = heroY + heroH + gap;
  const blocks: Rect[] = [
    { x: page.x, y: page.y, w: page.w, h: headerH },
    { x: page.x, y: heroY, w: page.w, h: heroH },
    { x: page.x, y: cardsY, w: cardW, h: cardsH },
    { x: page.x + cardW + cardGap, y: cardsY, w: cardW, h: cardsH },
    { x: page.x + (cardW + cardGap) * 2, y: cardsY, w: cardW, h: cardsH },
    { x: page.x, y: cardsY + cardsH + gap, w: page.w, h: footerH },
  ];
  return { frame, blocks };
};

export interface GaugeLayout {
  cx: number;
  cy: number;
  radius: number;
  pills: Rect[];
}

export const GAUGE_START = Math.PI * (5 / 6);
export const GAUGE_SWEEP = Math.PI * (4 / 3);
export const GAUGE_PILLS = 3;

export const gaugeLayout = (width: number, height: number): GaugeLayout => {
  const radius = Math.min(width * 0.425, height * 0.44);
  const pillH = height * 0.12;
  const pillGap = height * 0.04;
  const total = radius * 1.5 + pillGap + pillH;
  const top = (height - total) / 2;
  const cy = top + radius;
  const pillW = width * 0.26;
  const spacing = width * 0.03;
  const rowW = pillW * GAUGE_PILLS + spacing * (GAUGE_PILLS - 1);
  const pillY = cy + radius * 0.5 + pillGap;
  const pills: Rect[] = [];
  for (let index = 0; index < GAUGE_PILLS; index += 1) {
    pills.push({ x: (width - rowW) / 2 + index * (pillW + spacing), y: pillY, w: pillW, h: pillH });
  }
  return { cx: width / 2, cy, radius, pills };
};

export const gaugeAngle = (fraction: number): number =>
  GAUGE_START + GAUGE_SWEEP * Math.min(1, Math.max(0, fraction));

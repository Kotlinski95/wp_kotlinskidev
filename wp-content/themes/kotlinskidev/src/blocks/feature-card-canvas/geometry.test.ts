import {
  builderLayout,
  chartPoints,
  fitFullArea,
  gaugeAngle,
  gaugeLayout,
  GAUGE_START,
  GAUGE_SWEEP,
  lerpRect,
  mountainHeight,
  perimeterPoint,
  quadPoint,
  stackRects,
  storefrontLayout,
  treeLayout,
} from "./geometry";
import type { Rect } from "./types";

const within = (rect: Rect, width: number, height: number): boolean =>
  rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= width + 1e-6 && rect.y + rect.h <= height + 1e-6;

const SIZES: ReadonlyArray<readonly [number, number]> = [
  [300, 200],
  [120, 80],
  [800, 300],
];

describe("mountainHeight", () => {
  it("stays within bounds and is deterministic", () => {
    for (let x = 0; x <= 200; x += 5) {
      const value = mountainHeight(x, 200, 100, 1.3);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
      expect(mountainHeight(x, 200, 100, 1.3)).toBe(value);
    }
  });

  it("differs by seed and handles zero size", () => {
    expect(mountainHeight(50, 200, 100, 1)).not.toBe(mountainHeight(50, 200, 100, 2));
    expect(mountainHeight(0, 0, 0, 1)).toBe(0);
  });
});

describe("perimeterPoint", () => {
  const rect = { x: 10, y: 20, w: 100, h: 50 };

  it("walks the perimeter corners", () => {
    const close = (t: number, x: number, y: number) => {
      const point = perimeterPoint(rect, t);
      expect(point.x).toBeCloseTo(x);
      expect(point.y).toBeCloseTo(y);
    };
    close(0, 10, 20);
    close(100 / 300, 110, 20);
    close(150 / 300, 110, 70);
    close(250 / 300, 10, 70);
  });

  it("wraps and stays on the boundary", () => {
    const point = perimeterPoint(rect, -0.37);
    const onEdge = point.x === 10 || point.x === 110 || point.y === 20 || point.y === 70;
    expect(onEdge).toBe(true);
    expect(perimeterPoint(rect, 1.25).x).toBeCloseTo(perimeterPoint(rect, 0.25).x);
  });
});

describe("treeLayout", () => {
  it("has 7 nodes, 6 edges and an active path of valid indices", () => {
    const layout = treeLayout(300, 200);
    expect(layout.nodes).toHaveLength(7);
    expect(layout.edges).toHaveLength(6);
    layout.activePath.forEach((index) => expect(layout.nodes[index]).toBeDefined());
    layout.nodes.forEach((node) => {
      expect(node.x).toBeGreaterThanOrEqual(0);
      expect(node.x).toBeLessThanOrEqual(300);
      expect(node.y).toBeLessThanOrEqual(200);
    });
  });
});

describe("chartPoints", () => {
  it("keeps bars inside bounds and grows with progress", () => {
    const low = chartPoints(300, 200, 0);
    const high = chartPoints(300, 200, 1);
    high.bars.forEach((bar) => {
      expect(bar.x).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.w).toBeLessThanOrEqual(300);
      expect(bar.y).toBeGreaterThanOrEqual(0);
    });
    expect(high.bars[0].h).toBeGreaterThan(low.bars[0].h);
    expect(low.line).toHaveLength(1);
    expect(high.line).toHaveLength(6);
  });

  it("is deterministic", () => {
    expect(chartPoints(300, 200, 0.5)).toEqual(chartPoints(300, 200, 0.5));
  });
});

describe("stackRects", () => {
  it("returns three screens spreading with progress", () => {
    const rest = stackRects(300, 200, 0);
    const spread = stackRects(300, 200, 1);
    expect(rest).toHaveLength(3);
    expect(Math.abs(spread[2].x - spread[0].x)).toBeGreaterThan(Math.abs(rest[2].x - rest[0].x));
  });

  it("stacks decreasing screens from top-right back to bottom-left front inside the canvas", () => {
    const screens = stackRects(300, 200, 1);
    expect(screens[0].w).toBeGreaterThan(screens[1].w);
    expect(screens[1].w).toBeGreaterThan(screens[2].w);
    expect(screens[2].x).toBeLessThan(screens[0].x);
    expect(screens[2].y).toBeGreaterThan(screens[0].y);
    screens.forEach((screen) => {
      expect(screen.x).toBeGreaterThanOrEqual(0);
      expect(screen.y).toBeGreaterThanOrEqual(0);
      expect(screen.x + screen.w).toBeLessThanOrEqual(300);
      expect(screen.y + screen.h).toBeLessThanOrEqual(200);
    });
  });
});

describe("quadPoint and lerpRect", () => {
  it("hits endpoints and interpolates", () => {
    const a = { x: 0, y: 0 };
    const b = { x: 10, y: 20 };
    expect(quadPoint(a, { x: 5, y: -10 }, b, 0)).toEqual(a);
    expect(quadPoint(a, { x: 5, y: -10 }, b, 1)).toEqual(b);
    expect(lerpRect({ x: 0, y: 0, w: 10, h: 10 }, { x: 10, y: 20, w: 20, h: 30 }, 0.5)).toEqual({
      x: 5,
      y: 10,
      w: 15,
      h: 20,
    });
  });
});

describe("storefrontLayout", () => {
  it.each(SIZES)("keeps six tiles and the cart in bounds at %ix%i", (width, height) => {
    const layout = storefrontLayout(width, height);
    expect(layout.tiles).toHaveLength(6);
    layout.tiles.forEach((tile) => expect(within(tile, width, height)).toBe(true));
    expect(layout.cart.x).toBeLessThanOrEqual(width);
    expect(layout.cart.y).toBeGreaterThanOrEqual(0);
    expect(storefrontLayout(width, height)).toEqual(layout);
  });
});

describe("builderLayout", () => {
  it.each(SIZES)("keeps six blocks inside the frame at %ix%i", (width, height) => {
    const { frame, blocks } = builderLayout(width, height);
    expect(blocks).toHaveLength(6);
    expect(within(frame, width, height)).toBe(true);
    blocks.forEach((block) => expect(within(block, width, height)).toBe(true));
    expect(builderLayout(width, height).blocks).toEqual(blocks);
  });
});

describe("gaugeLayout", () => {
  it.each(SIZES)("keeps gauge and pills in bounds at %ix%i", (width, height) => {
    const { cx, cy, radius, pills } = gaugeLayout(width, height);
    expect(cx - radius).toBeGreaterThanOrEqual(0);
    expect(cx + radius).toBeLessThanOrEqual(width);
    expect(cy - radius).toBeGreaterThanOrEqual(0);
    pills.forEach((pill) => expect(within(pill, width, height)).toBe(true));
  });

  it("maps fractions to the 240 degree sweep and clamps", () => {
    expect(gaugeAngle(0)).toBe(GAUGE_START);
    expect(gaugeAngle(1)).toBeCloseTo(GAUGE_START + GAUGE_SWEEP);
    expect(gaugeAngle(2)).toBeCloseTo(GAUGE_START + GAUGE_SWEEP);
    expect(gaugeAngle(-1)).toBe(GAUGE_START);
  });
});

describe("fitFullArea", () => {
  it("spans the full width and height with a one pixel hairline inset", () => {
    expect(fitFullArea(400, 300)).toEqual({ x: 1, y: 1, w: 398, h: 298 });
  });
});

import { easeInOutCubic, easeOutBack, easeOutCubic, staggerProgress, stepProgress } from "./easing";

describe("easeInOutCubic", () => {
  it("maps endpoints and midpoint", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(1)).toBe(1);
    expect(easeInOutCubic(0.5)).toBeCloseTo(0.5);
  });

  it("clamps out-of-range input", () => {
    expect(easeInOutCubic(-3)).toBe(0);
    expect(easeInOutCubic(4)).toBe(1);
  });
});

describe("stepProgress", () => {
  it("moves linearly toward target", () => {
    expect(stepProgress(0, 1, 150)).toBeCloseTo(0.5);
    expect(stepProgress(1, 0, 150)).toBeCloseTo(0.5);
  });

  it("never overshoots", () => {
    expect(stepProgress(0.9, 1, 1000)).toBe(1);
    expect(stepProgress(0.1, 0, 1000)).toBe(0);
  });

  it("respects custom duration and zero dt", () => {
    expect(stepProgress(0, 1, 100, 1000)).toBeCloseTo(0.1);
    expect(stepProgress(0.4, 1, 0)).toBe(0.4);
  });

  it("holds at target", () => {
    expect(stepProgress(1, 1, 50)).toBe(1);
  });
});

describe("easeOutCubic and easeOutBack", () => {
  it("map endpoints and overshoot", () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutBack(0)).toBeCloseTo(0);
    expect(easeOutBack(1)).toBeCloseTo(1);
    expect(easeOutBack(0.7)).toBeGreaterThan(1);
  });
});

describe("staggerProgress", () => {
  it("delays later items and finishes all at 1", () => {
    expect(staggerProgress(0, 0, 4, 0.5)).toBe(0);
    expect(staggerProgress(0.3, 3, 4, 0.5)).toBe(0);
    expect(staggerProgress(0.3, 0, 4, 0.5)).toBeGreaterThan(staggerProgress(0.3, 2, 4, 0.5));
    for (let index = 0; index < 4; index += 1) {
      expect(staggerProgress(1, index, 4, 0.5)).toBeCloseTo(1);
    }
  });
});

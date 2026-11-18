export const easeInOutCubic = (t: number): number => {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5 ? 4 * clamped ** 3 : 1 - (-2 * clamped + 2) ** 3 / 2;
};

export const stepProgress = (
  current: number,
  target: number,
  dtMs: number,
  durationMs = 300
): number => {
  const step = Math.max(0, dtMs) / durationMs;
  if (current < target) {
    return Math.min(target, current + step);
  }
  if (current > target) {
    return Math.max(target, current - step);
  }
  return Math.min(1, Math.max(0, current));
};

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export const easeOutCubic = (t: number): number => 1 - (1 - clamp01(t)) ** 3;

export const easeOutBack = (t: number, overshoot = 1.70158): number => {
  const clamped = clamp01(t);
  const c3 = overshoot + 1;
  return 1 + c3 * (clamped - 1) ** 3 + overshoot * (clamped - 1) ** 2;
};

export const staggerProgress = (
  progress: number,
  index: number,
  count: number,
  spread: number
): number => {
  const step = spread / Math.max(1, count - 1);
  return clamp01((progress - index * step) / (1 - spread));
};

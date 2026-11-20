export type EasingName = "linear" | "easeOut" | "easeInOut" | "bounce";

const BOUNCE_STRENGTH = 7.5625;
const BOUNCE_DIVISOR = 2.75;

const bounce = (t: number): number => {
  const n1 = BOUNCE_STRENGTH;
  const d1 = BOUNCE_DIVISOR;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  }
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
};

const easingFunctions: Record<EasingName, (t: number) => number> = {
  linear: (t) => t,
  easeOut: (t) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  bounce,
};

export const DEFAULT_EASING: EasingName = "easeOut";

export const resolveEasing = (easingType: string): ((t: number) => number) =>
  easingFunctions[easingType as EasingName] || easingFunctions[DEFAULT_EASING];

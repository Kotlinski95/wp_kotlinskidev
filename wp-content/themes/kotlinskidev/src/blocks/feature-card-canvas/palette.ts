import type { FeatureCanvasPalette, Rgb } from "./types";

const FUNCTIONAL_RGB = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)/i;
const COLOR_SRGB = /^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i;
const HEX = /^#([\da-f]{3}|[\da-f]{6})$/i;

const toChannel = (raw: string): number => {
  const value = raw.endsWith("%") ? (parseFloat(raw) / 100) * 255 : parseFloat(raw);
  return Math.min(255, Math.max(0, Math.round(value)));
};

export const parseRgb = (css: string): Rgb | null => {
  const input = css.trim();
  const functional = FUNCTIONAL_RGB.exec(input);
  if (functional) {
    return [toChannel(functional[1]), toChannel(functional[2]), toChannel(functional[3])];
  }
  const srgb = COLOR_SRGB.exec(input);
  if (srgb) {
    return [
      toChannel(String(parseFloat(srgb[1]) * 255)),
      toChannel(String(parseFloat(srgb[2]) * 255)),
      toChannel(String(parseFloat(srgb[3]) * 255)),
    ];
  }
  const hex = HEX.exec(input);
  if (hex) {
    const digits =
      hex[1].length === 3
        ? hex[1]
            .split("")
            .map((digit) => digit + digit)
            .join("")
        : hex[1];
    return [
      parseInt(digits.slice(0, 2), 16),
      parseInt(digits.slice(2, 4), 16),
      parseInt(digits.slice(4, 6), 16),
    ];
  }
  return null;
};

export const rgba = (rgb: Rgb, alpha: number): string => {
  const clamped = Math.min(1, Math.max(0, alpha));
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${Number(clamped.toFixed(3))})`;
};

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => {
  const clamped = Math.min(1, Math.max(0, t));
  return [
    Math.round(a[0] + (b[0] - a[0]) * clamped),
    Math.round(a[1] + (b[1] - a[1]) * clamped),
    Math.round(a[2] + (b[2] - a[2]) * clamped),
  ];
};

const normaliseThroughCanvas = (css: string): string => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) {
    return css;
  }
  ctx.fillStyle = css;
  return String(ctx.fillStyle);
};

export const resolvePresetColor = (host: Element, slug: string): string => {
  const probe = document.createElement("span");
  probe.style.setProperty("color", `var(--wp--preset--color--${slug})`, "important");
  host.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  if (parseRgb(computed)) {
    return computed;
  }
  return normaliseThroughCanvas(computed);
};

export const DEFAULT_ACCENT_SLUG = "primary";

export const readPalette = (
  resolve: (slug: string) => string,
  accentSlug: string = DEFAULT_ACCENT_SLUG
): FeatureCanvasPalette => {
  const cache = new Map<string, Rgb | null>();
  const read = (slug: string): Rgb | null => {
    if (!cache.has(slug)) {
      cache.set(slug, parseRgb(resolve(slug)));
    }
    return cache.get(slug) ?? null;
  };
  const pick = (...slugs: string[]): Rgb => {
    for (const slug of slugs) {
      const value = read(slug);
      if (value) {
        return value;
      }
    }
    return read("foreground") ?? [0, 0, 0];
  };

  const isDefaultAccent = accentSlug === DEFAULT_ACCENT_SLUG;
  const accent = pick(accentSlug, DEFAULT_ACCENT_SLUG);
  const muted = pick("foreground-alt");
  return {
    accent,
    accentGlow: isDefaultAccent ? pick("primary-light", DEFAULT_ACCENT_SLUG) : accent,
    line: pick("divider", "foreground-alt"),
    muted,
    strong: mixRgb(muted, pick("foreground"), 0.5),
    surface: pick("surface"),
  };
};

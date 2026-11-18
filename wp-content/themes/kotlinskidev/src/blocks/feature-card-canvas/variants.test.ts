import type { DrawContext, FeatureCanvasPalette, FeatureCanvasVariant } from "./types";
import { isVariant, variantRegistry } from "./variants";

const palette: FeatureCanvasPalette = {
  accent: [200, 10, 10],
  accentGlow: [220, 40, 40],
  line: [60, 60, 60],
  muted: [120, 120, 120],
  strong: [30, 30, 30],
  surface: [20, 20, 20],
};

const createFakeCtx = () => {
  const strokeStyles: string[] = [];
  const fakeMethods = new Map<string, jest.Mock>();
  const ctx = new Proxy(
    {},
    {
      get: (_target, key: string) => {
        if (key === "measureText") {
          return () => ({ width: 10 });
        }
        if (!fakeMethods.has(key)) {
          fakeMethods.set(key, jest.fn());
        }
        return fakeMethods.get(key);
      },
      set: (_target, key: string, value: unknown) => {
        if (key === "strokeStyle") {
          strokeStyles.push(String(value));
        }
        return true;
      },
    }
  );
  return { ctx: ctx as unknown as CanvasRenderingContext2D, strokeStyles };
};

const variants = Object.keys(variantRegistry) as FeatureCanvasVariant[];
const accentToken = "200, 10, 10";

const run = (variant: FeatureCanvasVariant, progress: number) => {
  const { ctx, strokeStyles } = createFakeCtx();
  const dc: DrawContext = {
    ctx,
    width: 300,
    height: 200,
    time: 1000,
    progress,
    palette,
    labels: ["One", "Two", "Three"],
  };
  variantRegistry[variant](dc);
  return strokeStyles;
};

describe("variants", () => {
  it.each(variants)("%s draws at progress 0 and 1 without throwing", (variant) => {
    expect(() => run(variant, 0)).not.toThrow();
    expect(() => run(variant, 1)).not.toThrow();
    expect(() => run(variant, 0.5)).not.toThrow();
  });

  it.each(variants)("%s never strokes with the accent at progress 0", (variant) => {
    expect(run(variant, 0).some((style) => style.includes(accentToken))).toBe(false);
  });

  it.each(variants.filter((variant) => variant !== "dot-image-stack"))(
    "%s strokes with the accent when progress > 0",
    (variant) => {
      expect(run(variant, 1).some((style) => style.includes(accentToken))).toBe(true);
    }
  );

  it.each([
    "storefront",
    "layout-builder",
    "speed-gauge",
    "nav-about",
    "nav-projects",
    "nav-services",
    "nav-contact",
    "site-scroll",
    "checkout-flow",
    "app-dashboard",
    "load-waterfall",
    "local-search",
    "support-shield",
    "benefit-marketing",
    "benefit-saas",
    "benefit-design-system",
    "benefit-api",
    "commerce-conversion",
    "commerce-scale",
    "commerce-secure",
    "commerce-platforms",
    "illus-storefront",
    "illus-audit",
    "illus-mobile-first",
    "illus-vitals",
    "illus-mobile-checkout",
    "illus-seo-growth",
    "illus-handover",
    "illus-app-services",
    "vs-frameworks",
    "pwa-install",
    "ssr-smartedit",
    "nextjs-architecture",
    "perf-by-design",
    "smart-shopping-list",
    "wp-custom-theme",
    "wp-stack-ownership",
    "wp-flex-control",
  ] as const)("%s is deterministic and survives tiny and wide sizes", (variant) => {
    const first = run(variant, 0.6);
    expect(run(variant, 0.6)).toEqual(first);
    const sizes: ReadonlyArray<readonly [number, number]> = [
      [60, 40],
      [900, 300],
    ];
    sizes.forEach(([width, height]) => {
      const { ctx } = createFakeCtx();
      expect(() =>
        variantRegistry[variant]({
          ctx,
          width,
          height,
          time: 123456,
          progress: 1,
          palette,
          labels: [],
        })
      ).not.toThrow();
    });
  });

  it("isVariant narrows known names only", () => {
    expect(isVariant("node-tree")).toBe(true);
    expect(isVariant("speed-gauge")).toBe(true);
    expect(isVariant("nope")).toBe(false);
    expect(isVariant(3)).toBe(false);
    expect(isVariant("toString")).toBe(false);
  });
});

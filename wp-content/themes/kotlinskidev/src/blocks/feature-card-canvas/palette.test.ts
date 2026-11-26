import { mixRgb, parseRgb, readPalette, resolvePresetColor, rgba } from "./palette";

describe("parseRgb", () => {
  it("parses comma and space syntax", () => {
    expect(parseRgb("rgb(1, 2, 3)")).toEqual([1, 2, 3]);
    expect(parseRgb("rgba(10, 20, 30, 0.5)")).toEqual([10, 20, 30]);
    expect(parseRgb("rgb(10 20 30 / 50%)")).toEqual([10, 20, 30]);
  });

  it("parses hex and color(srgb)", () => {
    expect(parseRgb("#0a141e")).toEqual([10, 20, 30]);
    expect(parseRgb("#fff")).toEqual([255, 255, 255]);
    expect(parseRgb("color(srgb 1 0 0)")).toEqual([255, 0, 0]);
  });

  it("returns null for unparseable input", () => {
    expect(parseRgb("oklch(0.5 0.1 200)")).toBeNull();
    expect(parseRgb("")).toBeNull();
  });
});

describe("rgba and mixRgb", () => {
  it("formats and clamps alpha", () => {
    expect(rgba([1, 2, 3], 0.5)).toBe("rgba(1, 2, 3, 0.5)");
    expect(rgba([1, 2, 3], 4)).toBe("rgba(1, 2, 3, 1)");
  });

  it("mixes channels", () => {
    expect(mixRgb([0, 0, 0], [100, 200, 50], 0.5)).toEqual([50, 100, 25]);
    expect(mixRgb([0, 0, 0], [100, 200, 50], 0)).toEqual([0, 0, 0]);
  });
});

describe("resolvePresetColor", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("marks the probe colour important so card hover rules cannot override it", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const setProperty = jest.spyOn(CSSStyleDeclaration.prototype, "setProperty");
    jest.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(1, 2, 3)",
    } as CSSStyleDeclaration);

    resolvePresetColor(host, "primary");

    expect(setProperty).toHaveBeenCalledWith(
      "color",
      "var(--wp--preset--color--primary)",
      "important"
    );
  });

  it("reads the computed colour and removes the probe", () => {
    const host = document.createElement("div");
    document.body.append(host);
    jest.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "rgb(9, 8, 7)",
    } as CSSStyleDeclaration);

    expect(resolvePresetColor(host, "primary")).toBe("rgb(9, 8, 7)");
    expect(host.children).toHaveLength(0);
  });

  it("normalises through a canvas when the computed value does not parse", () => {
    const host = document.createElement("div");
    document.body.append(host);
    jest.spyOn(window, "getComputedStyle").mockReturnValue({
      color: "oklch(0.5 0.1 200)",
    } as CSSStyleDeclaration);
    const fakeCtx = { fillStyle: "" };
    Object.defineProperty(fakeCtx, "fillStyle", {
      get: () => "#112233",
      set: () => undefined,
    });
    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(fakeCtx as unknown as CanvasRenderingContext2D);

    expect(parseRgb(resolvePresetColor(host, "primary"))).toEqual([17, 34, 51]);
  });
});

describe("readPalette", () => {
  const table: Record<string, string> = {
    primary: "rgb(1, 1, 1)",
    "primary-light": "rgb(2, 2, 2)",
    divider: "rgb(3, 3, 3)",
    "foreground-alt": "rgb(4, 4, 4)",
    surface: "rgb(5, 5, 5)",
    foreground: "rgb(6, 6, 6)",
  };

  it("maps slugs to roles", () => {
    expect(readPalette((slug) => table[slug] ?? "")).toEqual({
      accent: [1, 1, 1],
      accentGlow: [2, 2, 2],
      line: [3, 3, 3],
      muted: [4, 4, 4],
      strong: [5, 5, 5],
      surface: [5, 5, 5],
    });
  });

  it("uses a custom accent slug for accent and glow", () => {
    const withCustom = { ...table, "brand-teal": "rgb(9, 9, 9)" };
    const palette = readPalette(
      (slug) => withCustom[slug as keyof typeof withCustom] ?? "",
      "brand-teal"
    );
    expect(palette.accent).toEqual([9, 9, 9]);
    expect(palette.accentGlow).toEqual([9, 9, 9]);
  });

  it("falls back to primary when the accent slug is unknown", () => {
    const palette = readPalette((slug) => table[slug] ?? "", "missing");
    expect(palette.accent).toEqual([1, 1, 1]);
    expect(palette.accentGlow).toEqual([3, 3, 3].map(() => 1));
  });

  it("derives strong by mixing muted toward foreground", () => {
    const strong = readPalette(
      (slug) =>
        ({ ...table, "foreground-alt": "rgb(100, 100, 100)", foreground: "rgb(0, 0, 0)" })[slug] ??
        ""
    ).strong;
    expect(strong).toEqual([50, 50, 50]);
  });

  it("falls back when slugs are missing", () => {
    const partial = { ...table, "primary-light": "", divider: "" };
    const palette = readPalette((slug) => partial[slug as keyof typeof partial] ?? "");
    expect(palette.accentGlow).toEqual([1, 1, 1]);
    expect(palette.line).toEqual([4, 4, 4]);
  });
});

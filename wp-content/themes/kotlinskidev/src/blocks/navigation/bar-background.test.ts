import { barBackgroundToColor, colorToBarBackground, PaletteColor } from "./bar-background";

const palette: PaletteColor[] = [
  { name: "Surface", slug: "surface", color: "light-dark(#f2f2f2, #1d1d1f)" },
  { name: "Primary", slug: "primary", color: "#8209d3" },
];

describe("bar background mapping", () => {
  it("stores a palette colour as its slug", () => {
    expect(colorToBarBackground("#8209d3", palette)).toBe("primary");
  });

  it("stores a custom colour as is and clears on undefined", () => {
    expect(colorToBarBackground("#112233", palette)).toBe("#112233");
    expect(colorToBarBackground(undefined, palette)).toBe("");
  });

  it("turns a stored slug back into the palette colour", () => {
    expect(barBackgroundToColor("surface", palette)).toBe("light-dark(#f2f2f2, #1d1d1f)");
  });

  it("returns custom values, and nothing for empty or unknown slugs", () => {
    expect(barBackgroundToColor("#112233", palette)).toBe("#112233");
    expect(barBackgroundToColor("", palette)).toBeUndefined();
    expect(barBackgroundToColor("deleted-slug", palette)).toBeUndefined();
  });
});

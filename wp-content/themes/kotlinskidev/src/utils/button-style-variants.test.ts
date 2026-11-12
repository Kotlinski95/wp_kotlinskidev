import fs from "fs";
import path from "path";
import {
  BUTTON_STYLE_OPTIONS,
  BUTTON_STYLE_VARIANTS,
  DEFAULT_BUTTON_STYLE,
  buttonStyleLabel,
  resolveButtonStyle,
} from "./button-style-variants";

const themeJsonPath = path.resolve(__dirname, "../../theme.json");
const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, "utf8")) as {
  styles: { blocks: { "core/button": { variations: Record<string, unknown> } } };
};

describe("button-style-variants", () => {
  it("matches the core/button variations defined in theme.json", () => {
    const names = Object.keys(themeJson.styles.blocks["core/button"].variations);
    expect([...BUTTON_STYLE_VARIANTS].sort()).toEqual([...names].sort());
  });

  it("has the default variant in the list", () => {
    expect(BUTTON_STYLE_VARIANTS).toContain(DEFAULT_BUTTON_STYLE);
  });

  it("builds readable labels and options", () => {
    expect(buttonStyleLabel("outline-primary-adaptive")).toBe("Outline Primary Adaptive");
    expect(BUTTON_STYLE_OPTIONS).toHaveLength(BUTTON_STYLE_VARIANTS.length);
  });

  it("falls back to the default for unknown or missing values", () => {
    expect(resolveButtonStyle(undefined)).toBe(DEFAULT_BUTTON_STYLE);
    expect(resolveButtonStyle("nope")).toBe(DEFAULT_BUTTON_STYLE);
    expect(resolveButtonStyle("fill-dark")).toBe("fill-dark");
  });
});

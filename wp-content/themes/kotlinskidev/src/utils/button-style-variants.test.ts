import fs from "fs";
import path from "path";
import {
  BUTTON_STYLE_OPTIONS,
  BUTTON_STYLE_VARIANTS,
  DEFAULT_BUTTON_STYLE,
  buttonStyleLabel,
  resolveButtonStyle,
} from "./button-style-variants";

const variantsPath = path.resolve(__dirname, "../button-style-variants.json");
const registeredNames = JSON.parse(fs.readFileSync(variantsPath, "utf8")) as string[];

describe("button-style-variants", () => {
  it("matches the core/button variations registered in button-style-variants.json", () => {
    expect([...BUTTON_STYLE_VARIANTS].sort()).toEqual([...registeredNames].sort());
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

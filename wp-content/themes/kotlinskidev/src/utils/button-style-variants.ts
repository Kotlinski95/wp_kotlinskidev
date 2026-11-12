export const DEFAULT_BUTTON_STYLE = "fill-adaptive";

export const BUTTON_STYLE_VARIANTS: readonly string[] = [
  "fill-light",
  "fill-dark",
  "fill-adaptive",
  "fill-adaptive-contrast",
  "primary-light",
  "primary-dark",
  "primary-adaptive",
  "primary-adaptive-contrast",
  "outline-light",
  "outline-dark",
  "outline-adaptive",
  "outline-adaptive-contrast",
  "outline-primary-light",
  "outline-primary-dark",
  "outline-primary-adaptive",
  "outline-primary-adaptive-contrast",
];

export const buttonStyleLabel = (name: string): string =>
  name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const BUTTON_STYLE_OPTIONS: ReadonlyArray<{ label: string; value: string }> =
  BUTTON_STYLE_VARIANTS.map((name) => ({ label: buttonStyleLabel(name), value: name }));

export const resolveButtonStyle = (value: unknown): string =>
  typeof value === "string" && BUTTON_STYLE_VARIANTS.includes(value) ? value : DEFAULT_BUTTON_STYLE;

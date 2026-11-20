const FONT_WEIGHTS = ["400", "500", "600", "700", "800"];
const LETTER_SPACINGS: Record<string, string> = { none: "0", wide: "0.02em", wider: "0.05em" };
const TEXT_TRANSFORMS = ["none", "uppercase", "capitalize"];
const PADDING_Y_RANGE = { min: 0.25, max: 2 };
const PADDING_X_RANGE = { min: 0.5, max: 4 };
const FONT_SIZE_SLUG_PATTERN = /^[a-z0-9-]{1,32}$/;
const DEFAULT_BORDER_WIDTH_PX = 1;

const parseClampedRem = (raw: string | undefined, min: number, max: number): string | null => {
  const parsed = Number.parseFloat(raw ?? "");
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return `${Math.min(max, Math.max(min, parsed))}rem`;
};

const applyTypography = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  if (dataset.ktLoadMoreFontSize && FONT_SIZE_SLUG_PATTERN.test(dataset.ktLoadMoreFontSize)) {
    button.style.fontSize = `var(--wp--preset--font-size--${dataset.ktLoadMoreFontSize})`;
  }
  if (dataset.ktLoadMoreFontWeight && FONT_WEIGHTS.includes(dataset.ktLoadMoreFontWeight)) {
    button.style.fontWeight = dataset.ktLoadMoreFontWeight;
  }
  const letterSpacingKey = dataset.ktLoadMoreLetterSpacing ?? "";
  if (Object.hasOwn(LETTER_SPACINGS, letterSpacingKey)) {
    button.style.letterSpacing = LETTER_SPACINGS[letterSpacingKey];
  }
  if (
    dataset.ktLoadMoreTextTransform &&
    TEXT_TRANSFORMS.includes(dataset.ktLoadMoreTextTransform)
  ) {
    button.style.textTransform = dataset.ktLoadMoreTextTransform;
  }
};

const applyPadding = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  const paddingY = parseClampedRem(
    dataset.ktLoadMorePaddingY,
    PADDING_Y_RANGE.min,
    PADDING_Y_RANGE.max
  );
  if (paddingY) {
    button.style.paddingBlock = paddingY;
  }
  const paddingX = parseClampedRem(
    dataset.ktLoadMorePaddingX,
    PADDING_X_RANGE.min,
    PADDING_X_RANGE.max
  );
  if (paddingX) {
    button.style.paddingInline = paddingX;
  }
};

const applyColors = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  const { ktLoadMoreTextColor, ktLoadMoreBgColor } = dataset;
  if (ktLoadMoreTextColor) {
    button.style.color = ktLoadMoreTextColor;
  }
  if (ktLoadMoreBgColor) {
    button.style.background = ktLoadMoreBgColor;
  }
};

const applyBorder = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  const borderColor = dataset.ktLoadMoreBorderColor;
  const borderWidth = Number.parseInt(dataset.ktLoadMoreBorderWidth ?? "", 10);
  const borderRadius = Number.parseInt(dataset.ktLoadMoreBorderRadius ?? "", 10);

  if (borderColor || Number.isFinite(borderWidth)) {
    button.style.borderStyle = "solid";
    button.style.borderColor = borderColor || "currentColor";
    button.style.borderWidth = `${Number.isFinite(borderWidth) ? borderWidth : DEFAULT_BORDER_WIDTH_PX}px`;
  }
  if (Number.isFinite(borderRadius)) {
    button.style.borderRadius = `${borderRadius}px`;
  }
};

const applyUnderline = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  if (dataset.ktLoadMoreUnderline) {
    button.style.textDecoration = "underline";
  }
};

export const applyButtonStyle = (button: HTMLButtonElement, dataset: DOMStringMap): void => {
  applyTypography(button, dataset);
  applyPadding(button, dataset);
  applyColors(button, dataset);
  applyBorder(button, dataset);
  applyUnderline(button, dataset);
};

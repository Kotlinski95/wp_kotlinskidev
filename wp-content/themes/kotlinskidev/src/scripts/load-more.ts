import { trackEvent } from "./track-event";

const DEFAULT_BUTTON_LABEL = "Load more";
const HIDDEN_CLASS = "kt-load-more-hidden";
const WRAPPER_CLASS = "kt-load-more__wrapper";
const FONT_WEIGHTS = ["400", "500", "600", "700", "800"];
const LETTER_SPACINGS: Record<string, string> = { none: "0", wide: "0.02em", wider: "0.05em" };
const TEXT_TRANSFORMS = ["none", "uppercase", "capitalize"];
const PADDING_Y_RANGE = { min: 0.25, max: 2 };
const PADDING_X_RANGE = { min: 0.5, max: 4 };

function parseClampedRem(raw: string | undefined, min: number, max: number): string | null {
  const parsed = Number.parseFloat(raw ?? "");
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return `${Math.min(max, Math.max(min, parsed))}rem`;
}

function applyButtonStyle(button: HTMLButtonElement, dataset: DOMStringMap): void {
  const { ktLoadMoreTextColor, ktLoadMoreBgColor, ktLoadMoreBorderColor } = dataset;
  const borderWidth = Number.parseInt(dataset.ktLoadMoreBorderWidth ?? "", 10);
  const borderRadius = Number.parseInt(dataset.ktLoadMoreBorderRadius ?? "", 10);

  if (dataset.ktLoadMoreFontSize && /^[a-z0-9-]{1,32}$/.test(dataset.ktLoadMoreFontSize)) {
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
  if (ktLoadMoreTextColor) {
    button.style.color = ktLoadMoreTextColor;
  }
  if (ktLoadMoreBgColor) {
    button.style.background = ktLoadMoreBgColor;
  }
  if (ktLoadMoreBorderColor || Number.isFinite(borderWidth)) {
    button.style.borderStyle = "solid";
    button.style.borderColor = ktLoadMoreBorderColor || "currentColor";
    button.style.borderWidth = `${Number.isFinite(borderWidth) ? borderWidth : 1}px`;
  }
  if (Number.isFinite(borderRadius)) {
    button.style.borderRadius = `${borderRadius}px`;
  }
  if (dataset.ktLoadMoreUnderline) {
    button.style.textDecoration = "underline";
  }
}

function applyButtonHoverStyle(button: HTMLButtonElement, dataset: DOMStringMap): void {
  const { ktLoadMoreHoverTextColor, ktLoadMoreHoverBgColor, ktLoadMoreHoverBorderColor } = dataset;

  if (!ktLoadMoreHoverTextColor && !ktLoadMoreHoverBgColor && !ktLoadMoreHoverBorderColor) {
    return;
  }

  const baseColor = button.style.color;
  const baseBackground = button.style.background;
  const baseBorderColor = button.style.borderColor;

  const setHoverStyle = () => {
    if (ktLoadMoreHoverTextColor) {
      button.style.color = ktLoadMoreHoverTextColor;
    }
    if (ktLoadMoreHoverBgColor) {
      button.style.background = ktLoadMoreHoverBgColor;
    }
    if (ktLoadMoreHoverBorderColor) {
      button.style.borderColor = ktLoadMoreHoverBorderColor;
    }
  };

  const resetStyle = () => {
    button.style.color = baseColor;
    button.style.background = baseBackground;
    button.style.borderColor = baseBorderColor;
  };

  button.addEventListener("mouseenter", setHoverStyle);
  button.addEventListener("mouseleave", resetStyle);
  button.addEventListener("focus", setHoverStyle);
  button.addEventListener("blur", resetStyle);
}

function createButtonWrapper(dataset: DOMStringMap): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = WRAPPER_CLASS;
  wrapper.style.textAlign =
    dataset.ktLoadMoreAlign === "center" || dataset.ktLoadMoreAlign === "right"
      ? dataset.ktLoadMoreAlign
      : "left";
  return wrapper;
}

function initLoadMore(container: HTMLElement): void {
  const initialCount = Number.parseInt(container.dataset.ktLoadMoreInitial ?? "", 10);
  if (!Number.isFinite(initialCount) || initialCount < 1) {
    return;
  }

  const children = Array.from(container.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  );

  if (children.length <= initialCount) {
    return;
  }

  const hiddenChildren = children.slice(initialCount);
  hiddenChildren.forEach((child) => child.classList.add(HIDDEN_CLASS));

  const button = document.createElement("button");
  button.type = "button";
  button.className = "kt-load-more__button";
  button.textContent = container.dataset.ktLoadMoreLabel || DEFAULT_BUTTON_LABEL;
  applyButtonStyle(button, container.dataset);
  applyButtonHoverStyle(button, container.dataset);

  const wrapper = createButtonWrapper(container.dataset);
  wrapper.appendChild(button);

  button.addEventListener("click", () => {
    hiddenChildren.forEach((child) => child.classList.remove(HIDDEN_CLASS));
    wrapper.remove();
    trackEvent("load_more_click", { items_revealed: hiddenChildren.length });
  });

  container.insertAdjacentElement("afterend", wrapper);
}

const init = (): void => {
  document
    .querySelectorAll<HTMLElement>("[data-kt-load-more-initial]")
    .forEach((container) => initLoadMore(container));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

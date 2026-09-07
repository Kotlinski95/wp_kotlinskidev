const DEFAULT_BUTTON_LABEL = "Load more";
const HIDDEN_CLASS = "kt-load-more-hidden";
const WRAPPER_CLASS = "kt-load-more__wrapper";

function applyButtonStyle(button: HTMLButtonElement, dataset: DOMStringMap): void {
  const { ktLoadMoreTextColor, ktLoadMoreBgColor, ktLoadMoreBorderColor } = dataset;
  const borderWidth = parseInt(dataset.ktLoadMoreBorderWidth ?? "", 10);
  const borderRadius = parseInt(dataset.ktLoadMoreBorderRadius ?? "", 10);

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
  const initialCount = parseInt(container.dataset.ktLoadMoreInitial ?? "", 10);
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

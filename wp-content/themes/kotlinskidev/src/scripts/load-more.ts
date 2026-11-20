import { trackEvent } from "./track-event";
import { applyButtonHoverStyle } from "./load-more/button-hover-style";
import { applyButtonStyle } from "./load-more/button-style";

const CONTAINER_SELECTOR = "[data-kt-load-more-initial]";
const DEFAULT_BUTTON_LABEL = "Load more";
const HIDDEN_CLASS = "kt-load-more-hidden";
const WRAPPER_CLASS = "kt-load-more__wrapper";
const BUTTON_CLASS = "kt-load-more__button";
const SUPPORTED_ALIGNMENTS = ["center", "right"];
const DEFAULT_ALIGNMENT = "left";

const createButtonWrapper = (dataset: DOMStringMap): HTMLDivElement => {
  const wrapper = document.createElement("div");
  wrapper.className = WRAPPER_CLASS;
  wrapper.style.textAlign =
    dataset.ktLoadMoreAlign && SUPPORTED_ALIGNMENTS.includes(dataset.ktLoadMoreAlign)
      ? dataset.ktLoadMoreAlign
      : DEFAULT_ALIGNMENT;
  return wrapper;
};

const createLoadMoreButton = (dataset: DOMStringMap): HTMLButtonElement => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  button.textContent = dataset.ktLoadMoreLabel || DEFAULT_BUTTON_LABEL;
  applyButtonStyle(button, dataset);
  applyButtonHoverStyle(button, dataset);
  return button;
};

const getHiddenChildren = (container: HTMLElement): HTMLElement[] => {
  const initialCount = Number.parseInt(container.dataset.ktLoadMoreInitial ?? "", 10);
  if (!Number.isFinite(initialCount) || initialCount < 1) {
    return [];
  }

  const children = Array.from(container.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement
  );
  return children.length <= initialCount ? [] : children.slice(initialCount);
};

const initLoadMore = (container: HTMLElement): void => {
  const hiddenChildren = getHiddenChildren(container);
  if (hiddenChildren.length === 0) {
    return;
  }

  hiddenChildren.forEach((child) => child.classList.add(HIDDEN_CLASS));

  const button = createLoadMoreButton(container.dataset);
  const wrapper = createButtonWrapper(container.dataset);
  wrapper.appendChild(button);

  button.addEventListener("click", () => {
    hiddenChildren.forEach((child) => child.classList.remove(HIDDEN_CLASS));
    wrapper.remove();
    trackEvent("load_more_click", { items_revealed: hiddenChildren.length });
  });

  container.insertAdjacentElement("afterend", wrapper);
};

const init = (): void => {
  document.querySelectorAll<HTMLElement>(CONTAINER_SELECTOR).forEach(initLoadMore);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

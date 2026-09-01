const DEFAULT_BUTTON_LABEL = "Load more";
const HIDDEN_CLASS = "kt-load-more-hidden";

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

  button.addEventListener("click", () => {
    hiddenChildren.forEach((child) => child.classList.remove(HIDDEN_CLASS));
    button.remove();
  });

  container.insertAdjacentElement("afterend", button);
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

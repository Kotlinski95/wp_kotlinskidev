const CARD_SELECTOR = ".kt-article-card, .kt-project-card";

function revealCards(panel: HTMLElement, cardAnimation: string): void {
  if ("fade-up" !== cardAnimation) {
    return;
  }

  const cards = Array.from(panel.querySelectorAll<HTMLElement>(CARD_SELECTOR));

  cards.forEach((card, index) => {
    card.classList.remove("visible");
    card.classList.add("fade-up-on-scroll");
    card.style.transitionDelay = `${index * 80}ms`;
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cards.forEach((card) => card.classList.add("visible"));
    });
  });
}

function swapPanels(
  root: HTMLElement,
  oldPanel: HTMLElement | undefined,
  newPanel: HTMLElement,
  cardAnimation: string
): void {
  oldPanel?.setAttribute("hidden", "");
  newPanel.removeAttribute("hidden");
  revealCards(newPanel, cardAnimation);
}

function fadeToPanel(
  root: HTMLElement,
  panelsWrapper: HTMLElement,
  oldPanel: HTMLElement | undefined,
  newPanel: HTMLElement,
  cardAnimation: string
): void {
  if (!oldPanel || oldPanel === newPanel) {
    swapPanels(root, oldPanel, newPanel, cardAnimation);
    return;
  }

  const frozenHeight = panelsWrapper.getBoundingClientRect().height;
  panelsWrapper.style.minHeight = `${frozenHeight}px`;

  const finishFadeOut = (): void => {
    oldPanel.removeEventListener("transitionend", finishFadeOut);
    oldPanel.classList.remove("kt-content-tabs__panel--fade-out");
    swapPanels(root, oldPanel, newPanel, cardAnimation);

    newPanel.classList.add("kt-content-tabs__panel--fade-out");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        newPanel.classList.remove("kt-content-tabs__panel--fade-out");
      });
    });

    window.setTimeout(() => {
      panelsWrapper.style.minHeight = "";
    }, 300);
  };

  oldPanel.addEventListener("transitionend", finishFadeOut, { once: true });
  oldPanel.classList.add("kt-content-tabs__panel--fade-out");
}

function activateTrigger(
  root: HTMLElement,
  triggers: HTMLElement[],
  panels: HTMLElement[],
  index: number
): void {
  const oldPanel = panels.find((panel) => !panel.hasAttribute("hidden"));
  const newPanel = panels[index];

  triggers.forEach((trigger, i) => {
    const isActive = i === index;
    trigger.setAttribute("aria-selected", isActive ? "true" : "false");
    trigger.setAttribute("tabindex", isActive ? "0" : "-1");
  });

  if (!newPanel || newPanel === oldPanel) {
    return;
  }

  const panelTransition = root.classList.contains("kt-content-tabs--transition-fade") ? "fade" : "";
  const cardAnimation = root.classList.contains("kt-content-tabs--card-animation-fade-up")
    ? "fade-up"
    : "";

  if ("fade" === panelTransition) {
    const panelsWrapper = root.querySelector<HTMLElement>(".kt-content-tabs__panels");
    if (panelsWrapper) {
      fadeToPanel(root, panelsWrapper, oldPanel, newPanel, cardAnimation);
      return;
    }
  }

  swapPanels(root, oldPanel, newPanel, cardAnimation);
}

function initContentTabs(root: HTMLElement): void {
  const nav = root.querySelector<HTMLElement>(".kt-content-tabs__nav");
  const panelsWrapper = root.querySelector<HTMLElement>(".kt-content-tabs__panels");
  if (!nav || !panelsWrapper) {
    return;
  }

  const triggers = Array.from(nav.querySelectorAll<HTMLElement>(".kt-content-tabs__nav-trigger"));
  const panels = Array.from(panelsWrapper.querySelectorAll<HTMLElement>(".kt-content-tabs__panel"));
  if (triggers.length === 0 || triggers.length !== panels.length) {
    return;
  }

  const isVertical = nav.getAttribute("aria-orientation") === "vertical";
  const nextKey = isVertical ? "ArrowDown" : "ArrowRight";
  const prevKey = isVertical ? "ArrowUp" : "ArrowLeft";

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      activateTrigger(root, triggers, panels, index);
    });

    trigger.addEventListener("keydown", (e: KeyboardEvent) => {
      let targetIndex = -1;

      if (e.key === nextKey) {
        targetIndex = (index + 1) % triggers.length;
      } else if (e.key === prevKey) {
        targetIndex = (index - 1 + triggers.length) % triggers.length;
      } else if (e.key === "Home") {
        targetIndex = 0;
      } else if (e.key === "End") {
        targetIndex = triggers.length - 1;
      }

      if (targetIndex === -1) {
        return;
      }

      e.preventDefault();
      activateTrigger(root, triggers, panels, targetIndex);
      triggers[targetIndex]?.focus();
    });
  });
}

const init = (): void => {
  document
    .querySelectorAll<HTMLElement>(".kt-content-tabs")
    .forEach((root) => initContentTabs(root));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

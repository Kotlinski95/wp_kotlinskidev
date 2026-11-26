import { fadeToPanel, swapPanels } from "./panel-switch";

interface TabElements {
  triggers: HTMLElement[];
  panels: HTMLElement[];
}

function activateTrigger(
  root: HTMLElement,
  { triggers, panels }: TabElements,
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
  const panelSwitch = { oldPanel, newPanel, cardAnimation };

  if ("fade" === panelTransition) {
    const panelsWrapper = root.querySelector<HTMLElement>(".kt-content-tabs__panels");
    if (panelsWrapper) {
      fadeToPanel(panelsWrapper, panelSwitch);
      return;
    }
  }

  swapPanels(panelSwitch);
}

interface NavigationKeys {
  next: string;
  prev: string;
}

function resolveTargetIndex(
  key: string,
  { index, count }: { index: number; count: number },
  keys: NavigationKeys
): number {
  if (key === keys.next) {
    return (index + 1) % count;
  }
  if (key === keys.prev) {
    return (index - 1 + count) % count;
  }
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return count - 1;
  }
  return -1;
}

interface TabsContext extends TabElements {
  root: HTMLElement;
}

function wireTrigger({ root, ...tabs }: TabsContext, index: number, keys: NavigationKeys): void {
  const trigger = tabs.triggers[index];

  trigger.addEventListener("click", () => {
    activateTrigger(root, tabs, index);
  });

  trigger.addEventListener("keydown", (e: KeyboardEvent) => {
    const targetIndex = resolveTargetIndex(e.key, { index, count: tabs.triggers.length }, keys);
    if (targetIndex === -1) {
      return;
    }

    e.preventDefault();
    activateTrigger(root, tabs, targetIndex);
    tabs.triggers[targetIndex]?.focus();
  });
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
  const keys: NavigationKeys = {
    next: isVertical ? "ArrowDown" : "ArrowRight",
    prev: isVertical ? "ArrowUp" : "ArrowLeft",
  };

  triggers.forEach((_trigger, index) => wireTrigger({ root, triggers, panels }, index, keys));
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

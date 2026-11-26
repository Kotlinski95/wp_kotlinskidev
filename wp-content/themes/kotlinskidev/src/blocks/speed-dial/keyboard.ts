import type { SpeedDialController } from "./controller";

type Direction = "up" | "down" | "left" | "right";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
const FIELD_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

const TOWARD: Record<Direction, string> = {
  up: "ArrowUp",
  down: "ArrowDown",
  left: "ArrowLeft",
  right: "ArrowRight",
};

const AWAY: Record<Direction, string> = {
  up: "ArrowDown",
  down: "ArrowUp",
  left: "ArrowRight",
  right: "ArrowLeft",
};

const readDirection = (root: HTMLElement): Direction => {
  const value = getComputedStyle(root).getPropertyValue("--kt-speed-dial-direction").trim();
  return value in TOWARD ? (value as Direction) : "up";
};

export const getItemTargets = (list: HTMLElement): HTMLElement[] =>
  Array.from(list.querySelectorAll<HTMLElement>(".kt-speed-dial__item"))
    .filter((item) => !item.hidden)
    .map((item) => item.querySelector<HTMLElement>(FOCUSABLE))
    .filter((target): target is HTMLElement => target !== null);

const isIgnored = (event: KeyboardEvent): boolean =>
  event.defaultPrevented ||
  event.altKey ||
  event.ctrlKey ||
  event.metaKey ||
  event.shiftKey ||
  FIELD_TAGS.has((event.target as HTMLElement).tagName);

export const attachKeyboard = (controller: SpeedDialController): (() => void) => {
  const { root, toggle, list } = controller;

  const onToggleKey = (key: string, targets: HTMLElement[]): boolean => {
    if (key === "Escape") {
      controller.close();
      return true;
    }
    if (key !== TOWARD[readDirection(root)]) {
      return false;
    }
    controller.open();
    targets[0]?.focus();
    return true;
  };

  const onItemKey = (key: string, current: number, targets: HTMLElement[]): boolean => {
    const direction = readDirection(root);
    const last = targets.length - 1;
    if (key === "Escape") {
      controller.close({ returnFocus: true });
    } else if (key === TOWARD[direction]) {
      targets[current === last ? 0 : current + 1].focus();
    } else if (key === AWAY[direction]) {
      (current === 0 ? toggle : targets[current - 1]).focus();
    } else if (key === "Home") {
      targets[0].focus();
    } else if (key === "End") {
      targets[last].focus();
    } else {
      return false;
    }
    return true;
  };

  const onKeyDown = (event: KeyboardEvent): void => {
    if (isIgnored(event)) {
      return;
    }
    const targets = getItemTargets(list);
    const source = event.target as HTMLElement;
    const current = targets.findIndex((target) => target === source || target.contains(source));
    const handled =
      source === toggle
        ? onToggleKey(event.key, targets)
        : current >= 0 && onItemKey(event.key, current, targets);
    if (handled) {
      event.preventDefault();
    }
  };

  root.addEventListener("keydown", onKeyDown);
  return () => root.removeEventListener("keydown", onKeyDown);
};

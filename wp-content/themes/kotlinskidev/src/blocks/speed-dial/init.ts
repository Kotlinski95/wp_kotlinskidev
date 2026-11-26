import { attachA11yBridge } from "./a11y-bridge";
import { createController, type SpeedDialController } from "./controller";
import { attachKeyboard, getItemTargets } from "./keyboard";

const ROOT_SELECTOR = "[data-kt-speed-dial]";

const mountDial = (
  root: HTMLElement
): { controller: SpeedDialController; teardown: () => void } | null => {
  const toggle = root.querySelector<HTMLButtonElement>(".kt-speed-dial__toggle");
  const list = root.querySelector<HTMLElement>(".kt-speed-dial__list");
  if (!toggle || !list) {
    return null;
  }
  if (!document.getElementById("ka11y-root")) {
    list.querySelectorAll("[data-kt-speed-dial-requires-a11y]").forEach((item) => item.remove());
  }
  if (getItemTargets(list).length === 0) {
    return null;
  }
  const controller = createController(root, toggle, list);
  const detachKeyboard = attachKeyboard(controller);
  root.hidden = false;
  return {
    controller,
    teardown: () => {
      detachKeyboard();
      controller.destroy();
    },
  };
};

export const initSpeedDial = (): (() => void) => {
  const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  const mounted = root ? mountDial(root) : null;
  if (!mounted) {
    return () => undefined;
  }
  const detachBridge = attachA11yBridge(() => mounted.controller.close());
  return () => {
    detachBridge();
    mounted.teardown();
  };
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSpeedDial, { once: true });
} else {
  initSpeedDial();
}

import type { GlowTarget } from "./glow-target";

const findFragmentRect = (el: HTMLElement, x: number, y: number): DOMRect => {
  const rects = el.getClientRects();

  for (const rect of rects) {
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return rect;
    }
  }

  return rects[0] ?? el.getBoundingClientRect();
};

export const trackPointerGlow = ({ listenEl, paintEl }: GlowTarget): void => {
  let frame = 0;

  listenEl.addEventListener("pointermove", (event) => {
    if (frame) {
      return;
    }

    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = findFragmentRect(paintEl, event.clientX, event.clientY);
      paintEl.style.setProperty("--kt-glow-x", `${event.clientX - rect.left}px`);
      paintEl.style.setProperty("--kt-glow-y", `${event.clientY - rect.top}px`);
    });
  });
};

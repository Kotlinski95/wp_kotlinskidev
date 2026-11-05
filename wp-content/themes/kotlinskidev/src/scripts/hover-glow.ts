interface GlowTarget {
  listenEl: HTMLElement;
  paintEl: HTMLElement;
}

function closestNonInlineAncestor(el: HTMLElement): HTMLElement {
  let node = el.parentElement;

  while (node && getComputedStyle(node).display === "inline") {
    node = node.parentElement;
  }

  return node ?? el;
}

function findFragmentRect(el: HTMLElement, x: number, y: number): DOMRect {
  const rects = el.getClientRects();

  for (const rect of rects) {
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return rect;
    }
  }

  return rects[0] ?? el.getBoundingClientRect();
}

(function () {
  const targets: GlowTarget[] = [];

  document
    .querySelectorAll<HTMLElement>(".kt-button__link.has-enhanced-hover-glow")
    .forEach((link) => {
      const label = link.querySelector<HTMLElement>(".kt-button__label");
      if (label) {
        targets.push({ listenEl: link, paintEl: label });
      }
    });

  document
    .querySelectorAll<HTMLElement>(".has-enhanced-hover-glow .wp-block-button__link")
    .forEach((link) => targets.push({ listenEl: link, paintEl: link }));

  document
    .querySelectorAll<HTMLElement>(
      ".wp-block-kotlinskidev-content-tabs-nav-link.has-enhanced-hover-glow"
    )
    .forEach((link) => {
      const label = link.querySelector<HTMLElement>(".kt-content-tabs-nav-link__label");
      if (label) {
        targets.push({ listenEl: link, paintEl: label });
      }
    });

  document
    .querySelectorAll<HTMLElement>(
      ".has-enhanced-hover-glow:not(.kt-button__link):not(.kt-button):not(.wp-block-button):not(.wp-block-kotlinskidev-content-tabs-nav-link)"
    )
    .forEach((el) => targets.push({ listenEl: closestNonInlineAncestor(el), paintEl: el }));

  if (!targets.length) {
    return;
  }

  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!supportsHover || prefersReducedMotion) {
    return;
  }

  targets.forEach(({ listenEl, paintEl }) => {
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
  });
})();

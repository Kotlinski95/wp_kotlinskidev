interface GlowTarget {
  listenEl: HTMLElement;
  paintEl: HTMLElement;
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
      ".has-enhanced-hover-glow:not(.kt-button__link):not(.kt-button):not(.wp-block-button)"
    )
    .forEach((el) => targets.push({ listenEl: el, paintEl: el }));

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
        const rect = paintEl.getBoundingClientRect();
        paintEl.style.setProperty("--kt-glow-x", `${event.clientX - rect.left}px`);
        paintEl.style.setProperty("--kt-glow-y", `${event.clientY - rect.top}px`);
      });
    });
  });
})();

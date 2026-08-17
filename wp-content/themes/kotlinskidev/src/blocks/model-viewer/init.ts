const supportsWebGL = (canvas: HTMLCanvasElement): boolean => {
  const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
  return Boolean(gl);
};

const initModelViewer = (button: HTMLButtonElement): void => {
  const canvas = button.querySelector<HTMLCanvasElement>(".model-viewer__canvas");
  if (!canvas || !supportsWebGL(canvas)) {
    return;
  }

  import(/* webpackChunkName: "model-viewer-runtime" */ "./runtime").then(({ mountModelViewer }) =>
    mountModelViewer(button, canvas)
  );
};

const init = (): void => {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".model-viewer__trigger[data-model-url]"
  );
  if (buttons.length === 0 || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        initModelViewer(entry.target as HTMLButtonElement);
        obs.unobserve(entry.target);
      });
    },
    { rootMargin: "200px 0px" }
  );

  buttons.forEach((el) => observer.observe(el));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

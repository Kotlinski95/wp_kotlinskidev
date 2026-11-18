import type * as Runtime from "./runtime";

const handles = new WeakMap<HTMLElement, Promise<Runtime.FeatureCanvasHandle>>();

const loadRuntime = (): Promise<typeof Runtime> =>
  import(/* webpackChunkName: "feature-card-canvas-runtime" */ "./runtime");

const init = (): void => {
  const hosts = document.querySelectorAll<HTMLElement>(".kt-feature-canvas[data-variant]");
  if (hosts.length === 0 || !("IntersectionObserver" in window)) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const host = entry.target as HTMLElement;
        const existing = handles.get(host);
        if (existing) {
          existing
            .then((handle) => handle.setVisible(entry.isIntersecting))
            .catch((error) => console.error("feature-card-canvas: runtime failed", error));
          return;
        }
        if (!entry.isIntersecting) {
          return;
        }
        const mounted = loadRuntime().then((runtime) => runtime.mountFeatureCanvas(host));
        handles.set(host, mounted);
        mounted.catch((error) =>
          console.error("feature-card-canvas: failed to load runtime", error)
        );
      });
    },
    { rootMargin: "200px 0px" }
  );

  hosts.forEach((host) => observer.observe(host));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

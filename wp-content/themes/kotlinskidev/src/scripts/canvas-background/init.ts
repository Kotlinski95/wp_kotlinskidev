import type * as Runtime from "./runtime";
import type { CanvasRecipe } from "./types";

// eslint-disable-next-line -- webpack's reserved runtime publicPath override identifier, not camelCase by webpack's own convention
declare let __webpack_public_path__: string;

declare global {
  interface Window {
    kotlinskidevCanvasBuildBaseUrl?: string;
  }
}

if (typeof window !== "undefined" && window.kotlinskidevCanvasBuildBaseUrl) {
  // eslint-disable-next-line -- webpack's reserved runtime publicPath override identifier, read internally by webpack's chunk loader
  __webpack_public_path__ = window.kotlinskidevCanvasBuildBaseUrl;
}

let runtimeModulePromise: Promise<typeof Runtime> | null = null;

const loadRuntime = (): Promise<typeof Runtime> => {
  if (!runtimeModulePromise) {
    runtimeModulePromise = import(/* webpackChunkName: "canvas-background-runtime" */ "./runtime");
  }
  return runtimeModulePromise;
};

const parseRecipe = (raw: string): CanvasRecipe | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as { layers?: unknown }).layers)
    ) {
      return parsed as CanvasRecipe;
    }
  } catch {
    return null;
  }
  return null;
};

const init = (): void => {
  const hosts = document.querySelectorAll<HTMLElement>(".kt-canvas-bg[data-canvas-recipe]");
  if (hosts.length === 0 || !("IntersectionObserver" in window)) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mounted = new WeakSet<HTMLElement>();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const host = entry.target as HTMLElement;

        if (!entry.isIntersecting) {
          if (mounted.has(host)) {
            loadRuntime().then((runtime) => runtime.setActive(host, false));
          }
          return;
        }

        if (mounted.has(host)) {
          loadRuntime().then((runtime) => runtime.setActive(host, true));
          return;
        }

        const recipe = parseRecipe(host.dataset.canvasRecipe ?? "");
        if (!recipe) {
          return;
        }

        mounted.add(host);
        loadRuntime().then((runtime) => runtime.mount(host, recipe, reducedMotion));
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

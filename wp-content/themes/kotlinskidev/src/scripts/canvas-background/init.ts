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

const HOST_SELECTOR = ".kt-canvas-bg[data-canvas-recipe]";
const EDITOR_IFRAME_SELECTOR = "iframe[name='editor-canvas']";

const watchedDocuments = new WeakSet<Document>();

const watchDocument = (doc: Document): void => {
  if (watchedDocuments.has(doc)) {
    return;
  }
  watchedDocuments.add(doc);

  const win = doc.defaultView;
  if (!doc.body || !win || !("IntersectionObserver" in win)) {
    return;
  }

  const reducedMotion = win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mounted = new WeakSet<HTMLElement>();

  const intersectionObserver = new win.IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const host = entry.target as HTMLElement;

        if (!entry.isIntersecting) {
          if (mounted.has(host)) {
            loadRuntime()
              .then((runtime) => runtime.setActive(host, false))
              .catch((error) => console.error("canvas-background: failed to load runtime", error));
          }
          return;
        }

        if (mounted.has(host)) {
          loadRuntime()
            .then((runtime) => runtime.setActive(host, true))
            .catch((error) => console.error("canvas-background: failed to load runtime", error));
          return;
        }

        const recipe = parseRecipe(host.dataset.canvasRecipe ?? "");
        if (!recipe) {
          return;
        }

        mounted.add(host);
        loadRuntime()
          .then((runtime) => runtime.mount(host, recipe, reducedMotion))
          .catch((error) => console.error("canvas-background: failed to load runtime", error));
      });
    },
    { rootMargin: "200px 0px" }
  );

  const observeHost = (host: HTMLElement): void => {
    intersectionObserver.observe(host);
  };

  doc.querySelectorAll<HTMLElement>(HOST_SELECTOR).forEach(observeHost);

  const mutationObserver = new win.MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof win.HTMLElement)) {
          return;
        }
        if (node.matches(HOST_SELECTOR)) {
          observeHost(node);
        }
        node.querySelectorAll<HTMLElement>(HOST_SELECTOR).forEach(observeHost);
      });
    });
  });

  mutationObserver.observe(doc.body, { childList: true, subtree: true });
};

const watchEditorIframes = (): void => {
  const iframesWithLoadListener = new WeakSet<HTMLIFrameElement>();

  const attach = (iframe: HTMLIFrameElement): void => {
    const doc = iframe.contentDocument;
    if (doc && doc.body) {
      watchDocument(doc);
    }

    if (iframesWithLoadListener.has(iframe)) {
      return;
    }
    iframesWithLoadListener.add(iframe);

    iframe.addEventListener("load", () => {
      const loadedDoc = iframe.contentDocument;
      if (loadedDoc && loadedDoc.body) {
        watchDocument(loadedDoc);
      }
    });
  };

  document.querySelectorAll<HTMLIFrameElement>(EDITOR_IFRAME_SELECTOR).forEach(attach);

  const bodyObserver = new MutationObserver(() => {
    document.querySelectorAll<HTMLIFrameElement>(EDITOR_IFRAME_SELECTOR).forEach(attach);
  });
  bodyObserver.observe(document.body, { childList: true, subtree: true });
};

const init = (): void => {
  watchDocument(document);
  watchEditorIframes();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

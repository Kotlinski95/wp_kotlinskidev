import { HOST_SELECTOR, parseRecipe } from "./host-recipe";
import { withRuntime } from "./runtime-loader";

const VIEWPORT_ROOT_MARGIN = "200px 0px";

const watchedDocuments = new WeakSet<Document>();

const createIntersectionCallback = (
  mounted: WeakSet<HTMLElement>,
  reducedMotion: boolean
): IntersectionObserverCallback => {
  return (entries) => {
    entries.forEach((entry) => {
      const host = entry.target as HTMLElement;

      if (!entry.isIntersecting) {
        if (mounted.has(host)) {
          withRuntime((runtime) => runtime.setActive(host, false));
        }
        return;
      }

      if (mounted.has(host)) {
        withRuntime((runtime) => runtime.setActive(host, true));
        return;
      }

      const recipe = parseRecipe(host.dataset.canvasRecipe ?? "");
      if (!recipe) {
        return;
      }

      mounted.add(host);
      withRuntime((runtime) => runtime.mount(host, recipe, reducedMotion));
    });
  };
};

const observeAddedHosts = (
  win: Window & typeof globalThis,
  mutations: MutationRecord[],
  observeHost: (host: HTMLElement) => void
): void => {
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
};

export const watchDocument = (doc: Document): void => {
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
    createIntersectionCallback(mounted, reducedMotion),
    { rootMargin: VIEWPORT_ROOT_MARGIN }
  );

  const observeHost = (host: HTMLElement): void => {
    intersectionObserver.observe(host);
  };

  doc.querySelectorAll<HTMLElement>(HOST_SELECTOR).forEach(observeHost);

  const mutationObserver = new win.MutationObserver((mutations) =>
    observeAddedHosts(win, mutations, observeHost)
  );

  mutationObserver.observe(doc.body, { childList: true, subtree: true });
};

const PENDING_COUNTER_SELECTOR = ".animated-counter:not([data-counter-animated])";
const COUNTER_CLASS = "animated-counter";
const ANIMATED_ATTRIBUTE = "data-counter-animated";
const MUTATION_DEBOUNCE_MS = 150;

let mutationTimeout: number | null = null;

export const cancelPendingCounterScan = (): void => {
  if (mutationTimeout) {
    clearTimeout(mutationTimeout);
  }
};

const isPendingCounterNode = (node: Node): boolean => {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }
  const element = node as Element;
  return (
    (element.classList?.contains(COUNTER_CLASS) && !element.hasAttribute(ANIMATED_ATTRIBUTE)) ||
    Boolean(element.querySelector?.(PENDING_COUNTER_SELECTOR))
  );
};

const addedPendingCounter = (mutations: MutationRecord[]): boolean =>
  mutations.some(
    (mutation) =>
      mutation.type === "childList" &&
      Array.from(mutation.addedNodes).some((node) => isPendingCounterNode(node))
  );

export const watchForNewCounters = (onNewCounters: () => void): void => {
  const mutationObserver = new MutationObserver((mutations) => {
    if (mutationTimeout) {
      clearTimeout(mutationTimeout);
    }

    mutationTimeout = window.setTimeout(() => {
      if (addedPendingCounter(mutations)) {
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => onNewCounters());
        } else {
          onNewCounters();
        }
      }

      mutationTimeout = null;
    }, MUTATION_DEBOUNCE_MS);
  });

  mutationObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
    attributes: false,
  });
};

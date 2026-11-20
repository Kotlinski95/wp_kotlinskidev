import { enqueueElement } from "./batch-queue";

const OBSERVER_ROOT_MARGIN = "200px 0px";
const PROTECTED_SELECTOR = '[data-protected="true"]';

let intersectionObserver: IntersectionObserver | null = null;

const getIntersectionObserver = (): IntersectionObserver => {
  if (!intersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            enqueueElement(entry.target as HTMLElement);
          }
        });
      },
      { rootMargin: OBSERVER_ROOT_MARGIN }
    );
  }

  return intersectionObserver;
};

export const observeElement = (element: HTMLElement): void => {
  getIntersectionObserver().observe(element);
};

export const processProtectedElements = (): void => {
  const protectedElements = document.querySelectorAll(PROTECTED_SELECTOR);
  protectedElements.forEach((element) => observeElement(element as HTMLElement));
};

const observeAddedNode = (node: Node): void => {
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return;
  }
  const element = node as HTMLElement;

  if (element.hasAttribute("data-protected")) {
    observeElement(element);
  }

  element.querySelectorAll(PROTECTED_SELECTOR).forEach((protectedEl) => {
    observeElement(protectedEl as HTMLElement);
  });
};

export const observeDOM = (): void => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach(observeAddedNode);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

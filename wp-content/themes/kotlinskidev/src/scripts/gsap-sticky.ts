import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function readStickyTopOffset(el: HTMLElement): number {
  return parseFloat(getComputedStyle(el).top) || 0;
}

function createLayoutPlaceholder(el: HTMLElement): HTMLElement {
  const placeholder = document.createElement("div");
  placeholder.style.cssText = `height:${el.offsetHeight}px;width:100%;visibility:hidden;pointer-events:none;align-self:flex-start;flex-shrink:0;`;
  return placeholder;
}

function createPortalHost(): HTMLElement {
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;top:0;left:0;pointer-events:none;visibility:hidden;";
  document.body.appendChild(host);
  return host;
}

function applyNativeSticky(el: HTMLElement, topOffset: number): void {
  el.style.position = "sticky";
  el.style.top = `${topOffset}px`;
  el.style.pointerEvents = "all";
}

function alignHostToPlaceholder(
  host: HTMLElement,
  placeholder: HTMLElement,
  stickyParent: HTMLElement
): void {
  const rect = placeholder.getBoundingClientRect();
  host.style.top = `${rect.top + window.scrollY}px`;
  host.style.left = `${rect.left + window.scrollX}px`;
  host.style.width = `${rect.width}px`;
  host.style.height = `${stickyParent.offsetHeight}px`;
}

function watchForTransformChange(pageWrapper: HTMLElement, onChange: () => void): void {
  let lastTransform = "__init__";
  gsap.ticker.add(() => {
    const current = pageWrapper.style.transform;
    if (current === lastTransform) {
      return;
    }
    lastTransform = current;
    onChange();
  });
}

function watchParentResize(
  stickyParent: HTMLElement,
  placeholder: HTMLElement,
  el: HTMLElement,
  onResize: () => void
): void {
  new ResizeObserver(() => {
    requestAnimationFrame(() => {
      placeholder.style.height = `${el.offsetHeight}px`;
      onResize();
    });
  }).observe(stickyParent);
}

function mountStickyPortal(el: HTMLElement, pageWrapper: HTMLElement): void {
  if (!el.closest(".wp-block-columns")) {
    return;
  }

  const stickyParent = el.parentElement!;
  const topOffset = readStickyTopOffset(el);

  const placeholder = createLayoutPlaceholder(el);
  stickyParent.insertBefore(placeholder, el);

  const host = createPortalHost();
  host.appendChild(el);
  applyNativeSticky(el, topOffset);

  let placeholderVisible = false;
  const sync = () => alignHostToPlaceholder(host, placeholder, stickyParent);
  const syncIfVisible = () => {
    if (placeholderVisible) {
      sync();
    }
  };

  new IntersectionObserver((entries) => {
    placeholderVisible = entries[0].isIntersecting;
    host.style.visibility = placeholderVisible ? "visible" : "hidden";
    if (placeholderVisible) {
      sync();
    }
  }).observe(stickyParent);

  watchForTransformChange(pageWrapper, syncIfVisible);
  watchParentResize(stickyParent, placeholder, el, syncIfVisible);
}

// GSAP's scroll-section applies a persistent transform to .main-wrapper via pinnedContainer
// compensation — this breaks CSS position:sticky in all browsers. Portals each sticky element
// to <body> so native sticky works outside the transformed ancestor, while a placeholder
// preserves the original column layout.
function initGsapSticky(): void {
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  if (!pageWrapper || !document.querySelector(".scroll-section")) {
    return;
  }

  document
    .querySelectorAll<HTMLElement>(".is-kotlinskidev-sticky")
    .forEach((el) => mountStickyPortal(el, pageWrapper));
}

document.addEventListener("DOMContentLoaded", initGsapSticky);

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function readStickyTopOffset(el: HTMLElement): number {
  return parseFloat(getComputedStyle(el).top) || 0;
}

function createLayoutPlaceholder(el: HTMLElement): HTMLElement {
  const placeholder = document.createElement("div");
  const flexBasis = el.style.flexBasis;
  const widthRule = flexBasis
    ? `flex-basis:${flexBasis};width:${flexBasis}`
    : `width:${el.offsetWidth}px`;
  placeholder.style.cssText = `height:${el.offsetHeight}px;${widthRule};visibility:hidden;pointer-events:none;align-self:flex-start;flex-shrink:0;`;
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

export function watchForTransformChange(pageWrapper: HTMLElement, onChange: () => void): void {
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

// The placeholder's own height only ever matches the sticky element's natural content height
// (e.g. a short "FAQ" heading + CTA), not the row's real rendered extent. `.wp-block-columns`
// stretches every column to the tallest sibling's height by default (no verticalAlignment set,
// so `align-items: normal` resolves to `stretch`) — an inline height on the placeholder overrides
// that stretch for the placeholder itself, so `stickyParent` (the row) still correctly grows to
// match a tall sibling column (e.g. FAQ accordions opening) while the placeholder stays short.
// Checking the placeholder's own rect for "is this section still on screen" hides the sticky
// column as soon as its short placeholder scrolls past, long before the actually-visible
// stretched row (and its still-visible sibling column) has scrolled out of view — confirmed live:
// placeholder height 150px vs. the row's real 828px once all FAQ accordions are open.
function isRowInViewport(placeholder: HTMLElement, stickyParent: HTMLElement): boolean {
  const top = placeholder.getBoundingClientRect().top;
  const bottom = top + stickyParent.offsetHeight;
  return bottom > 0 && top < window.innerHeight;
}

function mountStickyPortal(el: HTMLElement): void {
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

  // A visibility+position resync runs every animation frame (via gsap.ticker) instead of an
  // IntersectionObserver, because an observer's callback can lag behind rapid, stacked page-height
  // changes (accordion opens, load-more reveals, ScrollTrigger.refresh() all landing close
  // together) and leave the portal host visible — and stuck at a stale position — long after its
  // placeholder has scrolled out of view.
  const resync = () => {
    const visible = isRowInViewport(placeholder, stickyParent);
    host.style.visibility = visible ? "visible" : "hidden";
    if (visible) {
      alignHostToPlaceholder(host, placeholder, stickyParent);
    }
  };

  gsap.ticker.add(resync);
  watchParentResize(stickyParent, placeholder, el, resync);
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
    .forEach((el) => mountStickyPortal(el));
}

document.addEventListener("DOMContentLoaded", initGsapSticky);

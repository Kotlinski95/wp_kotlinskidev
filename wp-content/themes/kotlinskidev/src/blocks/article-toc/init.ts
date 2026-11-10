import {
  beginProgrammaticScroll,
  endProgrammaticScroll,
  getElementScrollTop,
  getMaxScrollTop,
  getScrollContainer,
  getScrollOffsets,
  getScrollTop,
  getScrollViewportHeight,
  onScroll,
  scrollTo,
  isMobile,
  isProgrammaticScrollActive,
  onScreenSizeChange,
  rafThrottle,
} from "../../scripts/utils";
import { createListScroller } from "./scroll-list";
import { lockScroll, unlockScroll } from "@utils/scroll-lock";

const ROOT_SELECTOR = ".kt-article-toc-block";
const LOCK_OWNER = "article-toc";
const ACTIVE_VIEWPORT_RATIO = 0.25;
const SCROLL_END_FALLBACK_MS = 1000;
const SCROLL_CLEARANCE_PX = 16;
const DOCUMENT_BOTTOM_TOLERANCE_PX = 2;

function getOffset(): number {
  const offsets = getScrollOffsets();
  return isMobile() ? offsets.mobile : offsets.desktop;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveHeadings(links: HTMLAnchorElement[]): (HTMLElement | null)[] {
  return links.map((link) => {
    const id = (link.getAttribute("href") ?? "").slice(1);
    return id ? document.getElementById(id) : null;
  });
}

function computeActiveIndex(headings: (HTMLElement | null)[]): number {
  if (headings.length > 0 && getScrollTop() >= getMaxScrollTop() - DOCUMENT_BOTTOM_TOLERANCE_PX) {
    return headings.length - 1;
  }

  const threshold = getOffset() + getScrollViewportHeight() * ACTIVE_VIEWPORT_RATIO;
  let active = -1;
  headings.forEach((heading, index) => {
    if (heading && heading.getBoundingClientRect().top <= threshold) {
      active = index;
    }
  });
  return active;
}

function initRoot(root: HTMLElement): void {
  const toggle = root.querySelector<HTMLButtonElement>(".kt-article-toc-toggle");
  const dialog = root.querySelector<HTMLDialogElement>(".kt-article-toc-dialog");
  if (!toggle || !dialog) {
    return;
  }

  const closeButton = dialog.querySelector<HTMLButtonElement>(".kt-article-toc-dialog__close");
  const allLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-kt-toc-link]"));
  const dialogLinks = Array.from(dialog.querySelectorAll<HTMLAnchorElement>("[data-kt-toc-link]"));
  const mainLinks = allLinks.filter((link) => !dialog.contains(link));
  const headings = resolveHeadings(mainLinks);

  document.body.appendChild(toggle);
  document.body.appendChild(dialog);

  const mainScroller = createListScroller(
    mainLinks[0]?.closest<HTMLElement>(".kt-article-toc") ?? root,
    prefersReducedMotion
  );
  const dialogScroller = createListScroller(
    dialogLinks[0]?.closest<HTMLElement>(".kt-article-toc") ?? dialog,
    prefersReducedMotion
  );

  let activeIndex = -2;
  let spyLocked = false;

  const setActive = (index: number): void => {
    if (index === activeIndex) {
      return;
    }
    activeIndex = index;
    [mainLinks, dialogLinks].forEach((links) => {
      links.forEach((link, linkIndex) => {
        const isActive = linkIndex === index;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    });
    if (index >= 0) {
      mainScroller.scrollToLink(mainLinks[index]);
      if (dialog.open) {
        dialogScroller.scrollToLink(dialogLinks[index]);
      }
    }
  };

  const updateSpy = (): void => {
    if (spyLocked || isProgrammaticScrollActive()) {
      return;
    }
    setActive(computeActiveIndex(headings));
  };

  const throttledUpdate = rafThrottle(updateSpy);

  const openDialog = (): void => {
    if (dialog.open) {
      return;
    }
    dialog.showModal();
    toggle.setAttribute("aria-expanded", "true");
    lockScroll(LOCK_OWNER);
    const target =
      dialogLinks[activeIndex] ?? dialog.querySelector<HTMLAnchorElement>("[data-kt-toc-link]");
    dialogScroller.scrollToLink(target, { force: true });
    target?.focus({ preventScroll: true });
  };

  dialog.addEventListener("close", () => {
    toggle.setAttribute("aria-expanded", "false");
    unlockScroll(LOCK_OWNER);
    toggle.focus({ preventScroll: true });
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  toggle.addEventListener("click", openDialog);
  closeButton?.addEventListener("click", () => dialog.close());

  const scrollToHeading = (index: number): void => {
    const heading = headings[index];
    if (!heading) {
      return;
    }

    spyLocked = true;
    setActive(index);
    beginProgrammaticScroll();

    let finished = false;
    let fallbackTimer = 0;
    const scrollEndTarget: EventTarget = getScrollContainer() ?? window;
    const finish = (): void => {
      if (finished) {
        return;
      }
      finished = true;
      window.clearTimeout(fallbackTimer);
      scrollEndTarget.removeEventListener("scrollend", finish);
      endProgrammaticScroll();
      spyLocked = false;
      heading.setAttribute("tabindex", "-1");
      heading.focus({ preventScroll: true });
    };

    scrollEndTarget.addEventListener("scrollend", finish);
    fallbackTimer = window.setTimeout(finish, SCROLL_END_FALLBACK_MS);

    scrollTo(
      Math.max(0, getElementScrollTop(heading) - getOffset() - SCROLL_CLEARANCE_PX),
      prefersReducedMotion() ? "auto" : "smooth"
    );
  };

  [mainLinks, dialogLinks].forEach((links) => {
    links.forEach((link, index) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const id = (link.getAttribute("href") ?? "").slice(1);
        if (dialog.open) {
          dialog.close();
        }
        scrollToHeading(index);
        if (id) {
          history.pushState(null, "", `#${id}`);
        }
      });
    });
  });

  onScreenSizeChange((mobile) => {
    if (!mobile && dialog.open) {
      dialog.close();
    }
  });

  onScroll(throttledUpdate);
  window.addEventListener("resize", throttledUpdate);
  window.addEventListener("load", updateSpy);
  window.addEventListener("scrollend", updateSpy);
  getScrollContainer()?.addEventListener("scrollend", updateSpy);
  document.addEventListener("visibilitychange", updateSpy);

  updateSpy();
}

function init(): void {
  const root = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  if (root) {
    initRoot(root);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PIN_PROXIMITY_MARGIN_PX = 300;
const SETTLE_FRAMES = 6;

let followFrameId: number | null = null;
let framesSinceChange = 0;
let lastNaturalHeight: number | null = null;
let lastKnownDocScrollHeight = 0;

// GSAP locks the pinned element's height inline the first time ScrollTrigger.create() runs, and
// leaves it untouched until the next refresh() — it does not continuously re-measure on every
// tick. ScrollTrigger.refresh() re-measures by reading that element's *own current* height,
// which, left set, is still the old locked value: refresh() ends up confirming the same stale
// number back to itself rather than the page's true natural content height. `.main-wrapper` has
// `overflow: visible`, so `scrollHeight` can't be used to detect this either — an
// overflow-visible element's scrollHeight just mirrors its own (possibly wrong) box height, not
// the extent of its overflowing children.
//
// Clearing the inline height first and reading offsetHeight immediately (synchronous reflow)
// gives the real natural height, confirmed live against `getBoundingClientRect()` on every
// descendant. That's measured independently of GSAP's own remeasurement, then applied directly.
// Only ever called while `.main-wrapper` is NOT currently pin-fixed — see isPinFixed()'s comment
// for why mutating it while fixed is unsafe.
function measureNaturalHeight(el: HTMLElement): number {
  el.style.removeProperty("height");
  el.style.removeProperty("max-height");
  return el.offsetHeight;
}

function applyHeight(el: HTMLElement, height: number): void {
  el.style.height = `${height}px`;
  el.style.maxHeight = `${height}px`;
}

// `trigger.isActive` only flips true once GSAP's own scroll listener has processed the crossing
// into a pin's start — there's a real gap between the user's scrollY already being inside a
// trigger's [start, end] range and that flag updating. Checking scrollY directly against each
// trigger's own start/end (with a margin for the pin engaging mid-scroll, before either boundary
// is reached) has no such timing dependency. Used only to defer ScrollTrigger.refresh() itself
// (a heavier, separate operation from the height mutation below).
function isNearAnyPinnedTrigger(): boolean {
  const scrollY = window.scrollY;
  return ScrollTrigger.getAll().some((trigger) => {
    if (!trigger.pin) {
      return false;
    }
    return (
      scrollY >= trigger.start - PIN_PROXIMITY_MARGIN_PX &&
      scrollY <= trigger.end + PIN_PROXIMITY_MARGIN_PX
    );
  });
}

function hasMultiplePinnedTriggers(): boolean {
  return ScrollTrigger.getAll().filter((trigger) => trigger.pin).length > 1;
}

// Confirmed live (real browser, a page with several scroll-sections all pinning the same
// `.main-wrapper`): clearing + reapplying `.main-wrapper`'s own inline height — even to the
// *same* value, even a single px off — snaps scrollY back by thousands of pixels while
// `.main-wrapper` is actually `position: fixed` (a pin currently engaged). It's the mutation of
// the pinned element itself that does this, not which/how-many triggers exist — confirmed by
// mutating only the (separate, non-pinned) `.pin-spacer` at the exact same moment instead, which
// never causes any scroll movement at all. GSAP reads the spacer's height once, at pin creation,
// and never again, so it has no such interaction.
function isPinFixed(pageWrapper: HTMLElement): boolean {
  return getComputedStyle(pageWrapper).position === "fixed";
}

function stopFollowing(): void {
  if (followFrameId !== null) {
    cancelAnimationFrame(followFrameId);
  }
  followFrameId = null;
}

// While `.main-wrapper` is actually pin-fixed right now, mutating it directly is unsafe (see
// isPinFixed()) — grow only `.pin-spacer`, and only ever grow it, by however much
// `document.documentElement.scrollHeight` grew since the last check. That growth can come from
// real content appearing anywhere on the page (images finishing layout, a deferred grid),
// including inside a descendant clipped by an intermediate `overflow: hidden` ancestor that would
// never itself report a resize — scrollHeight reflects it regardless. Re-reads scrollHeight
// afterward (rather than assuming current + delta) so the spacer's own contribution never gets
// double-counted on the next check.
//
// This inflation is intentionally provisional: once `.main-wrapper` stops being pin-fixed (the
// last pin on the page releases), its own real content height starts counting toward the page
// again on its own — at that point followNaturalHeight()'s normal full remeasurement below
// overwrites both heights with the true current value, discarding this accumulated guess rather
// than stacking on top of it (confirmed live: skipping that reset double-counts the same revealed
// content once via this inflation and again via `.main-wrapper`'s own now-unpinned box).
function growSpacerForHiddenOverflow(pageWrapper: HTMLElement): void {
  const spacer = pageWrapper.parentElement;
  if (!spacer?.classList.contains("pin-spacer")) {
    return;
  }
  const currentDocScrollHeight = document.documentElement.scrollHeight;
  const delta = currentDocScrollHeight - lastKnownDocScrollHeight;
  if (delta > 0) {
    applyHeight(spacer, spacer.offsetHeight + delta);
  }
  lastKnownDocScrollHeight = document.documentElement.scrollHeight;
}

// While a pin is engaged, `.main-wrapper` freezes at a *constant* on-screen position for that
// trigger's entire [start, end] range (confirmed live: its getBoundingClientRect() literally
// doesn't change for thousands of px of scroll) — only the track's own internal transform pans
// horizontally. The footer, an ordinary sibling in normal flow, keeps climbing up the screen the
// whole time scrollY increases, unaffected by the pin. So the worst-case moment for overlap within
// any one pin isn't "now" — it's scrollY === trigger.end, the last instant before release, when
// the footer has climbed as far up as this pin allows and `.main-wrapper` is still frozen in
// place. Requiring the spacer's absolute document bottom to clear `trigger.end + mwBottomViewport`
// (mwBottomViewport is exactly how far the frozen `.main-wrapper` currently extends into the
// viewport) guarantees the footer never catches up before the pin releases, for every pinned
// trigger on the page — not just the last one, and not just "is there enough room to eventually
// scroll past it" (a different, weaker guarantee that still allowed mid-scroll overlap).
function ensureSpacerClearsPinnedContent(pageWrapper: HTMLElement): void {
  const spacer = pageWrapper.parentElement;
  if (!spacer?.classList.contains("pin-spacer")) {
    return;
  }
  const pinnedTriggerEnds = ScrollTrigger.getAll()
    .filter((trigger) => trigger.pin)
    .map((trigger) => trigger.end);
  if (pinnedTriggerEnds.length === 0) {
    return;
  }
  const maxEnd = Math.max(...pinnedTriggerEnds);
  const mainWrapperBottomViewport = pageWrapper.getBoundingClientRect().bottom;
  const neededSpacerBottomDocument = maxEnd + mainWrapperBottomViewport;
  const currentSpacerBottomDocument = spacer.getBoundingClientRect().bottom + window.scrollY;
  const shortfall = neededSpacerBottomDocument - currentSpacerBottomDocument;
  if (shortfall > 0) {
    applyHeight(spacer, spacer.offsetHeight + shortfall);
    lastKnownDocScrollHeight = document.documentElement.scrollHeight;
  }
}

// Runs every animation frame while content is changing size (accordion opening, load-more
// revealing, a pinned scroll-section's hidden overflow growing), settling (stopping, then doing
// one ScrollTrigger.refresh()) once the measured height stops changing for several consecutive
// frames.
function followNaturalHeight(): void {
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  if (!pageWrapper) {
    stopFollowing();
    return;
  }

  if (isPinFixed(pageWrapper)) {
    growSpacerForHiddenOverflow(pageWrapper);
    ensureSpacerClearsPinnedContent(pageWrapper);
    framesSinceChange = 0;
    lastNaturalHeight = null;
    followFrameId = requestAnimationFrame(followNaturalHeight);
    return;
  }

  const spacer = pageWrapper.parentElement;
  const isSpacer = !!spacer?.classList.contains("pin-spacer");

  // Applied unconditionally on every frame while not pin-fixed — not just when it differs from
  // the last known value — so the pinned element always carries a real pixel height rather than
  // briefly reverting to auto, which is what makes the visual result track the accordion's own
  // animation smoothly instead of only correcting once at the end.
  const naturalHeight = measureNaturalHeight(pageWrapper);
  applyHeight(pageWrapper, naturalHeight);
  if (isSpacer) {
    measureNaturalHeight(spacer as HTMLElement);
    applyHeight(spacer as HTMLElement, naturalHeight);
  }
  lastKnownDocScrollHeight = document.documentElement.scrollHeight;

  if (naturalHeight === lastNaturalHeight) {
    framesSinceChange += 1;
  } else {
    framesSinceChange = 0;
    lastNaturalHeight = naturalHeight;
  }

  if (framesSinceChange >= SETTLE_FRAMES) {
    // Unlike the height itself, ScrollTrigger.refresh() actively recalculates every trigger's
    // start/end from current scroll position — doing that while a pin is genuinely mid-scrub
    // recalculates its own geometry out from under the user and can snap them back to the
    // trigger's start (see scroll-section/CLAUDE.md's height rule). A page with several
    // scroll-sections sharing one pin target destabilizes from a refresh() call even when clear
    // of any single trigger's own range, confirmed live — refresh() itself, not just the mutation
    // above, stays off entirely there.
    if (isNearAnyPinnedTrigger() || hasMultiplePinnedTriggers()) {
      followFrameId = requestAnimationFrame(followNaturalHeight);
      return;
    }
    const scrollYBeforeRefresh = window.scrollY;
    ScrollTrigger.refresh();
    if (window.scrollY !== scrollYBeforeRefresh) {
      window.scrollTo(window.scrollX, scrollYBeforeRefresh);
    }
    // ScrollTrigger.refresh() can re-lock the pinned element back to its own stale height (it
    // reads the element's *current* value rather than truly remeasuring natural content) — force
    // the independently-measured value back if so.
    if (pageWrapper.offsetHeight !== naturalHeight) {
      applyHeight(pageWrapper, naturalHeight);
    }
    if (isSpacer && (spacer as HTMLElement).offsetHeight !== naturalHeight) {
      applyHeight(spacer as HTMLElement, naturalHeight);
    }
    stopFollowing();
    return;
  }

  followFrameId = requestAnimationFrame(followNaturalHeight);
}

function startFollowing(): void {
  if (followFrameId !== null) {
    return;
  }
  framesSinceChange = 0;
  lastNaturalHeight = null;
  followFrameId = requestAnimationFrame(followNaturalHeight);
}

let scrollCheckScheduled = false;

// A page with several stacked scroll-sections can grow content (e.g. a deferred grid revealing
// items) inside a descendant that's clipped by an intermediate `overflow: hidden` ancestor — the
// horizontal-pan track itself needs that clipping, so the growth never changes the box size of
// `.main-wrapper`'s own direct children, and a ResizeObserver on them alone would never fire
// again after its first pass. Comparing document.documentElement.scrollHeight on scroll catches
// what that observer structurally can't.
//
// Also restarts unconditionally whenever `.main-wrapper` is currently pin-fixed, regardless of
// whether scrollHeight changed: entering a pin changes neither scrollHeight nor any watched
// element's box size, so neither this check nor the ResizeObserver below would otherwise ever
// call startFollowing() while a pin first engages. Confirmed live: without this, the settle
// loop had already stopped (nothing to react to) before the user scrolled anywhere, so
// ensureScrollRoomForLastTrigger()/growSpacerForHiddenOverflow() never got a chance to run until
// something unrelated (real content finally loading) happened to restart it late in the scroll —
// the footer stayed visibly overlapping for the whole middle stretch in between.
function checkDocScrollHeight(): void {
  scrollCheckScheduled = false;
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  if (
    document.documentElement.scrollHeight !== lastKnownDocScrollHeight ||
    (pageWrapper && isPinFixed(pageWrapper))
  ) {
    startFollowing();
  }
}

function handleScroll(): void {
  if (scrollCheckScheduled) {
    return;
  }
  scrollCheckScheduled = true;
  requestAnimationFrame(checkDocScrollHeight);
}

function initScrollTriggerAutoRefresh(): void {
  const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper");
  if (!pageWrapper || !document.querySelector(".scroll-section")) {
    return;
  }

  const observer = new ResizeObserver(startFollowing);
  // .main-wrapper's own box is exactly what a pin locks to a fixed height, so once that lock is
  // stale, content growing inside it (accordion open, load-more reveal) is absorbed by
  // `overflow: visible` without ever changing .main-wrapper's — or document.body's — own
  // reported size. Observing document.body for this class of change can literally never fire,
  // confirmed live: only .main-wrapper's own *children*, which aren't themselves height-locked,
  // actually resize when their content grows.
  Array.from(pageWrapper.children).forEach((child) => observer.observe(child));
  observer.observe(document.body);

  lastKnownDocScrollHeight = document.documentElement.scrollHeight;
  window.addEventListener("scroll", handleScroll, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initScrollTriggerAutoRefresh);
} else {
  initScrollTriggerAutoRefresh();
}

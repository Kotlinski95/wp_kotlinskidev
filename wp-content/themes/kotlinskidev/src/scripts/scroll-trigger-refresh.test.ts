const mockRefreshSpy = jest.fn();
const mockTriggers: Array<{ pin: unknown; start: number; end: number }> = [];

jest.mock("gsap", () => ({
  gsap: { registerPlugin: jest.fn() },
}));

jest.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: {
    refresh: (...args: unknown[]) => mockRefreshSpy(...args),
    getAll: () => mockTriggers,
  },
}));

type ResizeCallback = () => void;
type FrameCallback = () => void;

let resizeCallback: ResizeCallback | null = null;
let resizeObserveSpy: jest.Mock;
let rafQueue: FrameCallback[] = [];
let rafSpy: jest.Mock;
let cancelRafSpy: jest.Mock;
let scrollCallback: (() => void) | null = null;
let addEventListenerSpy: jest.SpyInstance;

// Each test's loadModule() attaches a real "scroll" listener to the shared jsdom `window`, which
// nothing in the module ever removes — dispatching a real scroll event would also invoke every
// prior test's still-attached listener. Capturing the latest listener directly (same pattern as
// resizeCallback above) and invoking it in isolation avoids that cross-test contamination.
function mockAddEventListener() {
  scrollCallback = null;
  addEventListenerSpy = jest.spyOn(window, "addEventListener").mockImplementation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((type: string, listener: any) => {
      if (type === "scroll") {
        scrollCallback = listener;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
  );
}

function mockResizeObserver() {
  resizeObserveSpy = jest.fn();

  class MockResizeObserver {
    constructor(cb: ResizeCallback) {
      resizeCallback = cb;
    }
    observe = resizeObserveSpy;
    disconnect = jest.fn();
  }

  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = MockResizeObserver;
}

function mockRaf() {
  rafQueue = [];
  let idCounter = 0;
  rafSpy = jest.fn((cb: FrameCallback) => {
    rafQueue.push(cb);
    return ++idCounter;
  });
  cancelRafSpy = jest.fn();
  window.requestAnimationFrame = rafSpy as unknown as typeof window.requestAnimationFrame;
  window.cancelAnimationFrame = cancelRafSpy as unknown as typeof window.cancelAnimationFrame;
}

function tick(): void {
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((cb) => cb());
}

function tickTimes(count: number): void {
  for (let i = 0; i < count; i += 1) {
    tick();
  }
}

function setScrollY(y: number): void {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: y,
  });
}

// jsdom never lays anything out, so offsetHeight is always 0 by default. This mimics a real
// browser box for the specific case scroll-trigger-refresh.ts cares about: an element whose
// height is explicitly pinned (style.height set) reports that fixed value; once cleared, it
// reports whatever its true natural content size currently is (a mutable getter, so a test can
// simulate content growing across frames, like an accordion's own open animation).
function mockNaturalHeight(el: HTMLElement, getNatural: () => number): void {
  Object.defineProperty(el, "offsetHeight", {
    configurable: true,
    get() {
      const h = el.style.height;
      return h ? parseFloat(h) : getNatural();
    },
  });
}

function loadModule() {
  jest.resetModules();
  mockRefreshSpy.mockClear();
  mockRefreshSpy.mockImplementation(() => undefined);
  mockTriggers.length = 0;
  resizeCallback = null;
  jest.isolateModules(() => {
    require("./scroll-trigger-refresh");
  });
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("scroll-trigger-refresh.ts", () => {
  const originalScrollYDescriptor = Object.getOwnPropertyDescriptor(window, "scrollY");
  const originalDocScrollHeightDescriptor = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "scrollHeight"
  );
  const originalInnerHeightDescriptor = Object.getOwnPropertyDescriptor(window, "innerHeight");

  beforeEach(() => {
    mockResizeObserver();
    mockRaf();
    mockAddEventListener();
  });

  afterEach(() => {
    if (originalScrollYDescriptor) {
      Object.defineProperty(window, "scrollY", originalScrollYDescriptor);
    }
    if (originalDocScrollHeightDescriptor) {
      Object.defineProperty(
        document.documentElement,
        "scrollHeight",
        originalDocScrollHeightDescriptor
      );
    }
    if (originalInnerHeightDescriptor) {
      Object.defineProperty(window, "innerHeight", originalInnerHeightDescriptor);
    }
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
    addEventListenerSpy.mockRestore();
  });

  it("does nothing when there is no .scroll-section on the page", () => {
    document.body.innerHTML = '<div class="main-wrapper"></div>';

    loadModule();

    expect(resizeObserveSpy).not.toHaveBeenCalled();
  });

  it("does nothing when there is no .main-wrapper on the page", () => {
    document.body.innerHTML = '<div class="scroll-section"></div>';

    loadModule();

    expect(resizeObserveSpy).not.toHaveBeenCalled();
  });

  it("observes document.body and each of .main-wrapper's direct children for size changes", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="main-wrapper">
        <div class="section-one"></div>
        <div class="section-two"></div>
      </div>
    `;

    loadModule();

    const observedTargets = resizeObserveSpy.mock.calls.map((call) => call[0]);
    expect(observedTargets).toContain(document.body);
    expect(observedTargets).toContain(document.querySelector(".section-one"));
    expect(observedTargets).toContain(document.querySelector(".section-two"));
  });

  it("starts following on the very next frame when an observed element resizes, with no fixed debounce delay", () => {
    document.body.innerHTML = '<div class="scroll-section"></div><div class="main-wrapper"></div>';
    loadModule();

    resizeCallback?.();

    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("tracks a growing natural height frame-by-frame, applying each intermediate value instead of waiting to snap once at the end", () => {
    // The accordion's own open animation eases smoothly over several frames — mirroring its
    // measured height on every frame (rather than debouncing then jumping to the final value in
    // one step) is what makes the pin-spacer/footer keep pace with it visually.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const spacer = document.querySelector<HTMLElement>(".pin-spacer")!;
    let currentNatural = 500;
    mockNaturalHeight(pageWrapper, () => currentNatural);
    mockNaturalHeight(spacer, () => currentNatural);

    loadModule();
    resizeCallback?.();

    currentNatural = 550;
    tick();
    expect(pageWrapper.style.height).toBe("550px");

    currentNatural = 620;
    tick();
    expect(pageWrapper.style.height).toBe("620px");

    currentNatural = 700;
    tick();
    expect(pageWrapper.style.height).toBe("700px");
    expect(spacer.style.height).toBe("700px");
    expect(mockRefreshSpy).not.toHaveBeenCalled();
  });

  it("settles (stops polling and calls ScrollTrigger.refresh() once) after the natural height stops changing for several consecutive frames", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 700);

    loadModule();
    resizeCallback?.();

    tick();
    expect(mockRefreshSpy).not.toHaveBeenCalled();

    tickTimes(6);
    expect(mockRefreshSpy).toHaveBeenCalledTimes(1);

    rafSpy.mockClear();
    tick();
    expect(rafSpy).not.toHaveBeenCalled();
  });

  it("force-applies the true natural height when ScrollTrigger.refresh() re-locks the old stale value on itself", () => {
    // GSAP locks the pinned element's height inline once, and ScrollTrigger.refresh() re-measures
    // by reading that element's *own current* height — if it's still set, refresh() just confirms
    // the same stale number back to itself.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const spacer = document.querySelector<HTMLElement>(".pin-spacer")!;
    mockNaturalHeight(pageWrapper, () => 700);
    mockNaturalHeight(spacer, () => 700);

    loadModule();
    mockRefreshSpy.mockImplementation(() => {
      pageWrapper.style.height = "500px";
      spacer.style.height = "500px";
    });
    resizeCallback?.();
    tickTimes(7);

    expect(pageWrapper.style.height).toBe("700px");
    expect(pageWrapper.style.maxHeight).toBe("700px");
    expect(spacer.style.height).toBe("700px");
    expect(mockRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it("only touches .main-wrapper, not a wrapping non-spacer element, when there is no pin-spacer parent yet", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="main-wrapper" style="height: 500px;"></div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 500);

    loadModule();
    resizeCallback?.();
    tickTimes(7);

    expect(pageWrapper.style.height).toBe("500px");
    expect(mockRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it("keeps tracking height but defers refresh while scrollY is inside a single pinned trigger's range, so scroll position isn't reset out from under the user", () => {
    // A lone scroll-section has no other pin sharing `.main-wrapper` to interact with, so tracking
    // height frame-by-frame here stays safe (that's what makes the FAQ-accordion case above
    // smooth) — only calling ScrollTrigger.refresh() mid-scrub is unsafe, and stays deferred.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const spacer = document.querySelector<HTMLElement>(".pin-spacer")!;
    mockNaturalHeight(pageWrapper, () => 700);
    mockNaturalHeight(spacer, () => 700);

    loadModule();
    mockTriggers.push({ pin: {}, start: 900, end: 1400 });
    setScrollY(1100);

    resizeCallback?.();
    tickTimes(10);

    expect(pageWrapper.style.height).toBe("700px");
    expect(spacer.style.height).toBe("700px");
    expect(mockRefreshSpy).not.toHaveBeenCalled();
    // Still polling, waiting for the user to scroll clear.
    expect(rafSpy).toHaveBeenCalled();
  });

  it("defers refresh while scrollY is merely near a single pinned trigger's start, even before GSAP's own isActive flag would flip true", () => {
    // Regression: `trigger.isActive` lags the real crossing into a pin's start by a frame or
    // more. Polling landing in that gap — scrollY already inside the trigger's proximity margin,
    // `isActive` not yet true — must still defer refresh(), or GSAP's pin engagement gets
    // disrupted right as the user enters it.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 700);

    loadModule();
    mockTriggers.push({ pin: {}, start: 900, end: 1400 });
    setScrollY(750);

    resizeCallback?.();
    tickTimes(10);

    expect(pageWrapper.style.height).toBe("700px");
    expect(mockRefreshSpy).not.toHaveBeenCalled();
  });

  it("never touches .main-wrapper's own height while it is currently pin-fixed, only grows .pin-spacer by scrollHeight's own growth", () => {
    // Regression: on a page with several stacked scroll-sections all pinning `.main-wrapper`,
    // clearing + reapplying `.main-wrapper`'s own inline height while it's actually
    // `position: fixed` (a pin currently engaged) destabilizes GSAP's own pin bookkeeping and
    // snaps scroll back — confirmed live via a real multi-section page, reproduced by mutating
    // only `.main-wrapper` and watching the reset happen, then mutating only `.pin-spacer` at the
    // same moment and seeing no scroll movement at all. `getComputedStyle(...).position` reflects
    // GSAP's real, current pin state directly, unlike inferring it from trigger count.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="position: fixed; height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const spacer = document.querySelector<HTMLElement>(".pin-spacer")!;
    mockNaturalHeight(spacer, () => 0);
    let currentDocScrollHeight = 1000;
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => currentDocScrollHeight,
    });

    loadModule();
    currentDocScrollHeight = 1300;
    resizeCallback?.();
    tickTimes(10);

    expect(pageWrapper.style.height).toBe("500px");
    expect(spacer.style.height).toBe("800px");
    expect(mockRefreshSpy).not.toHaveBeenCalled();
    expect(rafSpy).toHaveBeenCalled();
  });

  it("tops up .pin-spacer so its document bottom clears the last pinned trigger's end plus .main-wrapper's own frozen on-screen extent", () => {
    // While a pin is engaged, .main-wrapper freezes at a *constant* on-screen position for that
    // trigger's whole [start, end] range — only the track's own internal transform pans
    // horizontally (confirmed live). The footer, an ordinary sibling in normal flow, keeps
    // climbing up the screen the whole time scrollY increases, unaffected by the pin. The worst
    // moment for overlap is scrollY === trigger.end, the last instant before release — this
    // guarantees the spacer's document bottom stays far enough down that the footer can't have
    // caught up to the frozen `.main-wrapper` by then.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="position: fixed; height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const spacer = document.querySelector<HTMLElement>(".pin-spacer")!;
    mockNaturalHeight(spacer, () => 0);
    // .main-wrapper is frozen on-screen at bottom: 700 for this pin's whole active range.
    pageWrapper.getBoundingClientRect = () => ({ bottom: 700 }) as DOMRect;
    // .pin-spacer starts at document position 0, so its viewport-relative bottom is exactly its
    // own document height minus however far the page has scrolled — the same relationship a real
    // browser gives for free, mocked explicitly here since jsdom never lays anything out.
    spacer.getBoundingClientRect = () =>
      ({ bottom: spacer.offsetHeight - window.scrollY }) as DOMRect;
    setScrollY(500);

    loadModule();
    mockTriggers.push({ pin: {}, start: 200, end: 1000 });
    resizeCallback?.();
    tickTimes(10);

    // needed spacer document-bottom = trigger.end (1000) + frozen main-wrapper bottom (700) = 1700.
    expect(spacer.style.height).toBe("1700px");
  });

  it("overwrites the provisional spacer inflation with a true remeasurement once .main-wrapper stops being pin-fixed, rather than stacking on top of it", () => {
    // Confirmed live: skipping this reset double-counts the same revealed content once via the
    // provisional inflation above and again via `.main-wrapper`'s own now-unpinned real height.
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="position: fixed; height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    const spacer = document.querySelector<HTMLElement>(".pin-spacer")!;
    let currentDocScrollHeight = 1000;
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => currentDocScrollHeight,
    });
    mockNaturalHeight(pageWrapper, () => 900);
    mockNaturalHeight(spacer, () => 900);

    loadModule();
    currentDocScrollHeight = 1300;
    resizeCallback?.();
    tick();
    expect(spacer.style.height).toBe("800px");

    pageWrapper.style.position = "static";
    tickTimes(10);

    expect(pageWrapper.style.height).toBe("900px");
    expect(spacer.style.height).toBe("900px");
  });

  it("resumes reconciling once scrollY moves well clear of every pinned trigger's range, without needing a further resize event", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 700);

    loadModule();
    mockTriggers.push({ pin: {}, start: 900, end: 1400 });
    setScrollY(1100);

    resizeCallback?.();
    tickTimes(3);
    expect(mockRefreshSpy).not.toHaveBeenCalled();

    setScrollY(2000);
    tickTimes(7);

    expect(pageWrapper.style.height).toBe("700px");
    expect(mockRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it("ignores a non-pinned trigger's range entirely, since only a pin can strand scroll position", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 700);

    loadModule();
    mockTriggers.push({ pin: null, start: 900, end: 1400 });
    setScrollY(1100);

    resizeCallback?.();
    tickTimes(7);

    expect(pageWrapper.style.height).toBe("700px");
    expect(mockRefreshSpy).toHaveBeenCalledTimes(1);
  });

  it("does not start a second follow loop while one is already running", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="main-wrapper" style="height: 500px;"></div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 500);

    loadModule();
    resizeCallback?.();
    resizeCallback?.();
    resizeCallback?.();

    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("starts following on scroll when document.documentElement.scrollHeight has grown since the last check, even with no resize event", () => {
    // On a multi-scroll-section page, real content growth (e.g. a Load More grid appending items)
    // can happen inside a descendant clipped by an intermediate overflow:hidden ancestor — the
    // horizontal-pan track needs that clipping, so .main-wrapper's own direct children never
    // resize and the ResizeObserver above never fires again. scrollHeight reflects the growth
    // regardless of which descendant it happened in.
    document.body.innerHTML = '<div class="scroll-section"></div><div class="main-wrapper"></div>';
    let currentDocScrollHeight = 1000;
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => currentDocScrollHeight,
    });

    loadModule();
    rafSpy.mockClear();

    currentDocScrollHeight = 1500;
    scrollCallback?.();
    // First tick runs the scroll handler's own rAF-throttled check; that check, seeing the grown
    // scrollHeight, calls startFollowing() — which schedules a second, separate rAF for the
    // follow loop itself.
    tick();

    expect(rafSpy).toHaveBeenCalledTimes(2);
  });

  it("does not start following on scroll when document.documentElement.scrollHeight is unchanged", () => {
    document.body.innerHTML = '<div class="scroll-section"></div><div class="main-wrapper"></div>';
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => 1000,
    });

    loadModule();
    rafSpy.mockClear();

    scrollCallback?.();
    tick();

    // Only the scroll handler's own rAF-throttled check runs — scrollHeight hasn't changed, so
    // it never calls startFollowing() to schedule a second one for the follow loop.
    expect(rafSpy).toHaveBeenCalledTimes(1);
  });

  it("starts following on scroll while .main-wrapper is pin-fixed, even with no scrollHeight change and no resize event", () => {
    // Regression: entering a pin changes neither scrollHeight nor any watched element's box size,
    // so without this, the settle loop (already stopped from its initial pass at page load, before
    // the user had scrolled anywhere) never restarted once a pin actually engaged — the spacer
    // correction it drives never got a chance to run until something unrelated happened to
    // restart it much later, leaving the footer visibly overlapping for the whole stretch in
    // between (confirmed live).
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="main-wrapper" style="position: fixed;"></div>
    `;
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => 1000,
    });

    loadModule();
    rafSpy.mockClear();

    scrollCallback?.();
    tick();

    // The scroll handler's own rAF-throttled check runs, sees .main-wrapper is pin-fixed
    // regardless of scrollHeight, and calls startFollowing() — scheduling a second rAF for the
    // follow loop itself.
    expect(rafSpy).toHaveBeenCalledTimes(2);
  });

  it("restores scroll position if reconciling the pin height causes the browser to clamp scroll at settle time", () => {
    document.body.innerHTML = `
      <div class="scroll-section"></div>
      <div class="pin-spacer" style="height: 500px; max-height: 500px;">
        <div class="main-wrapper" style="height: 500px; max-height: 500px;"></div>
      </div>
    `;
    const pageWrapper = document.querySelector<HTMLElement>(".main-wrapper")!;
    mockNaturalHeight(pageWrapper, () => 500);

    let currentScrollY = 500;
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => currentScrollY,
    });
    const scrollToSpy = jest
      .spyOn(window, "scrollTo")
      .mockImplementation((x: unknown, y: unknown) => {
        currentScrollY = y as number;
      });

    loadModule();
    mockRefreshSpy.mockImplementation(() => {
      currentScrollY = 0;
    });
    resizeCallback?.();
    tickTimes(7);

    expect(mockRefreshSpy).toHaveBeenCalledTimes(1);
    expect(scrollToSpy).toHaveBeenCalledWith(0, 500);
    expect(currentScrollY).toBe(500);
  });
});

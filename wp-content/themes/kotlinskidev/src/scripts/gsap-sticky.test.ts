const tickerCallbacks: Array<() => void> = [];

jest.mock("gsap", () => ({
  gsap: {
    registerPlugin: jest.fn(),
    ticker: {
      add: jest.fn((cb: () => void) => tickerCallbacks.push(cb)),
    },
  },
}));

jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: {} }));

type ResizeCallback = () => void;

let resizeCallback: ResizeCallback | null = null;
let resizeObserveSpy: jest.Mock;

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

function mockRect(el: HTMLElement, rect: Partial<DOMRect>): void {
  jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    ...rect,
  } as DOMRect);
}

function buildStickyColumnMarkup() {
  document.body.innerHTML = `
    <div class="main-wrapper">
      <div class="scroll-section"></div>
      <div class="wp-block-columns">
        <div class="sticky-parent">
          <div class="is-kotlinskidev-sticky" style="top: 20px;"></div>
        </div>
      </div>
    </div>
  `;
  const el = document.querySelector(".is-kotlinskidev-sticky") as HTMLElement;
  Object.defineProperty(el, "offsetHeight", { configurable: true, value: 150 });
  Object.defineProperty(el, "offsetWidth", { configurable: true, value: 400 });
  const stickyParent = document.querySelector(".sticky-parent") as HTMLElement;
  Object.defineProperty(stickyParent, "offsetHeight", { configurable: true, value: 150 });
  return el;
}

function loadModule() {
  jest.resetModules();
  tickerCallbacks.length = 0;
  resizeCallback = null;
  jest.isolateModules(() => {
    require("./gsap-sticky");
  });
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function tick() {
  tickerCallbacks.forEach((cb) => cb());
}

describe("gsap-sticky.ts", () => {
  beforeEach(() => {
    mockResizeObserver();
    jest
      .spyOn(window, "getComputedStyle")
      .mockImplementation(
        (el: Element) => ({ top: (el as HTMLElement).style.top || "0px" }) as CSSStyleDeclaration
      );
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });

  it("does nothing when there is no .main-wrapper", () => {
    document.body.innerHTML = '<div class="scroll-section"></div>';

    expect(() => loadModule()).not.toThrow();
    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does nothing when there is no .scroll-section", () => {
    document.body.innerHTML = '<div class="main-wrapper"></div>';

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("does not portal a sticky element outside of wp-block-columns", () => {
    document.body.innerHTML = `
      <div class="main-wrapper">
        <div class="scroll-section"></div>
        <div class="is-kotlinskidev-sticky"></div>
      </div>
    `;

    loadModule();

    expect(tickerCallbacks).toHaveLength(0);
  });

  it("moves the sticky element into a body-level portal host and applies native sticky styles", () => {
    const el = buildStickyColumnMarkup();

    loadModule();

    expect(el.style.position).toBe("sticky");
    expect(el.style.top).toBe("20px");
    expect(el.style.pointerEvents).toBe("all");
    expect(el.parentElement?.parentElement).toBe(document.body);
  });

  it("inserts a placeholder in the original position matching the element's height, falling back to a pixel width when no flex-basis is set", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;

    loadModule();

    const placeholder = stickyParent.firstElementChild as HTMLElement;
    expect(placeholder.style.height).toBe("150px");
    expect(placeholder.style.width).toBe("400px");
    expect(placeholder.style.visibility).toBe("hidden");
  });

  it("copies the element's inline flex-basis onto the placeholder, so a percentage column width stays responsive without JS resize syncing", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    el.style.flexBasis = "33.33%";

    loadModule();

    const placeholder = stickyParent.firstElementChild as HTMLElement;
    expect(placeholder.style.flexBasis).toBe("33.33%");
    expect(placeholder.style.width).toBe("33.33%");
  });

  it("shows and syncs the portal host on the next tick once the placeholder is within the viewport", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    mockRect(placeholder, { top: 100, bottom: 250, left: 10, width: 400 });
    tick();

    expect(host.style.visibility).toBe("visible");
    expect(host.style.top).toBe("100px");
  });

  it("hides the portal host on the next tick once the placeholder leaves the viewport, even without a transform change", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    mockRect(placeholder, { top: 100, bottom: 250 });
    tick();
    expect(host.style.visibility).toBe("visible");

    mockRect(placeholder, { top: -900, bottom: -800 });
    tick();

    expect(host.style.visibility).toBe("hidden");
  });

  it("keeps the host visible once the placeholder's own short height has scrolled past, as long as the stretched row (a tall sibling column, e.g. open FAQ accordions) is still on screen", () => {
    // Regression: `.wp-block-columns` stretches every column to the tallest sibling's height by
    // default. The placeholder only ever matches the *sticky element's* short natural height
    // (e.g. a "FAQ" heading + CTA), never the row's real rendered extent — checking the
    // placeholder's own rect hid the sticky column ~680px too early in practice, while the
    // actually-visible stretched row (and its still-visible sibling column) was still on screen.
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    // The row stretched tall (e.g. a sibling accordion column with 828px of open content), far
    // taller than the placeholder's own short natural height.
    Object.defineProperty(stickyParent, "offsetHeight", { configurable: true, value: 828 });
    // The placeholder's own top has scrolled well past the viewport top edge, but the row's real
    // bottom (top + 828) is still positive — the section is still visible.
    mockRect(placeholder, { top: -600 });
    tick();

    expect(host.style.visibility).toBe("visible");
  });

  it("hides the host once the row's own real extent (not just the placeholder's short height) has scrolled fully past the viewport", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    Object.defineProperty(stickyParent, "offsetHeight", { configurable: true, value: 828 });
    mockRect(placeholder, { top: -900 });
    tick();

    expect(host.style.visibility).toBe("hidden");
  });

  it("re-checks visibility every tick, so a page-height change from an unrelated component (accordion, load-more) can't leave the host stuck visible", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    mockRect(placeholder, { top: 100, bottom: 250 });
    tick();
    mockRect(placeholder, { top: 5000, bottom: 5150 });
    tick();
    tick();
    tick();

    expect(host.style.visibility).toBe("hidden");
  });

  it("updates the placeholder height on parent resize", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;

    Object.defineProperty(el, "offsetHeight", { configurable: true, value: 300 });
    resizeCallback?.();

    expect(placeholder.style.height).toBe("300px");
  });

  it("leaves the placeholder's width untouched on parent resize, avoiding a feedback loop that freezes a transient bad measurement", () => {
    const el = buildStickyColumnMarkup();
    el.style.flexBasis = "33.33%";
    const stickyParent = el.parentElement as HTMLElement;
    loadModule();
    const placeholder = stickyParent.firstElementChild as HTMLElement;

    Object.defineProperty(stickyParent, "clientWidth", { configurable: true, value: 999 });
    resizeCallback?.();

    expect(placeholder.style.width).toBe("33.33%");
  });
});

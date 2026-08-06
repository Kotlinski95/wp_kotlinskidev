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

type IntersectionCallback = (entries: Array<{ isIntersecting: boolean }>) => void;
type ResizeCallback = () => void;

let intersectionCallback: IntersectionCallback | null = null;
let intersectionObserveSpy: jest.Mock;
let resizeCallback: ResizeCallback | null = null;
let resizeObserveSpy: jest.Mock;

function mockObservers() {
  intersectionObserveSpy = jest.fn();
  resizeObserveSpy = jest.fn();

  class MockIntersectionObserver {
    constructor(cb: IntersectionCallback) {
      intersectionCallback = cb;
    }
    observe = intersectionObserveSpy;
    disconnect = jest.fn();
  }

  class MockResizeObserver {
    constructor(cb: ResizeCallback) {
      resizeCallback = cb;
    }
    observe = resizeObserveSpy;
    disconnect = jest.fn();
  }

  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    MockIntersectionObserver;
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = MockResizeObserver;
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
  return el;
}

function loadModule() {
  jest.resetModules();
  tickerCallbacks.length = 0;
  intersectionCallback = null;
  resizeCallback = null;
  jest.isolateModules(() => {
    require("./gsap-sticky");
  });
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

describe("gsap-sticky.ts", () => {
  beforeEach(() => {
    mockObservers();
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
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
    delete (window as unknown as { ResizeObserver?: unknown }).ResizeObserver;
  });

  it("does nothing when there is no .main-wrapper", () => {
    document.body.innerHTML = '<div class="scroll-section"></div>';

    expect(() => loadModule()).not.toThrow();
    expect(intersectionObserveSpy).not.toHaveBeenCalled();
  });

  it("does nothing when there is no .scroll-section", () => {
    document.body.innerHTML = '<div class="main-wrapper"></div>';

    loadModule();

    expect(intersectionObserveSpy).not.toHaveBeenCalled();
  });

  it("does not portal a sticky element outside of wp-block-columns", () => {
    document.body.innerHTML = `
      <div class="main-wrapper">
        <div class="scroll-section"></div>
        <div class="is-kotlinskidev-sticky"></div>
      </div>
    `;

    loadModule();

    expect(intersectionObserveSpy).not.toHaveBeenCalled();
  });

  it("moves the sticky element into a body-level portal host and applies native sticky styles", () => {
    const el = buildStickyColumnMarkup();

    loadModule();

    expect(el.style.position).toBe("sticky");
    expect(el.style.top).toBe("20px");
    expect(el.style.pointerEvents).toBe("all");
    expect(el.parentElement?.parentElement).toBe(document.body);
  });

  it("inserts a placeholder in the original position matching the element's height", () => {
    const el = buildStickyColumnMarkup();
    const stickyParent = el.parentElement as HTMLElement;

    loadModule();

    const placeholder = stickyParent.firstElementChild as HTMLElement;
    expect(placeholder.style.height).toBe("150px");
    expect(placeholder.style.visibility).toBe("hidden");
  });

  it("shows and syncs the portal host once the placeholder intersects", () => {
    buildStickyColumnMarkup();
    loadModule();
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    intersectionCallback?.([{ isIntersecting: true }]);

    expect(host.style.visibility).toBe("visible");
  });

  it("hides the portal host when the placeholder leaves the viewport", () => {
    buildStickyColumnMarkup();
    loadModule();
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    intersectionCallback?.([{ isIntersecting: true }]);
    intersectionCallback?.([{ isIntersecting: false }]);

    expect(host.style.visibility).toBe("hidden");
  });

  it("re-syncs the host position when the page wrapper transform changes, only while visible", () => {
    buildStickyColumnMarkup();
    loadModule();
    const pageWrapper = document.querySelector(".main-wrapper") as HTMLElement;
    const host = document.querySelector(".is-kotlinskidev-sticky")?.parentElement as HTMLElement;

    pageWrapper.style.transform = "translateY(10px)";
    tickerCallbacks.forEach((cb) => cb());

    expect(host.style.top).toBe("0px");
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
});

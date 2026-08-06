function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

function setScrollTop(value: number) {
  Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value });
}

function flushRaf() {
  jest.runOnlyPendingTimers();
}

function loadWithHeader() {
  document.body.innerHTML = "<header></header>";
  jest.resetModules();
  require("./sticky-header");
  document.dispatchEvent(new Event("DOMContentLoaded"));
  flushRaf();
  return document.querySelector("header") as HTMLElement;
}

describe("sticky-header.ts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      return window.setTimeout(() => cb(0), 0) as unknown as number;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      window.clearTimeout(id);
    });
    setInnerWidth(1200);
    setScrollTop(0);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    setInnerWidth(1024);
  });

  it("does nothing when there is no header element", () => {
    document.body.innerHTML = "";
    jest.resetModules();

    expect(() => {
      require("./sticky-header");
      document.dispatchEvent(new Event("DOMContentLoaded"));
    }).not.toThrow();
  });

  it("adds header-sticky once scrolled past the threshold on desktop", () => {
    const header = loadWithHeader();
    setScrollTop(50);

    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(true);
  });

  it("does not add header-sticky at or below the threshold", () => {
    const header = loadWithHeader();
    setScrollTop(10);

    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(false);
  });

  it("ignores rapid repeated scroll events while a frame is already pending", () => {
    const header = loadWithHeader();
    setScrollTop(50);

    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(true);
  });

  it("removes header-sticky once the viewport switches to mobile", () => {
    const header = loadWithHeader();
    setScrollTop(50);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();
    expect(header.classList.contains("header-sticky")).toBe(true);

    setInnerWidth(500);
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(150);

    expect(header.classList.contains("header-sticky")).toBe(false);
  });

  it("does not enable sticky behavior at all when starting on mobile", () => {
    setInnerWidth(500);
    const header = loadWithHeader();
    setScrollTop(50);

    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(false);
  });

  it("re-enables sticky behavior when switching back to desktop", () => {
    setInnerWidth(500);
    const header = loadWithHeader();

    setInnerWidth(1200);
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(150);
    flushRaf();
    setScrollTop(50);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(true);
  });
});

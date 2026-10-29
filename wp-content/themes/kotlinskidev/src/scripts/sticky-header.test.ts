function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

function setScrollTop(value: number) {
  Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value });
}

function flushRaf() {
  jest.runOnlyPendingTimers();
}

function setOffsetHeight(el: HTMLElement, value: number) {
  Object.defineProperty(el, "offsetHeight", { configurable: true, value });
}

function loadWithHeader() {
  document.body.innerHTML = "<header></header>";
  const header = document.querySelector("header") as HTMLElement;
  setOffsetHeight(header, 75);
  jest.resetModules();
  require("./sticky-header");
  document.dispatchEvent(new Event("DOMContentLoaded"));
  flushRaf();
  return header;
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
    setScrollTop(100);

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

  it("uses the header's own measured height as the threshold, not a hardcoded value", () => {
    document.body.innerHTML = "<header></header>";
    const header = document.querySelector("header") as HTMLElement;
    setOffsetHeight(header, 120);
    jest.resetModules();
    require("./sticky-header");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    flushRaf();

    setScrollTop(35);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();
    expect(header.classList.contains("header-sticky")).toBe(false);

    setScrollTop(150);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();
    expect(header.classList.contains("header-sticky")).toBe(true);
  });

  it("ignores rapid repeated scroll events while a frame is already pending", () => {
    const header = loadWithHeader();
    setScrollTop(100);

    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(true);
  });

  it("also adds header-sticky past the threshold on a mobile viewport", () => {
    setInnerWidth(500);
    const header = loadWithHeader();
    setScrollTop(100);

    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(true);
  });

  it("stays position-based across a resize, regardless of direction or breakpoint", () => {
    setInnerWidth(500);
    const header = loadWithHeader();
    setScrollTop(100);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();
    expect(header.classList.contains("header-sticky")).toBe(true);

    setInnerWidth(1200);
    window.dispatchEvent(new Event("resize"));
    setScrollTop(10);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();

    expect(header.classList.contains("header-sticky")).toBe(false);
  });

  it("hides the breadcrumbs past the threshold on a mobile viewport too", () => {
    setInnerWidth(500);
    document.body.innerHTML = '<header></header><nav class="kt-breadcrumbs"></nav>';
    setOffsetHeight(document.querySelector("header") as HTMLElement, 75);
    jest.resetModules();
    require("./sticky-header");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    flushRaf();
    const breadcrumbs = document.querySelector(".kt-breadcrumbs") as HTMLElement;

    setScrollTop(100);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();
    expect(breadcrumbs.classList.contains("kt-breadcrumbs--hidden")).toBe(true);

    setScrollTop(10);
    window.dispatchEvent(new Event("scroll"));
    flushRaf();
    expect(breadcrumbs.classList.contains("kt-breadcrumbs--hidden")).toBe(false);
  });
});

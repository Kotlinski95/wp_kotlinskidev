function buildTargets() {
  document.body.innerHTML = "";
  const el = document.createElement("div");
  el.className = "fade-in-on-scroll";
  document.body.append(el);
  return el;
}

describe("scroll-animations.ts — with IntersectionObserver", () => {
  let observeSpy: jest.Mock;
  let unobserveSpy: jest.Mock;
  let capturedCallback: IntersectionObserverCallback | null = null;

  beforeEach(() => {
    jest.resetModules();
    observeSpy = jest.fn();
    unobserveSpy = jest.fn();
    capturedCallback = null;

    class MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        capturedCallback = callback;
      }
      observe = observeSpy;
      unobserve = unobserveSpy;
      disconnect = jest.fn();
    }

    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  afterEach(() => {
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  });

  it("observes every matching element", () => {
    const el = buildTargets();

    require("./scroll-animations");

    expect(observeSpy).toHaveBeenCalledWith(el);
  });

  it("adds the visible class and stops observing once an element intersects", () => {
    const el = buildTargets();
    require("./scroll-animations");

    capturedCallback?.([{ isIntersecting: true, target: el } as IntersectionObserverEntry], {
      unobserve: unobserveSpy,
    } as unknown as IntersectionObserver);

    expect(el.classList.contains("visible")).toBe(true);
    expect(unobserveSpy).toHaveBeenCalledWith(el);
  });

  it("leaves non-intersecting elements untouched", () => {
    const el = buildTargets();
    require("./scroll-animations");

    capturedCallback?.([{ isIntersecting: false, target: el } as IntersectionObserverEntry], {
      unobserve: unobserveSpy,
    } as unknown as IntersectionObserver);

    expect(el.classList.contains("visible")).toBe(false);
    expect(unobserveSpy).not.toHaveBeenCalled();
  });
});

describe("scroll-animations.ts — fallback without IntersectionObserver", () => {
  beforeEach(() => {
    jest.resetModules();
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  });

  it("adds the visible class to elements already within the viewport on scroll", () => {
    const el = buildTargets();
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });

    require("./scroll-animations");
    window.dispatchEvent(new Event("scroll"));

    expect(el.classList.contains("visible")).toBe(true);
  });

  it("does not add the visible class to elements far below the viewport", () => {
    const el = buildTargets();
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 5000,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });

    require("./scroll-animations");
    window.dispatchEvent(new Event("scroll"));

    expect(el.classList.contains("visible")).toBe(false);
  });

  it("also reveals elements on DOMContentLoaded and resize", () => {
    const el = buildTargets();
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });

    require("./scroll-animations");
    window.dispatchEvent(new Event("resize"));

    expect(el.classList.contains("visible")).toBe(true);
  });
});

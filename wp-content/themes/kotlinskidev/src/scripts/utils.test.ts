import {
  debounce,
  getBreakpoints,
  getScrollOffsets,
  isMobile,
  onScreenSizeChange,
  initMobileOnly,
  getScrollTop,
  scrollTo,
  rafThrottle,
  onScroll,
  setScrollBehavior,
} from "./utils";

function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

describe("debounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("calls the function once after the wait period", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on repeated calls within the wait window", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    jest.advanceTimersByTime(50);
    debounced();
    jest.advanceTimersByTime(50);

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("forwards arguments to the debounced function", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("a", 1);
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("a", 1);
  });
});

describe("getBreakpoints / getScrollOffsets", () => {
  afterEach(() => {
    delete (window as unknown as { kotlinskiTheme?: unknown }).kotlinskiTheme;
  });

  it("returns default breakpoints when no theme config is present on window", () => {
    expect(getBreakpoints()).toEqual({
      mobile_max: 781,
      tablet_min: 782,
      tablet_max: 1023,
      desktop_min: 1024,
      large: 1200,
    });
  });

  it("returns theme-provided breakpoints when present on window", () => {
    (window as unknown as { kotlinskiTheme?: unknown }).kotlinskiTheme = {
      breakpoints: {
        mobile_max: 600,
        tablet_min: 601,
        tablet_max: 900,
        desktop_min: 901,
        large: 1400,
      },
    };

    expect(getBreakpoints().desktop_min).toBe(901);
  });

  it("returns default scroll offsets when no theme config is present", () => {
    expect(getScrollOffsets()).toEqual({ desktop: 75, mobile: 0 });
  });

  it("returns theme-provided scroll offsets when present", () => {
    (window as unknown as { kotlinskiTheme?: unknown }).kotlinskiTheme = {
      scrollOffsets: { desktop: 100, mobile: 20 },
    };

    expect(getScrollOffsets()).toEqual({ desktop: 100, mobile: 20 });
  });
});

describe("isMobile", () => {
  afterEach(() => {
    setInnerWidth(1024);
  });

  it("returns true below the desktop breakpoint", () => {
    setInnerWidth(500);
    expect(isMobile()).toBe(true);
  });

  it("returns false at or above the desktop breakpoint", () => {
    setInnerWidth(1200);
    expect(isMobile()).toBe(false);
  });
});

describe("onScreenSizeChange", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    setInnerWidth(1024);
  });

  it("calls the callback with the current mobile state after a debounced resize", () => {
    setInnerWidth(500);
    const callback = jest.fn();
    onScreenSizeChange(callback, 100);

    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(100);

    expect(callback).toHaveBeenCalledWith(true);
  });

  it("stops listening once the cleanup function is called", () => {
    const callback = jest.fn();
    const cleanup = onScreenSizeChange(callback, 100);

    cleanup();
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(100);

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("initMobileOnly", () => {
  afterEach(() => {
    setInnerWidth(1024);
  });

  it("calls onMobile immediately when starting on a mobile viewport", () => {
    setInnerWidth(500);
    const onMobile = jest.fn();
    const onDesktop = jest.fn();

    initMobileOnly(onMobile, onDesktop);

    expect(onMobile).toHaveBeenCalledTimes(1);
    expect(onDesktop).not.toHaveBeenCalled();
  });

  it("calls onDesktop immediately when starting on a desktop viewport", () => {
    setInnerWidth(1200);
    const onMobile = jest.fn();
    const onDesktop = jest.fn();

    initMobileOnly(onMobile, onDesktop);

    expect(onDesktop).toHaveBeenCalledTimes(1);
    expect(onMobile).not.toHaveBeenCalled();
  });

  it("is a no-op on desktop when no onDesktop callback is given", () => {
    setInnerWidth(1200);
    const onMobile = jest.fn();

    expect(() => initMobileOnly(onMobile)).not.toThrow();
    expect(onMobile).not.toHaveBeenCalled();
  });
});

describe("getScrollTop", () => {
  it("falls back to window.scrollY when body.scrollTop is 0", () => {
    Object.defineProperty(document.body, "scrollTop", { writable: true, value: 0 });
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 250 });

    expect(getScrollTop()).toBe(250);
  });

  it("prefers body.scrollTop when it is non-zero", () => {
    Object.defineProperty(document.body, "scrollTop", { writable: true, value: 42 });

    expect(getScrollTop()).toBe(42);
  });
});

describe("scrollTo", () => {
  it("calls window.scrollTo with a smooth behavior by default", () => {
    window.scrollTo = jest.fn();

    scrollTo(300);

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 300, behavior: "smooth" });
  });

  it("respects an explicit behavior override", () => {
    window.scrollTo = jest.fn();

    scrollTo(0, "auto");

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});

describe("rafThrottle", () => {
  let rafSpy: jest.SpyInstance;

  beforeEach(() => {
    rafSpy = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    rafSpy.mockRestore();
  });

  it("calls the throttled function on the next animation frame", () => {
    const fn = jest.fn();
    const throttled = rafThrottle(fn);

    throttled("x");

    expect(fn).toHaveBeenCalledWith("x");
  });

  it("ignores calls that arrive while a frame is already pending", () => {
    rafSpy.mockImplementation(() => 0);
    const fn = jest.fn();
    const throttled = rafThrottle(fn);

    throttled();
    throttled();
    throttled();

    expect(fn).not.toHaveBeenCalled();
  });
});

describe("onScroll", () => {
  it("invokes the callback on scroll and removes it on cleanup", () => {
    const callback = jest.fn();
    const cleanup = onScroll(callback);

    window.dispatchEvent(new Event("scroll"));
    expect(callback).toHaveBeenCalledTimes(1);

    cleanup();
    window.dispatchEvent(new Event("scroll"));
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe("setScrollBehavior", () => {
  it("sets scroll-behavior on both html and body elements", () => {
    setScrollBehavior("auto");

    expect(document.documentElement.style.scrollBehavior).toBe("auto");
    expect(document.body.style.scrollBehavior).toBe("auto");
  });
});

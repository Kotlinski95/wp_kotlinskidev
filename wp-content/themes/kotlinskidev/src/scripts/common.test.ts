import {
  getTranslations,
  getTranslationGroup,
  debounce,
  throttle,
  isElementInViewport,
  getDeviceType,
  prefersReducedMotion,
  getThemePreference,
  formatString,
  createElement,
  domReady,
  EventEmitter,
} from "./common";

function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

function mockMatchMedia({
  reducedMotion = false,
  darkScheme = false,
}: {
  reducedMotion?: boolean;
  darkScheme?: boolean;
}) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => {
    let matches = false;
    if (query.includes("reduced-motion")) {
      matches = reducedMotion;
    } else if (query.includes("prefers-color-scheme: dark")) {
      matches = darkScheme;
    }
    return {
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });
}

describe("getTranslations / getTranslationGroup", () => {
  afterEach(() => {
    delete (window as unknown as { kotlinskiDevL10n?: unknown }).kotlinskiDevL10n;
  });

  it("returns the window-provided translations when present", () => {
    const custom = { general: { loading: "Wait..." } };
    (window as unknown as { kotlinskiDevL10n?: unknown }).kotlinskiDevL10n = custom;

    expect(getTranslations()).toBe(custom);
  });

  it("falls back to the built-in default translations", () => {
    const translations = getTranslations();

    expect(translations.general.loading).toBe("Loading...");
    expect(translations.navigation.menu.toggle).toBe("Toggle navigation menu");
  });

  it("returns a specific translation group", () => {
    expect(getTranslationGroup("forms").buttons.submit).toBe("Submit");
  });
});

describe("debounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("delays the call until the wait period elapses", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("resets the timer on repeated calls", () => {
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

  it("calls immediately when immediate is true and does not call again on the trailing edge", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, true);

    debounced();
    expect(fn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not call again immediately while still within the wait window", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100, true);

    debounced();
    debounced();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("throttle", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("calls immediately on the first invocation", () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("ignores calls within the throttle window", () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("allows another call once the throttle window elapses", () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);

    throttled();
    jest.advanceTimersByTime(100);
    throttled();

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("isElementInViewport", () => {
  afterEach(() => {
    setInnerWidth(1024);
  });

  function mockRect(el: Element, rect: Partial<DOMRect>) {
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    });
  }

  it("returns true when the element is fully within the viewport", () => {
    setInnerWidth(1000);
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
    const el = document.createElement("div");
    mockRect(el, { top: 10, left: 10, bottom: 100, right: 100 });

    expect(isElementInViewport(el)).toBe(true);
  });

  it("returns false when the element is above the viewport", () => {
    const el = document.createElement("div");
    mockRect(el, { top: -10, left: 10, bottom: 100, right: 100 });

    expect(isElementInViewport(el)).toBe(false);
  });

  it("returns false when the element extends past the right edge", () => {
    setInnerWidth(500);
    const el = document.createElement("div");
    mockRect(el, { top: 10, left: 10, bottom: 100, right: 600 });

    expect(isElementInViewport(el)).toBe(false);
  });
});

describe("getDeviceType", () => {
  afterEach(() => {
    setInnerWidth(1024);
  });

  it("returns mobile below the mobile breakpoint", () => {
    setInnerWidth(500);
    expect(getDeviceType()).toBe("mobile");
  });

  it("returns tablet between the mobile and tablet breakpoints", () => {
    setInnerWidth(900);
    expect(getDeviceType()).toBe("tablet");
  });

  it("returns desktop above the tablet breakpoint", () => {
    setInnerWidth(1300);
    expect(getDeviceType()).toBe("desktop");
  });
});

describe("prefersReducedMotion", () => {
  it("reflects the matchMedia reduced-motion preference", () => {
    mockMatchMedia({ reducedMotion: true });
    expect(prefersReducedMotion()).toBe(true);

    mockMatchMedia({ reducedMotion: false });
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe("getThemePreference", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("prefers a saved theme preference over system settings", () => {
    localStorage.setItem("theme-preference", "dark");
    mockMatchMedia({ darkScheme: false });

    expect(getThemePreference()).toBe("dark");
  });

  it("falls back to the system dark preference when nothing is saved", () => {
    mockMatchMedia({ darkScheme: true });

    expect(getThemePreference()).toBe("dark");
  });

  it("falls back to light when nothing is saved and system prefers light", () => {
    mockMatchMedia({ darkScheme: false });

    expect(getThemePreference()).toBe("light");
  });
});

describe("formatString", () => {
  it("replaces positional placeholders with the given arguments", () => {
    expect(formatString("%1$s of %2$d", "page", 5)).toBe("page of 5");
  });

  it("leaves a placeholder untouched when no matching argument is provided", () => {
    expect(formatString("%1$s and %2$s", "only")).toBe("only and %2$s");
  });
});

describe("createElement", () => {
  it("sets data- and aria- attributes via setAttribute", () => {
    const el = createElement("div", { "data-id": "42", "aria-label": "Widget" });

    expect(el.getAttribute("data-id")).toBe("42");
    expect(el.getAttribute("aria-label")).toBe("Widget");
  });

  it("assigns other known properties directly", () => {
    const el = createElement("div", { id: "widget", className: "box" });

    expect(el.id).toBe("widget");
    expect(el.className).toBe("box");
  });

  it("appends string children as text nodes", () => {
    const el = createElement("div", {}, ["Hello"]);

    expect(el.textContent).toBe("Hello");
  });

  it("appends node children directly", () => {
    const child = document.createElement("span");
    const el = createElement("div", {}, [child]);

    expect(el.firstElementChild).toBe(child);
  });
});

describe("domReady", () => {
  it("calls the callback immediately when the document is already ready", () => {
    const callback = jest.fn();

    domReady(callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("waits for DOMContentLoaded when the document is still loading", () => {
    Object.defineProperty(document, "readyState", {
      configurable: true,
      value: "loading",
    });
    const callback = jest.fn();

    domReady(callback);
    expect(callback).not.toHaveBeenCalled();

    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(callback).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, "readyState", { configurable: true, value: "complete" });
  });
});

describe("EventEmitter", () => {
  it("calls a registered listener with the emitted arguments", () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();
    emitter.on("greet", listener);

    emitter.emit("greet", "hello", 42);

    expect(listener).toHaveBeenCalledWith("hello", 42);
  });

  it("calls multiple listeners for the same event", () => {
    const emitter = new EventEmitter();
    const first = jest.fn();
    const second = jest.fn();
    emitter.on("tick", first);
    emitter.on("tick", second);

    emitter.emit("tick");

    expect(first).toHaveBeenCalled();
    expect(second).toHaveBeenCalled();
  });

  it("stops calling a listener after it is removed", () => {
    const emitter = new EventEmitter();
    const listener = jest.fn();
    emitter.on("tick", listener);

    emitter.off("tick", listener);
    emitter.emit("tick");

    expect(listener).not.toHaveBeenCalled();
  });

  it("does nothing when emitting an event with no listeners", () => {
    const emitter = new EventEmitter();

    expect(() => emitter.emit("nothing")).not.toThrow();
  });

  it("does nothing when removing a listener from an event with no listeners", () => {
    const emitter = new EventEmitter();

    expect(() => emitter.off("nothing", jest.fn())).not.toThrow();
  });
});

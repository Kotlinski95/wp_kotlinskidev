interface CounterApi {
  kotlinskidevAnimateCounter: (el: HTMLElement) => void;
  kotlinskidevInitCounters: () => void;
}

function getApi(): CounterApi {
  return window as unknown as CounterApi;
}

function mockRafToCompletion() {
  let frame = 0;
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
    frame += 1;
    cb(frame === 1 ? 0 : 100000);
    return frame;
  });
}

function mockMatchMedia(reducedMotion: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function buildCounter(text: string, attrs: Record<string, string> = {}) {
  document.body.innerHTML = "";
  const el = document.createElement("span");
  el.className = "animated-counter";
  el.textContent = text;
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  document.body.append(el);
  return el;
}

function loadModule() {
  jest.resetModules();
  delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
  require("./animated-counter");
}

describe("animated-counter.ts — animateCounter formatting", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockRafToCompletion();
    loadModule();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("animates a plain integer to its final value", () => {
    const el = buildCounter("150");

    getApi().kotlinskidevAnimateCounter(el);

    expect(el.textContent).toBe("150");
    expect(el.getAttribute("data-counter-animated")).toBe("true");
  });

  it("preserves a prefix and trims whitespace out of the suffix", () => {
    const el = buildCounter("$99 users");

    getApi().kotlinskidevAnimateCounter(el);

    expect(el.textContent).toBe("$99users");
  });

  it("preserves decimal places", () => {
    const el = buildCounter("12.50%");

    getApi().kotlinskidevAnimateCounter(el);

    expect(el.textContent).toBe("12.50%");
  });

  it("re-applies thousands separators for large numbers", () => {
    const el = buildCounter("12,345");

    getApi().kotlinskidevAnimateCounter(el);

    expect(el.textContent).toBe("12,345");
  });

  it("falls back to 100 when the text has no numeric content", () => {
    const el = buildCounter("Loading...");

    getApi().kotlinskidevAnimateCounter(el);

    expect(el.textContent).toBe("100Loading...");
  });

  it("respects a custom easing attribute without throwing", () => {
    const el = buildCounter("50", { "data-counter-easing": "bounce" });

    expect(() => getApi().kotlinskidevAnimateCounter(el)).not.toThrow();
    expect(el.textContent).toBe("50");
  });

  it("falls back to easeOut for an unrecognized easing value", () => {
    const el = buildCounter("50", { "data-counter-easing": "not-a-real-easing" });

    expect(() => getApi().kotlinskidevAnimateCounter(el)).not.toThrow();
    expect(el.textContent).toBe("50");
  });
});

describe("animated-counter.ts — initCounterAnimations with IntersectionObserver", () => {
  type IntersectionCallback = (
    entries: Array<{ isIntersecting: boolean; target: Element }>
  ) => void;
  let intersectionCallback: IntersectionCallback | null = null;
  let observeSpy: jest.Mock;
  let unobserveSpy: jest.Mock;

  beforeEach(() => {
    mockMatchMedia(false);
    mockRafToCompletion();
    observeSpy = jest.fn();
    unobserveSpy = jest.fn();
    intersectionCallback = null;

    class MockIntersectionObserver {
      constructor(cb: IntersectionCallback) {
        intersectionCallback = cb;
      }
      observe = observeSpy;
      unobserve = unobserveSpy;
      disconnect = jest.fn();
    }
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  });

  it("does nothing when there are no counters on the page", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
    expect(observeSpy).not.toHaveBeenCalled();
  });

  it("observes every un-animated counter", () => {
    buildCounter("10");

    loadModule();

    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it("does not re-observe a counter already marked as animated", () => {
    buildCounter("10", { "data-counter-animated": "true" });

    loadModule();

    expect(observeSpy).not.toHaveBeenCalled();
  });

  it("animates a counter once it intersects", () => {
    const el = buildCounter("10");
    loadModule();

    intersectionCallback?.([{ isIntersecting: true, target: el }]);

    expect(el.getAttribute("data-counter-animated")).toBe("true");
    expect(unobserveSpy).toHaveBeenCalledWith(el);
  });

  it("shows the final value immediately when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const el = buildCounter("10");
    loadModule();

    intersectionCallback?.([{ isIntersecting: true, target: el }]);

    expect(el.textContent).toBe("10");
    expect(el.getAttribute("data-counter-animated")).toBe("true");
  });

  it("does nothing for entries that are not yet intersecting", () => {
    const el = buildCounter("10");
    loadModule();

    intersectionCallback?.([{ isIntersecting: false, target: el }]);

    expect(el.hasAttribute("data-counter-animated")).toBe(false);
    expect(unobserveSpy).not.toHaveBeenCalled();
  });

  it("re-initializes counters added later via a DOM mutation", async () => {
    document.body.innerHTML = "";
    loadModule();
    observeSpy.mockClear();

    const el = document.createElement("span");
    el.className = "animated-counter";
    el.textContent = "20";
    document.body.append(el);
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(observeSpy).toHaveBeenCalledWith(el);
  });
});

describe("animated-counter.ts — fallback without IntersectionObserver", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockRafToCompletion();
    delete (window as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 800,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("animates counters already within the viewport on load", () => {
    const el = buildCounter("30");
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 150,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    loadModule();

    expect(el.getAttribute("data-counter-animated")).toBe("true");
  });

  it("does not animate counters below the fold until scrolled into view", () => {
    const el = buildCounter("30");
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 5000,
      bottom: 5050,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    loadModule();

    expect(el.hasAttribute("data-counter-animated")).toBe(false);

    (el.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: 100,
      bottom: 150,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    window.dispatchEvent(new Event("scroll"));

    expect(el.getAttribute("data-counter-animated")).toBe("true");
  });

  it("shows the final value immediately for a visible counter when reduced motion is preferred", () => {
    mockMatchMedia(true);
    const el = buildCounter("30");
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 150,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });

    loadModule();

    expect(el.textContent).toBe("30");
  });
});

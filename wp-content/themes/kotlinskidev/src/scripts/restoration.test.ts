class MockPerformanceNavigationTiming {
  type: string;
  constructor(type: string) {
    this.type = type;
  }
}

(window as unknown as { PerformanceNavigationTiming: unknown }).PerformanceNavigationTiming =
  MockPerformanceNavigationTiming;
Object.defineProperty(performance, "getEntriesByType", {
  writable: true,
  configurable: true,
  value: jest.fn(),
});

import "./restoration";

function mockNavigationEntries(entries: unknown[]) {
  (performance.getEntriesByType as jest.Mock).mockReturnValue(entries);
}

describe("restoration.ts", () => {
  afterEach(() => {
    (performance.getEntriesByType as jest.Mock).mockReset();
    localStorage.clear();
  });

  it("stores the current scroll position on pagehide", () => {
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 456 });

    window.dispatchEvent(new Event("pagehide"));

    expect(localStorage.getItem("scrollPosition")).toBe("456");
  });

  it("restores scroll position on a back/forward navigation", () => {
    localStorage.setItem("scrollPosition", "789");
    mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 789);
  });

  it("restores scroll position on a reload navigation", () => {
    localStorage.setItem("scrollPosition", "321");
    mockNavigationEntries([new MockPerformanceNavigationTiming("reload")]);
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 321);
  });

  it("does not restore scroll on a normal navigation", () => {
    mockNavigationEntries([new MockPerformanceNavigationTiming("navigate")]);
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("treats a persisted pageshow with no navigation entries as back_forward", () => {
    mockNavigationEntries([]);
    localStorage.setItem("scrollPosition", "100");
    window.scrollTo = jest.fn();

    const event = new Event("pageshow") as Event & { persisted: boolean };
    Object.defineProperty(event, "persisted", { value: true });
    window.dispatchEvent(event);

    expect(window.scrollTo).toHaveBeenCalledWith(0, 100);
  });

  it("treats a non-persisted pageshow with no navigation entries as a normal navigate", () => {
    mockNavigationEntries([]);
    localStorage.setItem("scrollPosition", "100");
    window.scrollTo = jest.fn();

    const event = new Event("pageshow") as Event & { persisted: boolean };
    Object.defineProperty(event, "persisted", { value: false });
    window.dispatchEvent(event);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("does not call scrollTo when there is no stored scroll position", () => {
    mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  // Regression: a kotlinskidev/scroll-section pin (pinSpacing: false) only grows the document's
  // real scrollHeight in response to `scroll` events, as the user actually passes through it
  // (scroll-trigger-refresh.ts's growSpacerForHiddenOverflow()) — confirmed live on a real
  // multi-scroll-section page, scrollHeight more than doubled between a fresh load and the true
  // bottom. A single scrollTo(0, target) call used to get silently clamped to whatever the
  // still-small, ungrown scrollHeight was at that instant, and nothing ever re-issued it, so a
  // reload landed the page stuck partway down instead of at the saved position (confirmed live:
  // landed at scrollY 8453 against a saved target of 16495). This mock reproduces that exact
  // clamp-then-grow shape: each scrollTo() call is clamped to the current max, and the max only
  // grows by a fixed amount per call — matching one scroll-driven growth tick each frame.
  it("keeps retrying scrollTo across frames until scrollY reaches a target that only becomes reachable as the document grows", () => {
    jest.useFakeTimers();
    Object.defineProperty(performance, "getEntriesByType", {
      writable: true,
      configurable: true,
      value: jest.fn(),
    });
    try {
      localStorage.setItem("scrollPosition", "500");
      mockNavigationEntries([new MockPerformanceNavigationTiming("reload")]);

      let currentMax = 100;
      let currentY = 0;
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        get: () => currentY,
      });
      window.scrollTo = jest.fn((_x: number, y: number) => {
        currentY = Math.min(y, currentMax);
        currentMax = Math.min(currentMax + 60, 500);
      });

      window.dispatchEvent(new Event("pageshow"));
      jest.advanceTimersByTime(2000);

      expect(window.scrollY).toBe(500);
    } finally {
      jest.useRealTimers();
    }
  });

  it("stops retrying once scrollY stabilizes short of an unreachable target, instead of retrying forever", () => {
    jest.useFakeTimers();
    Object.defineProperty(performance, "getEntriesByType", {
      writable: true,
      configurable: true,
      value: jest.fn(),
    });
    try {
      localStorage.setItem("scrollPosition", "9999");
      mockNavigationEntries([new MockPerformanceNavigationTiming("reload")]);

      let currentY = 0;
      Object.defineProperty(window, "scrollY", {
        configurable: true,
        get: () => currentY,
      });
      const scrollToMock = jest.fn((_x: number, y: number) => {
        currentY = Math.min(y, 300);
      });
      window.scrollTo = scrollToMock;

      window.dispatchEvent(new Event("pageshow"));
      jest.advanceTimersByTime(2000);
      const callCountAtStop = scrollToMock.mock.calls.length;
      jest.advanceTimersByTime(2000);

      expect(window.scrollY).toBe(300);
      expect(scrollToMock.mock.calls.length).toBe(callCountAtStop);
    } finally {
      jest.useRealTimers();
    }
  });
});

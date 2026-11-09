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

const KEY = `kt-scroll:${window.location.pathname}${window.location.search}`;

function mockNavigationEntries(entries: unknown[]) {
  (performance.getEntriesByType as jest.Mock).mockReturnValue(entries);
}

describe("restoration.ts", () => {
  afterEach(() => {
    (performance.getEntriesByType as jest.Mock).mockReset();
    sessionStorage.clear();
  });

  it("stores the current scroll position on pagehide", () => {
    Object.defineProperty(window, "scrollY", { writable: true, configurable: true, value: 456 });

    window.dispatchEvent(new Event("pagehide"));

    expect(sessionStorage.getItem(KEY)).toBe("456");
  });

  it("restores scroll position on a back/forward navigation", () => {
    sessionStorage.setItem(KEY, "789");
    mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).toHaveBeenCalledWith(0, 789);
  });

  it("restores scroll position on a reload navigation", () => {
    sessionStorage.setItem(KEY, "321");
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

  it("skips restore on a persisted pageshow because bfcache keeps the real position", () => {
    mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
    sessionStorage.setItem(KEY, "100");
    window.scrollTo = jest.fn();

    const event = new Event("pageshow") as Event & { persisted: boolean };
    Object.defineProperty(event, "persisted", { value: true });
    window.dispatchEvent(event);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("treats a non-persisted pageshow with no navigation entries as a normal navigate", () => {
    mockNavigationEntries([]);
    sessionStorage.setItem(KEY, "100");
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("keys the stored position per URL so another page's offset is never restored", () => {
    mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
    sessionStorage.setItem("kt-scroll:/other/", "800");
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("flags a programmatic scroll while restoring and clears it once settled", () => {
    jest.useFakeTimers();
    Object.defineProperty(performance, "getEntriesByType", {
      writable: true,
      configurable: true,
      value: jest.fn(),
    });
    try {
      sessionStorage.setItem(KEY, "50");
      mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
      let currentY = 0;
      Object.defineProperty(window, "scrollY", { configurable: true, get: () => currentY });
      window.scrollTo = jest.fn((_x: number, y: number) => {
        currentY = y;
      });

      window.dispatchEvent(new Event("pageshow"));
      expect(window.kotlinskidevProgrammaticScrollActive).toBe(true);
      jest.advanceTimersByTime(2000);

      expect(window.kotlinskidevProgrammaticScrollActive).toBe(false);
    } finally {
      jest.useRealTimers();
    }
  });

  it("does not call scrollTo when there is no stored scroll position", () => {
    mockNavigationEntries([new MockPerformanceNavigationTiming("back_forward")]);
    window.scrollTo = jest.fn();

    window.dispatchEvent(new Event("pageshow"));

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  // Mocks the exact clamp-then-grow shape of the real scrollHeight bug: each call clamped to current max, which only grows by a fixed amount per call to match one settling tick.
  it("keeps retrying scrollTo across frames until scrollY reaches a target that only becomes reachable as the document grows", () => {
    jest.useFakeTimers();
    Object.defineProperty(performance, "getEntriesByType", {
      writable: true,
      configurable: true,
      value: jest.fn(),
    });
    try {
      sessionStorage.setItem(KEY, "500");
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
      sessionStorage.setItem(KEY, "9999");
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

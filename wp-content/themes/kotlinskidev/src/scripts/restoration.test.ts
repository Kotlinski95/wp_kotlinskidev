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
});

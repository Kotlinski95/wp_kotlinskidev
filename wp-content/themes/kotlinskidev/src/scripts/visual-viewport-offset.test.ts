function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

function mockVisualViewport() {
  const listeners: Record<string, Array<() => void>> = {};
  const viewport = {
    height: 600,
    offsetTop: 0,
    addEventListener: jest.fn((event: string, cb: () => void) => {
      listeners[event] = listeners[event] ?? [];
      listeners[event].push(cb);
    }),
    removeEventListener: jest.fn((event: string, cb: () => void) => {
      listeners[event] = (listeners[event] ?? []).filter((fn) => fn !== cb);
    }),
    trigger: (event: string) => listeners[event]?.forEach((fn) => fn()),
  };
  Object.defineProperty(window, "visualViewport", {
    writable: true,
    configurable: true,
    value: viewport,
  });
  return viewport;
}

describe("visual-viewport-offset.ts", () => {
  let rafSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetModules();
    rafSpy = jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    rafSpy.mockRestore();
    setInnerWidth(1024);
    delete (window as unknown as { visualViewport?: unknown }).visualViewport;
  });

  it("does nothing when the browser has no visualViewport support", () => {
    delete (window as unknown as { visualViewport?: unknown }).visualViewport;
    setInnerWidth(500);

    expect(() => require("./visual-viewport-offset")).not.toThrow();
  });

  it("sets the offset custom property when enabled on a mobile viewport", () => {
    const viewport = mockVisualViewport();
    setInnerWidth(500);
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 700,
    });
    viewport.height = 600;
    viewport.offsetTop = 20;

    require("./visual-viewport-offset");

    expect(document.documentElement.style.getPropertyValue("--kt-vv-bottom-offset")).toBe("80px");
  });

  it("updates the offset again when the viewport resizes", () => {
    const viewport = mockVisualViewport();
    setInnerWidth(500);
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 700,
    });

    require("./visual-viewport-offset");
    viewport.height = 650;
    viewport.offsetTop = 0;
    viewport.trigger("resize");

    expect(document.documentElement.style.getPropertyValue("--kt-vv-bottom-offset")).toBe("50px");
  });

  it("removes the custom property once switched to a desktop viewport", () => {
    const viewport = mockVisualViewport();
    setInnerWidth(500);
    require("./visual-viewport-offset");
    expect(document.documentElement.style.getPropertyValue("--kt-vv-bottom-offset")).not.toBe("");

    jest.useFakeTimers();
    setInnerWidth(1200);
    window.dispatchEvent(new Event("resize"));
    jest.advanceTimersByTime(150);
    jest.useRealTimers();

    expect(document.documentElement.style.getPropertyValue("--kt-vv-bottom-offset")).toBe("");
    expect(viewport.removeEventListener).toHaveBeenCalled();
  });
});

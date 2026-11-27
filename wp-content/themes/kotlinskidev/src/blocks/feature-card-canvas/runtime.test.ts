import { mountFeatureCanvas } from "./runtime";
import { ACCESSIBILITY_MOTION_EVENT, ACCESSIBILITY_STOP_CLASS } from "@utils/accessibility-motion";

const mockDrawSpy = jest.fn();

const mockFactoryCalls = jest.fn();

jest.mock("./variants/node-tree", () => {
  mockFactoryCalls("node-tree");
  return { drawNodeTree: (dc: unknown) => mockDrawSpy(dc) };
});

jest.mock("./variants/chart-growth", () => {
  mockFactoryCalls("chart-growth");
  return { drawChartGrowth: (dc: unknown) => mockDrawSpy(dc) };
});

jest.mock("./variants/storefront", () => {
  throw new Error("chunk failed");
});

const mockReadPalette = jest.fn(() => ({
  accent: [1, 1, 1],
  accentGlow: [1, 1, 1],
  line: [1, 1, 1],
  muted: [1, 1, 1],
  strong: [1, 1, 1],
  surface: [1, 1, 1],
}));

jest.mock("./palette", () => ({
  readPalette: () => mockReadPalette(),
  resolvePresetColor: () => "rgb(1, 1, 1)",
}));

let rafQueue: Array<{ id: number; cb: FrameRequestCallback }> = [];
let rafId = 0;
let now = 0;
let resizeCallback:
  | ((entries: Array<{ contentRect: { width: number; height: number } }>) => void)
  | null = null;
let reducedMotion = false;
let motionListeners: Array<() => void> = [];
let hoverNone = false;

const flush = async (): Promise<void> => {
  for (let index = 0; index < 6; index += 1) {
    await Promise.resolve();
  }
};

const runFrames = (count: number, step = 100): void => {
  for (let index = 0; index < count; index += 1) {
    const queue = rafQueue;
    rafQueue = [];
    now += step;
    queue.forEach((item) => item.cb(now));
  }
};

const lastProgress = (): number =>
  mockDrawSpy.mock.calls[mockDrawSpy.mock.calls.length - 1][0].progress;

const mounted: Array<{ destroy: () => void }> = [];

const build = (): { host: HTMLElement; card: HTMLElement } => {
  document.body.innerHTML =
    '<div class="wp-block-group kt-feature-card"><div class="kt-feature-canvas" data-variant="node-tree" data-labels="[&quot;a&quot;]"><canvas></canvas></div></div>';
  return {
    host: document.querySelector<HTMLElement>(".kt-feature-canvas")!,
    card: document.querySelector<HTMLElement>(".kt-feature-card")!,
  };
};

describe("mountFeatureCanvas", () => {
  beforeEach(() => {
    mockDrawSpy.mockClear();
    mockReadPalette.mockClear();
    rafQueue = [];
    now = 0;
    reducedMotion = false;
    motionListeners = [];
    hoverNone = false;
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafId += 1;
      rafQueue.push({ id: rafId, cb });
      return rafId;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      rafQueue = rafQueue.filter((item) => item.id !== id);
    });
    const matchesByQuery = (query: string): boolean => {
      if (query.includes("reduce")) {
        return reducedMotion;
      }
      if (query.includes("hover: none")) {
        return hoverNone;
      }
      return false;
    };
    window.matchMedia = jest.fn((query: string) => ({
      matches: matchesByQuery(query),
      addEventListener: jest.fn((_type: string, listener: () => void) => {
        if (query.includes("reduce")) {
          motionListeners.push(listener);
        }
      }),
      removeEventListener: jest.fn(),
    })) as unknown as typeof window.matchMedia;
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      constructor(cb: typeof resizeCallback) {
        resizeCallback = cb;
      }
      observe = jest.fn();
      disconnect = jest.fn();
    };
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      setTransform: jest.fn(),
      clearRect: jest.fn(),
    } as unknown as CanvasRenderingContext2D);
  });

  afterEach(() => {
    mounted.forEach((handle) => handle.destroy());
    mounted.length = 0;
    jest.restoreAllMocks();
  });

  const mount = async () => {
    const { host, card } = build();
    const handle = mountFeatureCanvas(host);
    mounted.push(handle);
    resizeCallback?.([{ contentRect: { width: 300, height: 200 } }]);
    await flush();
    return { host, card, handle };
  };

  it("draws one static frame at rest with no rAF", async () => {
    await mount();
    expect(mockDrawSpy).toHaveBeenCalledTimes(1);
    expect(lastProgress()).toBe(0);
    expect(rafQueue).toHaveLength(0);
  });

  it("passes parsed labels and tolerates bad JSON", async () => {
    const { host } = build();
    host.dataset.labels = "{not json";
    mounted.push(mountFeatureCanvas(host));
    resizeCallback?.([{ contentRect: { width: 300, height: 200 } }]);
    await flush();
    expect(mockDrawSpy.mock.calls[0][0].labels).toEqual([]);
  });

  it("hover drives progress to 1 then unhover returns to 0 and stops the loop", async () => {
    const { card } = await mount();
    card.dispatchEvent(new Event("mouseenter"));
    runFrames(6);
    expect(lastProgress()).toBe(1);
    card.dispatchEvent(new Event("mouseleave"));
    runFrames(6);
    expect(lastProgress()).toBe(0);
    runFrames(1);
    expect(rafQueue).toHaveLength(0);
  });

  it("reduced motion snaps with one draw and no loop", async () => {
    reducedMotion = true;
    const { card } = await mount();
    mockDrawSpy.mockClear();
    card.dispatchEvent(new Event("mouseenter"));
    expect(mockDrawSpy).toHaveBeenCalledTimes(1);
    expect(lastProgress()).toBe(1);
    expect(rafQueue).toHaveLength(0);
  });

  it("stops a running loop and snaps to the target when reduced motion is switched on", async () => {
    const { card } = await mount();
    card.dispatchEvent(new Event("mouseenter"));
    expect(rafQueue).toHaveLength(1);
    reducedMotion = true;
    motionListeners.forEach((listener) => listener());
    expect(rafQueue).toHaveLength(0);
    expect(lastProgress()).toBe(1);
  });

  it("resumes the loop when reduced motion is switched off while a target is set", async () => {
    reducedMotion = true;
    const { card } = await mount();
    card.dispatchEvent(new Event("mouseenter"));
    expect(rafQueue).toHaveLength(0);
    reducedMotion = false;
    motionListeners.forEach((listener) => listener());
    expect(rafQueue).toHaveLength(1);
  });

  it("treats the accessibility plugin's stop-animations state like reduced motion", async () => {
    const { card } = await mount();
    card.dispatchEvent(new Event("mouseenter"));
    expect(rafQueue).toHaveLength(1);
    document.documentElement.classList.add(ACCESSIBILITY_STOP_CLASS);
    window.dispatchEvent(
      new CustomEvent(ACCESSIBILITY_MOTION_EVENT, { detail: { stopped: true } })
    );
    expect(rafQueue).toHaveLength(0);
    expect(lastProgress()).toBe(1);
    document.documentElement.classList.remove(ACCESSIBILITY_STOP_CLASS);
    window.dispatchEvent(
      new CustomEvent(ACCESSIBILITY_MOTION_EVENT, { detail: { stopped: false } })
    );
    expect(rafQueue).toHaveLength(1);
  });

  it("hidden tab cancels the loop", async () => {
    const { card } = await mount();
    card.dispatchEvent(new Event("mouseenter"));
    expect(rafQueue).toHaveLength(1);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(rafQueue).toHaveLength(0);
  });

  it("re-reads the palette when the html class changes", async () => {
    await mount();
    mockReadPalette.mockClear();
    document.documentElement.classList.add("dark-mode");
    await Promise.resolve();
    await Promise.resolve();
    expect(mockReadPalette).toHaveBeenCalledTimes(1);
    document.documentElement.classList.remove("dark-mode");
  });

  it("setVisible(false) stops drawing", async () => {
    const { card, handle } = await mount();
    card.dispatchEvent(new Event("mouseenter"));
    handle.setVisible(false);
    mockDrawSpy.mockClear();
    runFrames(3);
    expect(mockDrawSpy).not.toHaveBeenCalled();
  });

  describe("touch devices", () => {
    let ioCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;
    let ioOptions: IntersectionObserverInit | undefined;

    beforeEach(() => {
      ioCallback = null;
      ioOptions = undefined;
      (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
        constructor(cb: typeof ioCallback, options?: IntersectionObserverInit) {
          ioCallback = cb;
          ioOptions = options;
        }
        observe = jest.fn();
        disconnect = jest.fn();
      };
    });

    it("drives the target from the centre band observer", async () => {
      hoverNone = true;
      await mount();
      expect(ioOptions).toEqual({
        rootMargin: "-35% 0px -35% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      });
      ioCallback?.([{ isIntersecting: true }]);
      runFrames(6);
      expect(lastProgress()).toBe(1);
      ioCallback?.([{ isIntersecting: false }]);
      runFrames(6);
      expect(lastProgress()).toBe(0);
    });

    it("in-view trigger plays on enter and resets on leave, on any device", async () => {
      hoverNone = false;
      const { host } = build();
      host.dataset.trigger = "in-view";
      mounted.push(mountFeatureCanvas(host));
      resizeCallback?.([{ contentRect: { width: 300, height: 200 } }]);
      await flush();
      expect(ioOptions).toEqual({ threshold: 0.4 });
      ioCallback?.([{ isIntersecting: true }]);
      runFrames(6);
      expect(lastProgress()).toBe(1);
      ioCallback?.([{ isIntersecting: false }]);
      runFrames(1);
      expect(lastProgress()).toBe(0);
    });

    it("does nothing when touch autoplay is disabled", async () => {
      hoverNone = true;
      const { host } = build();
      host.dataset.touchAutoplay = "false";
      mounted.push(mountFeatureCanvas(host));
      resizeCallback?.([{ contentRect: { width: 300, height: 200 } }]);
      await flush();
      expect(ioCallback).toBeNull();
      expect(rafQueue).toHaveLength(0);
    });

    it("does not toggle on pointerdown", async () => {
      hoverNone = true;
      const { card } = await mount();
      card.dispatchEvent(new Event("pointerdown"));
      runFrames(6);
      expect(lastProgress()).toBe(0);
    });

    it("ignores focusin and mouseenter", async () => {
      hoverNone = true;
      const { card } = await mount();
      card.dispatchEvent(new Event("focusin"));
      card.dispatchEvent(new Event("mouseenter"));
      runFrames(6);
      expect(lastProgress()).toBe(0);
    });

    it("does not create the observer on hover devices and honours focusin", async () => {
      const { card } = await mount();
      expect(ioCallback).toBeNull();
      card.dispatchEvent(new Event("focusin"));
      runFrames(6);
      expect(lastProgress()).toBe(1);
    });
  });

  it("destroy removes listeners", async () => {
    const { card, handle } = await mount();
    handle.destroy();
    card.dispatchEvent(new Event("mouseenter"));
    expect(rafQueue).toHaveLength(0);
  });

  it("returns a no-op handle without a canvas context", async () => {
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { host } = build();
    const handle = mountFeatureCanvas(host);
    expect(() => handle.destroy()).not.toThrow();
  });

  describe("async variant loading", () => {
    it("loads only the host variant and reuses the cache for a second host", async () => {
      mockFactoryCalls.mockClear();
      await mount();
      const second = build();
      mounted.push(mountFeatureCanvas(second.host));
      await flush();
      const loaded = mockFactoryCalls.mock.calls.map((call) => call[0]);
      expect(loaded.filter((name) => name === "node-tree").length).toBeLessThanOrEqual(1);
      expect(loaded).not.toContain("chart-growth");
    });

    it("draws nothing before resolution and draws at current progress after", async () => {
      jest.resetModules();
      const runtime = await import("./runtime");
      const { host, card } = build();
      const handle = runtime.mountFeatureCanvas(host);
      mounted.push(handle);
      resizeCallback?.([{ contentRect: { width: 300, height: 200 } }]);
      mockDrawSpy.mockClear();
      card.dispatchEvent(new Event("mouseenter"));
      expect(mockDrawSpy).not.toHaveBeenCalled();
      await flush();
      expect(mockDrawSpy).toHaveBeenCalled();
    });

    it("does not throw when the chunk fails", async () => {
      const { host } = build();
      host.dataset.variant = "storefront";
      let handle: { destroy: () => void } | undefined;
      expect(() => {
        handle = mountFeatureCanvas(host, { variant: "storefront" });
      }).not.toThrow();
      mounted.push(handle!);
      resizeCallback?.([{ contentRect: { width: 300, height: 200 } }]);
      await flush();
      expect(mockDrawSpy).not.toHaveBeenCalled();
    });
  });
});

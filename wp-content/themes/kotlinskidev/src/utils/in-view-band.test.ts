import {
  BAND_THRESHOLDS,
  bandRootMargin,
  observeCentreBand,
  readInViewBandConfig,
  SWITCH_DEBOUNCE_MS,
} from "./in-view-band";

interface ThemeWindow {
  kotlinskiTheme?: { inViewBand?: unknown };
}

type IOCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;

let ioCallback: IOCallback | null = null;
let viewportCallback: IOCallback | null = null;
let ioOptions: IntersectionObserverInit | undefined;
const observed: Element[] = [];

beforeEach(() => {
  ioCallback = null;
  viewportCallback = null;
  ioOptions = undefined;
  observed.length = 0;
  delete (window as unknown as ThemeWindow).kotlinskiTheme;
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    constructor(cb: IOCallback, options?: IntersectionObserverInit) {
      if (options?.rootMargin === "0px") {
        viewportCallback = cb;
        return;
      }
      ioCallback = cb;
      ioOptions = options;
    }
    observe = (element: Element) => {
      if (!observed.includes(element)) {
        observed.push(element);
      }
    };
    unobserve = (element: Element) => {
      const index = observed.indexOf(element);
      if (index >= 0) {
        observed.splice(index, 1);
      }
    };
    disconnect = jest.fn();
  };
});

const rectAt = (element: Element, top: number, height: number): void => {
  jest.spyOn(element, "getBoundingClientRect").mockReturnValue({
    top,
    height,
    bottom: top + height,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: top,
    toJSON() {},
  });
};

describe("readInViewBandConfig", () => {
  it("falls back to the defaults when the theme global is absent", () => {
    expect(readInViewBandConfig()).toEqual({ enabled: true, center: 50, size: 30, links: false });
  });

  it("reads and clamps the localized band", () => {
    (window as unknown as ThemeWindow).kotlinskiTheme = {
      inViewBand: { enabled: false, center: 150, size: 0, links: true },
    };

    expect(readInViewBandConfig()).toEqual({ enabled: false, center: 100, size: 1, links: true });
  });
});

describe("bandRootMargin", () => {
  it("matches the legacy margin for the default band", () => {
    expect(bandRootMargin({ enabled: true, center: 50, size: 30, links: false })).toBe(
      "-35% 0px -35% 0px"
    );
  });

  it("never produces a negative inset", () => {
    expect(bandRootMargin({ enabled: true, center: 0, size: 100 })).toBe("-0% 0px -50% 0px");
  });
});

describe("observeCentreBand", () => {
  it("passes the band margin and thresholds to the observer", () => {
    observeCentreBand([document.createElement("div")], jest.fn());

    expect(ioOptions).toEqual({ rootMargin: "-35% 0px -35% 0px", threshold: BAND_THRESHOLDS });
  });

  it("activates every intersecting element when not exclusive", () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const onChange = jest.fn();
    observeCentreBand([a, b], onChange);

    ioCallback?.([
      { target: a, isIntersecting: true },
      { target: b, isIntersecting: true },
    ]);

    expect(onChange).toHaveBeenCalledWith(a, true);
    expect(onChange).toHaveBeenCalledWith(b, true);
  });

  it("activates only the element nearest the band centre when exclusive", () => {
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    const far = document.createElement("div");
    const near = document.createElement("div");
    rectAt(far, 100, 100);
    rectAt(near, 450, 100);
    const onChange = jest.fn();
    observeCentreBand([far, near], onChange, { exclusive: true });

    ioCallback?.([
      { target: far, isIntersecting: true },
      { target: near, isIntersecting: true },
    ]);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(near, true);
  });

  it("deactivates an element once it leaves the band and on cleanup", () => {
    const a = document.createElement("div");
    const onChange = jest.fn();
    const { disconnect: stop } = observeCentreBand([a], onChange);
    ioCallback?.([{ target: a, isIntersecting: true }]);
    ioCallback?.([{ target: a, isIntersecting: false }]);

    expect(onChange).toHaveBeenLastCalledWith(a, false);

    ioCallback?.([{ target: a, isIntersecting: true }]);
    stop();

    expect(onChange).toHaveBeenLastCalledWith(a, false);
  });

  describe("exclusive sticky mode", () => {
    const wasCalledWith = (fn: jest.Mock, element: Element, active: boolean): boolean =>
      fn.mock.calls.some(([target, state]) => target === element && state === active);

    const setupPair = () => {
      Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
      const a = document.createElement("div");
      const b = document.createElement("div");
      rectAt(a, 450, 100);
      rectAt(b, 700, 100);
      const onChange = jest.fn();
      const controller = observeCentreBand([a, b], onChange, { exclusive: true });
      viewportCallback?.([
        { target: a, isIntersecting: true },
        { target: b, isIntersecting: true },
      ]);
      return { a, b, onChange, controller };
    };

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("stays active when the band becomes empty", () => {
      const { a, onChange } = setupPair();
      ioCallback?.([{ target: a, isIntersecting: true }]);
      ioCallback?.([{ target: a, isIntersecting: false }]);
      jest.advanceTimersByTime(1000);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(a, true);
    });

    it("switches to another element only after the debounce", () => {
      const { a, b, onChange } = setupPair();
      ioCallback?.([{ target: a, isIntersecting: true }]);
      ioCallback?.([
        { target: a, isIntersecting: false },
        { target: b, isIntersecting: true },
      ]);

      expect(wasCalledWith(onChange, b, true)).toBe(false);
      jest.advanceTimersByTime(SWITCH_DEBOUNCE_MS);

      expect(wasCalledWith(onChange, a, false)).toBe(true);
      expect(wasCalledWith(onChange, b, true)).toBe(true);
    });

    it("cancels a pending switch when the active element is picked again", () => {
      const { a, b, onChange } = setupPair();
      ioCallback?.([{ target: a, isIntersecting: true }]);
      ioCallback?.([
        { target: a, isIntersecting: false },
        { target: b, isIntersecting: true },
      ]);
      ioCallback?.([
        { target: a, isIntersecting: true },
        { target: b, isIntersecting: false },
      ]);
      jest.advanceTimersByTime(1000);

      expect(wasCalledWith(onChange, b, true)).toBe(false);
      expect(wasCalledWith(onChange, a, false)).toBe(false);
    });

    it("clears the active element once it leaves the viewport", () => {
      const { a, onChange } = setupPair();
      ioCallback?.([{ target: a, isIntersecting: true }]);
      viewportCallback?.([{ target: a, isIntersecting: false }]);

      expect(onChange).toHaveBeenLastCalledWith(a, false);
    });
  });

  describe("update", () => {
    it("observes newly added elements and unobserves removed ones", () => {
      const a = document.createElement("div");
      const b = document.createElement("div");
      const { update } = observeCentreBand([a], jest.fn());
      update([a, b]);

      expect(observed).toEqual([a, b]);

      update([b]);

      expect(observed).toEqual([b]);
    });

    it("keeps the active element active across an update that still lists it", () => {
      const a = document.createElement("div");
      const b = document.createElement("div");
      const onChange = jest.fn();
      const { update } = observeCentreBand([a], onChange, { exclusive: true });
      viewportCallback?.([{ target: a, isIntersecting: true }]);
      ioCallback?.([{ target: a, isIntersecting: true }]);
      update([a, b]);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(a, true);
    });

    it("clears an active element that is no longer a candidate", () => {
      const a = document.createElement("div");
      const onChange = jest.fn();
      const { update } = observeCentreBand([a], onChange, { exclusive: true });
      viewportCallback?.([{ target: a, isIntersecting: true }]);
      ioCallback?.([{ target: a, isIntersecting: true }]);
      update([]);

      expect(onChange).toHaveBeenLastCalledWith(a, false);
    });
  });
});

import React from "react";
import { render, act } from "@testing-library/react";
import CanvasRecipePreview from "./CanvasRecipePreview";

const mockDraw = jest.fn();

const mockProbeDraw = (ctx: unknown, drawContext: Record<string, unknown>): void => {
  const resolve = drawContext.resolveColor as (color: string) => string;
  const cache = drawContext.cache as Record<string, unknown>;
  mockDraw({
    width: drawContext.width,
    height: drawContext.height,
    time: drawContext.time,
    params: drawContext.params,
    red: resolve("red"),
    empty: resolve(""),
    themed: resolve("var(--probe-color)"),
    themedAgain: resolve("var(--probe-color)"),
    cacheSeen: Object.keys(cache).length,
    hasCtx: Boolean(ctx),
  });
  cache.touched = true;
};

jest.mock("../../../scripts/canvas-background/registry", () => ({
  layerRegistry: {
    probe: (...args: Parameters<typeof mockProbeDraw>) => mockProbeDraw(...args),
  },
}));

let rafQueue: Array<{ id: number; cb: FrameRequestCallback }> = [];
let rafId = 0;
let reducedMotion = false;
const cancelSpy = jest.fn();
const observeSpy = jest.fn();
const disconnectSpy = jest.fn();
let resizeCallback: (() => void) | null = null;
const ctxCalls: string[] = [];

const runFrame = (time: number): void => {
  const queue = rafQueue;
  rafQueue = [];
  queue.forEach((item) => item.cb(time));
};

const recipe = {
  layers: [
    { type: "probe", params: { speed: 1 } },
    { type: "unknown", params: {} },
  ],
};

describe("CanvasRecipePreview", () => {
  beforeEach(() => {
    mockDraw.mockClear();
    cancelSpy.mockClear();
    observeSpy.mockClear();
    disconnectSpy.mockClear();
    ctxCalls.length = 0;
    rafQueue = [];
    reducedMotion = false;
    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      clearRect: (...args: unknown[]) => ctxCalls.push(`clear ${args.join(",")}`),
      setTransform: (...args: unknown[]) => ctxCalls.push(`transform ${args.join(",")}`),
    } as unknown as CanvasRenderingContext2D);
    jest.spyOn(HTMLCanvasElement.prototype, "getBoundingClientRect").mockReturnValue({
      width: 200.4,
      height: 100.6,
    } as DOMRect);
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafId += 1;
      rafQueue.push({ id: rafId, cb });
      return rafId;
    });
    jest.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
      cancelSpy(id);
      rafQueue = rafQueue.filter((item) => item.id !== id);
    });
    window.matchMedia = jest.fn(() => ({
      matches: reducedMotion,
    })) as unknown as typeof window.matchMedia;
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, value: 3 });
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
      constructor(cb: () => void) {
        resizeCallback = cb;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
    };
    jest
      .spyOn(window, "getComputedStyle")
      .mockReturnValue({ color: "rgb(1, 2, 3)" } as CSSStyleDeclaration);
  });

  afterEach(() => jest.restoreAllMocks());

  it("renders an aria-hidden canvas with the requested height and class", () => {
    const { container } = render(
      <CanvasRecipePreview recipe={recipe} height={64} className="x" animate={false} />
    );
    const canvas = container.querySelector("canvas")!;
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.className).toBe("x");
    expect(canvas.style.display).toBe("block");
    expect(canvas.style.width).toBe("100%");
    expect(canvas.style.height).toBe("64px");
  });

  it("draws one static frame at the fixed static time when not animated", () => {
    const { container } = render(<CanvasRecipePreview recipe={recipe} animate={false} />);
    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(202);
    expect(ctxCalls).toEqual(["transform 2,0,0,2,0,0", "clear 0,0,200,101"]);
    expect(rafQueue).toHaveLength(0);
    expect(mockDraw).toHaveBeenCalledTimes(1);
    expect(mockDraw.mock.calls[0][0]).toEqual({
      width: 200,
      height: 101,
      time: 1200,
      params: { speed: 1 },
      red: "red",
      empty: "#000000",
      themed: "rgb(1, 2, 3)",
      themedAgain: "rgb(1, 2, 3)",
      cacheSeen: 0,
      hasCtx: true,
    });
    expect(observeSpy).not.toHaveBeenCalled();
  });

  it("draws frame zero once for reduced motion even when animate is on", () => {
    reducedMotion = true;
    render(<CanvasRecipePreview recipe={recipe} />);
    expect(mockDraw).toHaveBeenCalledTimes(1);
    expect(mockDraw.mock.calls[0][0].time).toBe(0);
    expect(rafQueue).toHaveLength(0);
  });

  it("animates with rAF, keeps a per-layer cache, resizes and cleans up", () => {
    const { unmount } = render(<CanvasRecipePreview recipe={recipe} />);
    expect(mockDraw).not.toHaveBeenCalled();
    expect(rafQueue).toHaveLength(1);
    expect(observeSpy).toHaveBeenCalledTimes(1);
    act(() => runFrame(16));
    act(() => runFrame(32));
    expect(mockDraw.mock.calls.map((call) => call[0].time)).toEqual([16, 32]);
    expect(mockDraw.mock.calls.map((call) => call[0].cacheSeen)).toEqual([0, 1]);
    expect(rafQueue).toHaveLength(1);
    ctxCalls.length = 0;
    resizeCallback?.();
    expect(ctxCalls).toEqual(["transform 2,0,0,2,0,0"]);
    unmount();
    expect(cancelSpy).toHaveBeenCalledTimes(1);
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it("draws the latest recipe without restarting the loop", () => {
    const { rerender } = render(<CanvasRecipePreview recipe={recipe} />);
    act(() => runFrame(10));
    rerender(
      <CanvasRecipePreview recipe={{ layers: [{ type: "probe", params: { speed: 5 } }] }} />
    );
    expect(observeSpy).toHaveBeenCalledTimes(1);
    act(() => runFrame(20));
    expect(mockDraw.mock.calls.map((call) => call[0].params)).toEqual([{ speed: 1 }, { speed: 5 }]);
  });
});

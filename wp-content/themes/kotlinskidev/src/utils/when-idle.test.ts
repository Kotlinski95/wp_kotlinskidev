import { whenIdle } from "./when-idle";

const setReadyState = (value: DocumentReadyState): void => {
  Object.defineProperty(document, "readyState", { configurable: true, value });
};

describe("whenIdle", () => {
  afterEach(() => {
    delete (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback;
    setReadyState("complete");
    jest.useRealTimers();
  });

  it("runs through requestIdleCallback right away once the page is loaded", () => {
    setReadyState("complete");
    const requestIdleCallback = jest.fn((cb: () => void) => cb());
    window.requestIdleCallback =
      requestIdleCallback as unknown as typeof window.requestIdleCallback;
    const callback = jest.fn();

    whenIdle(callback);

    expect(requestIdleCallback).toHaveBeenCalledWith(callback, { timeout: 3000 });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("waits for the load event while the page is still loading", () => {
    setReadyState("loading");
    const requestIdleCallback = jest.fn((cb: () => void) => cb());
    window.requestIdleCallback =
      requestIdleCallback as unknown as typeof window.requestIdleCallback;
    const callback = jest.fn();

    whenIdle(callback);
    expect(callback).not.toHaveBeenCalled();

    window.dispatchEvent(new Event("load"));

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("falls back to a timeout without requestIdleCallback", () => {
    jest.useFakeTimers();
    setReadyState("complete");
    const callback = jest.fn();

    whenIdle(callback);
    jest.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
  });
});

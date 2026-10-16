type RuntimeModule = typeof import("./runtime");

let rafCallback: FrameRequestCallback | null = null;
let rafCallCount = 0;
let rafSpy: jest.Mock;

function mockRequestAnimationFrame() {
  rafCallback = null;
  rafCallCount = 0;
  rafSpy = jest.fn((cb: FrameRequestCallback) => {
    rafCallback = cb;
    rafCallCount += 1;
    return rafCallCount;
  });
  window.requestAnimationFrame = rafSpy as unknown as typeof window.requestAnimationFrame;
}

function runPendingFrame(time = 16) {
  const cb = rafCallback;
  rafCallback = null;
  cb?.(time);
}

class MockResizeObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}

function mockResizeObserver() {
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver = MockResizeObserver;
}

function makeMockContext() {
  return {
    clearRect: jest.fn(),
    setTransform: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    fillRect: jest.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function mockCanvasContext() {
  const contexts = new WeakMap<HTMLCanvasElement, CanvasRenderingContext2D>();
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(function (
    this: HTMLCanvasElement
  ) {
    const existing = contexts.get(this);
    if (existing) {
      return existing;
    }
    const created = makeMockContext();
    contexts.set(this, created);
    return created;
  });
}

function loadRuntime(): RuntimeModule {
  jest.resetModules();
  mockRequestAnimationFrame();
  mockResizeObserver();
  mockCanvasContext();
  return require("./runtime");
}

function makeHost(): HTMLElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  return host;
}

afterEach(() => {
  document.body.innerHTML = "";
  jest.restoreAllMocks();
});

it("mounts a canvas element inside the host", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, false);

  expect(host.querySelector("canvas")).not.toBeNull();
});

it("starts the shared animation loop when mounted without reduced motion", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, false);

  expect(rafSpy).toHaveBeenCalledTimes(1);
});

it("never starts the animation loop when reduced motion is requested", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, true);

  expect(rafSpy).not.toHaveBeenCalled();
});

it("draws a single static frame immediately even under reduced motion", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, true);

  const ctx = host.querySelector("canvas")?.getContext("2d") as unknown as {
    clearRect: jest.Mock;
  };
  expect(ctx.clearRect).toHaveBeenCalled();
});

it("stops the loop once the instance is paused via setActive", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, false);
  expect(rafCallback).not.toBeNull();

  runtime.setActive(host, false);
  runPendingFrame();

  expect(rafCallback).toBeNull();
});

it("resumes the loop once the instance is reactivated via setActive", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, false);
  runtime.setActive(host, false);
  runPendingFrame();
  expect(rafCallback).toBeNull();

  runtime.setActive(host, true);

  expect(rafCallback).not.toBeNull();
});

it("ignores setActive calls for a reduced-motion instance", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, true);
  runtime.setActive(host, true);

  expect(rafSpy).not.toHaveBeenCalled();
});

it("does not mount a second canvas for the same host", () => {
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, false);
  runtime.mount(host, { layers: [] }, false);

  expect(host.querySelectorAll("canvas")).toHaveLength(1);
});

it("keeps the loop running while at least one of several instances stays active", () => {
  const runtime = loadRuntime();
  const hostA = makeHost();
  const hostB = makeHost();

  runtime.mount(hostA, { layers: [] }, false);
  runtime.mount(hostB, { layers: [] }, false);
  runtime.setActive(hostA, false);

  runPendingFrame();

  expect(rafCallback).not.toBeNull();
});

it("stops the loop once every instance has been paused", () => {
  const runtime = loadRuntime();
  const hostA = makeHost();
  const hostB = makeHost();

  runtime.mount(hostA, { layers: [] }, false);
  runtime.mount(hostB, { layers: [] }, false);
  runtime.setActive(hostA, false);
  runtime.setActive(hostB, false);

  runPendingFrame();

  expect(rafCallback).toBeNull();
});

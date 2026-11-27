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

const MOTION_EVENT = "kotlinskidev-a11y:motion";
const STOP_CLASS = "ka11y-stop-animations";

function setMotionStopped(stopped: boolean) {
  document.documentElement.classList.toggle(STOP_CLASS, stopped);
  window.dispatchEvent(new CustomEvent(MOTION_EVENT, { detail: { stopped } }));
}

afterEach(() => {
  document.documentElement.classList.remove(STOP_CLASS);
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

it("does not start the loop when mounted while Stop animations is on", () => {
  document.documentElement.classList.add(STOP_CLASS);
  const runtime = loadRuntime();
  const host = makeHost();

  runtime.mount(host, { layers: [] }, false);

  expect(rafSpy).not.toHaveBeenCalled();
  const ctx = host.querySelector("canvas")?.getContext("2d") as unknown as {
    clearRect: jest.Mock;
  };
  expect(ctx.clearRect).toHaveBeenCalled();
});

it("cancels the loop and draws a static frame when Stop animations turns on", () => {
  const cancelSpy = jest.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  const runtime = loadRuntime();
  const host = makeHost();
  runtime.mount(host, { layers: [] }, false);
  const ctx = host.querySelector("canvas")?.getContext("2d") as unknown as {
    clearRect: jest.Mock;
  };
  ctx.clearRect.mockClear();

  setMotionStopped(true);

  expect(cancelSpy).toHaveBeenCalled();
  expect(ctx.clearRect).toHaveBeenCalledTimes(1);
});

it("does not reschedule a frame that was already in flight while stopped", () => {
  const runtime = loadRuntime();
  const host = makeHost();
  runtime.mount(host, { layers: [] }, false);

  document.documentElement.classList.add(STOP_CLASS);
  runPendingFrame();

  expect(rafCallback).toBeNull();
});

it("resumes the loop when Stop animations turns off", () => {
  const runtime = loadRuntime();
  const host = makeHost();
  runtime.mount(host, { layers: [] }, false);
  setMotionStopped(true);
  rafCallback = null;

  setMotionStopped(false);

  expect(rafCallback).not.toBeNull();
});

it("does not resume the loop for an instance that is offscreen", () => {
  const runtime = loadRuntime();
  const host = makeHost();
  runtime.mount(host, { layers: [] }, false);
  runtime.setActive(host, false);
  setMotionStopped(true);
  rafCallback = null;

  setMotionStopped(false);

  expect(rafCallback).toBeNull();
});

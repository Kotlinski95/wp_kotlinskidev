type IntersectionCallback = (
  entries: Array<{ isIntersecting: boolean; target: Element }>,
  observer: { unobserve: (el: Element) => void }
) => void;

let mockIntersectionCallback: IntersectionCallback | null = null;
let mockIntersectionOptions: IntersectionObserverInit | undefined;
let mockObserveSpy: jest.Mock;
let mockUnobserveSpy: jest.Mock;

function mockIntersectionObserver() {
  mockObserveSpy = jest.fn();
  mockUnobserveSpy = jest.fn();

  class MockIntersectionObserver {
    constructor(cb: IntersectionCallback, options: IntersectionObserverInit) {
      mockIntersectionCallback = cb;
      mockIntersectionOptions = options;
    }
    observe = mockObserveSpy;
    unobserve = mockUnobserveSpy;
    disconnect = jest.fn();
  }

  (globalThis.window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    MockIntersectionObserver;
}

const mockMountModelViewer = jest.fn();
jest.mock("./runtime", () => ({
  mountModelViewer: (...args: unknown[]) => mockMountModelViewer(...args),
}));

function mockGetContext(supported: boolean) {
  jest
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation(() => (supported ? ({} as unknown as RenderingContext) : null));
}

function buildButton(): HTMLButtonElement {
  document.body.innerHTML = "";
  const button = document.createElement("button");
  button.className = "model-viewer__trigger";
  button.dataset.modelUrl = "https://example.test/model.glb";
  const canvas = document.createElement("canvas");
  canvas.className = "model-viewer__canvas";
  button.append(canvas);
  document.body.append(button);
  return button;
}

function loadModule() {
  jest.resetModules();
  mockIntersectionCallback = null;
  require("./init");
}

describe("model-viewer/init.ts", () => {
  beforeEach(() => {
    mockIntersectionObserver();
    mockMountModelViewer.mockClear();
  });

  afterEach(() => {
    delete (globalThis.window as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    (HTMLCanvasElement.prototype.getContext as jest.Mock)?.mockRestore?.();
    document.body.innerHTML = "";
  });

  it("does nothing when there are no model-viewer triggers on the page", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
    expect(mockObserveSpy).not.toHaveBeenCalled();
  });

  it("observes the trigger with a large root margin", () => {
    buildButton();

    loadModule();

    expect(mockObserveSpy).toHaveBeenCalledTimes(1);
    expect(mockIntersectionOptions?.rootMargin).toBe("200px 0px");
  });

  it("does not mount before the trigger intersects", () => {
    const button = buildButton();
    mockGetContext(true);
    loadModule();

    mockIntersectionCallback?.([{ isIntersecting: false, target: button }], {
      unobserve: mockUnobserveSpy,
    });

    expect(mockUnobserveSpy).not.toHaveBeenCalled();
    expect(mockMountModelViewer).not.toHaveBeenCalled();
  });

  it("dynamically imports and mounts the runtime once the trigger intersects and WebGL is supported", async () => {
    const button = buildButton();
    mockGetContext(true);
    loadModule();

    mockIntersectionCallback?.([{ isIntersecting: true, target: button }], {
      unobserve: mockUnobserveSpy,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(mockUnobserveSpy).toHaveBeenCalledWith(button);
    expect(mockMountModelViewer).toHaveBeenCalledWith(button, button.querySelector("canvas"));
  });

  it("never imports the runtime when WebGL is unsupported, even after intersecting", async () => {
    const button = buildButton();
    mockGetContext(false);
    loadModule();

    mockIntersectionCallback?.([{ isIntersecting: true, target: button }], {
      unobserve: mockUnobserveSpy,
    });
    await Promise.resolve();
    await Promise.resolve();

    expect(mockMountModelViewer).not.toHaveBeenCalled();
  });

  it("does not throw and does no WebGL work when IntersectionObserver is unsupported", () => {
    buildButton();
    delete (globalThis.window as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;

    expect(() => loadModule()).not.toThrow();
    expect(mockMountModelViewer).not.toHaveBeenCalled();
  });
});

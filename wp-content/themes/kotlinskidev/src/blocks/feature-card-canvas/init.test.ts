type Entry = { isIntersecting: boolean; target: Element };

let mockCallback: ((entries: Entry[]) => void) | null = null;
let mockOptions: IntersectionObserverInit | undefined;
const mockObserve = jest.fn();
const mockHandle = { setVisible: jest.fn(), setTarget: jest.fn(), destroy: jest.fn() };
const mockMount = jest.fn(() => mockHandle);
const mockLoaded = jest.fn();

jest.mock("./runtime", () => {
  mockLoaded();
  return { mountFeatureCanvas: (...args: unknown[]) => mockMount(...(args as [])) };
});

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe("feature-card-canvas init", () => {
  let host: HTMLElement;

  beforeEach(() => {
    jest.resetModules();
    mockCallback = null;
    mockObserve.mockClear();
    mockMount.mockClear();
    mockHandle.setVisible.mockClear();
    class MockObserver {
      constructor(cb: (entries: Entry[]) => void, options: IntersectionObserverInit) {
        mockCallback = cb;
        mockOptions = options;
      }
      observe = mockObserve;
      disconnect = jest.fn();
    }
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = MockObserver;
    document.body.innerHTML = '<div class="kt-feature-canvas" data-variant="node-tree"></div>';
    host = document.querySelector<HTMLElement>(".kt-feature-canvas")!;
  });

  it("observes hosts with a 200px margin and does not mount before intersect", async () => {
    await import("./init");
    expect(mockObserve).toHaveBeenCalledWith(host);
    expect(mockOptions).toEqual({ rootMargin: "200px 0px" });
    expect(mockMount).not.toHaveBeenCalled();
  });

  it("mounts once on first intersect, then toggles visibility", async () => {
    await import("./init");
    mockCallback?.([{ isIntersecting: true, target: host }]);
    await flush();
    expect(mockMount).toHaveBeenCalledWith(host);

    mockCallback?.([{ isIntersecting: false, target: host }]);
    await flush();
    expect(mockHandle.setVisible).toHaveBeenCalledWith(false);
    expect(mockMount).toHaveBeenCalledTimes(1);
  });

  it("ignores non-intersecting entries before mount", async () => {
    await import("./init");
    mockCallback?.([{ isIntersecting: false, target: host }]);
    await flush();
    expect(mockMount).not.toHaveBeenCalled();
  });
});

export {};

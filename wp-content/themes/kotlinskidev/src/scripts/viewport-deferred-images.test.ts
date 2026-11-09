type Entry = { isIntersecting: boolean; target: Element };

let callback: ((entries: Entry[], obs: { unobserve: jest.Mock }) => void) | null = null;
let options: IntersectionObserverInit | undefined;
const unobserve = jest.fn();

class MockIntersectionObserver {
  constructor(cb: typeof callback, opts: IntersectionObserverInit) {
    callback = cb;
    options = opts;
  }
  observe = jest.fn();
}

const load = (): void => {
  jest.isolateModules(() => {
    require("./viewport-deferred-images");
  });
};

describe("viewport-deferred-images", () => {
  beforeEach(() => {
    callback = null;
    options = undefined;
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  it("does nothing without deferred panel images", () => {
    document.body.innerHTML = "";
    load();
    expect(callback).toBeNull();
  });

  it("swaps data attributes for real ones when near the viewport", () => {
    document.body.innerHTML =
      '<div class="kt-content-tabs__panel"><img data-src="a.jpg" data-srcset="a.jpg 1x" data-sizes="100vw"></div>';
    const img = document.querySelector("img") as HTMLImageElement;
    load();
    expect(options?.rootMargin).toBe("200px");

    callback?.([{ isIntersecting: true, target: img }], { unobserve });

    expect(img.getAttribute("src")).toBe("a.jpg");
    expect(img.getAttribute("srcset")).toBe("a.jpg 1x");
    expect(img.getAttribute("sizes")).toBe("100vw");
    expect(img.hasAttribute("data-src")).toBe(false);
    expect(unobserve).toHaveBeenCalledWith(img);
  });

  it("leaves images alone while off-screen", () => {
    document.body.innerHTML = '<div class="kt-content-tabs__panel"><img data-src="a.jpg"></div>';
    const img = document.querySelector("img") as HTMLImageElement;
    load();
    callback?.([{ isIntersecting: false, target: img }], { unobserve });
    expect(img.hasAttribute("src")).toBe(false);
  });
});

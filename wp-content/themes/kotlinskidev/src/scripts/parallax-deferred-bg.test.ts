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
    require("./parallax-deferred-bg");
  });
};

describe("parallax-deferred-bg", () => {
  beforeEach(() => {
    callback = null;
    options = undefined;
    unobserve.mockClear();
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  it("does nothing without deferred backgrounds", () => {
    document.body.innerHTML = "";
    load();
    expect(callback).toBeNull();
  });

  it("sets the background near the viewport and unobserves", () => {
    document.body.innerHTML = '<div data-kt-parallax-bg="a.webp"></div>';
    const el = document.querySelector("div") as HTMLElement;
    load();
    expect(options?.rootMargin).toBe("400px");
    callback?.([{ isIntersecting: false, target: el }], { unobserve });
    expect(el.style.backgroundImage).toBe("");
    callback?.([{ isIntersecting: true, target: el }], { unobserve });
    expect(el.style.backgroundImage).toContain("a.webp");
    expect(el.hasAttribute("data-kt-parallax-bg")).toBe(false);
    expect(unobserve).toHaveBeenCalledWith(el);
  });

  it("applies immediately without IntersectionObserver", () => {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = undefined;
    document.body.innerHTML = '<div data-kt-parallax-bg="b.webp"></div>';
    load();
    expect((document.querySelector("div") as HTMLElement).style.backgroundImage).toContain(
      "b.webp"
    );
  });

  it.each([
    ["javascript:alert(1)"],
    ["data:image/svg+xml;base64,AAAA"],
    ["ftp://example.com/a.webp"],
  ])("rejects %s", (value) => {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = undefined;
    document.body.innerHTML = "<div></div>";
    const el = document.querySelector("div") as HTMLElement;
    el.setAttribute("data-kt-parallax-bg", value);
    load();
    expect(el.style.backgroundImage).toBe("");
    expect(el.hasAttribute("data-kt-parallax-bg")).toBe(false);
  });

  it("does not let quote-breaking values escape url()", () => {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = undefined;
    document.body.innerHTML = "<div></div>";
    const el = document.querySelector("div") as HTMLElement;
    el.setAttribute("data-kt-parallax-bg", 'https://example.com/a.webp"); background:red; x:url("');
    load();
    expect(el.style.backgroundImage).not.toContain('"); background');
    expect(el.style.background).not.toContain("red");
  });
});

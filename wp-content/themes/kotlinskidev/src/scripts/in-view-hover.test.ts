type IOCallback = (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;

let ioCallback: IOCallback | null = null;
let viewportCallback: IOCallback | null = null;
const observed: Element[] = [];

function setup(hoverNone: boolean, enabled = true, links = false) {
  ioCallback = null;
  viewportCallback = null;
  observed.length = 0;
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = class {
    constructor(cb: IOCallback, options?: IntersectionObserverInit) {
      if (options?.rootMargin === "0px") {
        viewportCallback = cb;
        return;
      }
      ioCallback = cb;
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
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("hover: none") ? hoverNone : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  (window as unknown as { kotlinskiTheme: unknown }).kotlinskiTheme = {
    inViewBand: { enabled, center: 50, size: 30, links },
  };
}

function load() {
  jest.resetModules();
  require("./in-view-hover");
}

afterEach(() => {
  document.body.innerHTML = "";
  delete (window as unknown as { kotlinskiTheme?: unknown }).kotlinskiTheme;
});

describe("in-view-hover", () => {
  it("does nothing on hover-capable devices", () => {
    setup(false);
    document.body.innerHTML = '<div class="hover-jump"></div>';
    load();

    expect(ioCallback).toBeNull();
  });

  it("does nothing when disabled in settings", () => {
    setup(true, false);
    document.body.innerHTML = '<div class="hover-jump"></div>';
    load();

    expect(ioCallback).toBeNull();
  });

  it("activates the intersecting candidate and keeps it across an empty band", () => {
    setup(true);
    document.body.innerHTML = '<div class="hover-jump" id="a"></div>';
    load();
    const el = document.getElementById("a") as HTMLElement;

    ioCallback?.([{ target: el, isIntersecting: true }]);
    expect(el.classList.contains("is-in-view-hover")).toBe(true);

    ioCallback?.([{ target: el, isIntersecting: false }]);
    expect(el.classList.contains("is-in-view-hover")).toBe(true);
  });

  it("clears the candidate once it leaves the viewport", () => {
    setup(true);
    document.body.innerHTML = '<div class="hover-jump" id="a"></div>';
    load();
    const el = document.getElementById("a") as HTMLElement;

    ioCallback?.([{ target: el, isIntersecting: true }]);
    viewportCallback?.([{ target: el, isIntersecting: false }]);

    expect(el.classList.contains("is-in-view-hover")).toBe(false);
  });

  it("switches to a newly centred candidate only after the debounce", () => {
    jest.useFakeTimers();
    setup(true);
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    document.body.innerHTML =
      '<div class="hover-jump" id="a"></div><div class="hover-jump" id="b"></div>';
    load();
    const a = document.getElementById("a") as HTMLElement;
    const b = document.getElementById("b") as HTMLElement;
    jest.spyOn(b, "getBoundingClientRect").mockReturnValue({
      top: 450,
      height: 100,
      bottom: 550,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: 450,
      toJSON() {},
    });
    viewportCallback?.([
      { target: a, isIntersecting: true },
      { target: b, isIntersecting: true },
    ]);

    ioCallback?.([{ target: a, isIntersecting: true }]);
    ioCallback?.([
      { target: a, isIntersecting: false },
      { target: b, isIntersecting: true },
    ]);
    expect(a.classList.contains("is-in-view-hover")).toBe(true);
    expect(b.classList.contains("is-in-view-hover")).toBe(false);

    jest.advanceTimersByTime(150);

    expect(a.classList.contains("is-in-view-hover")).toBe(false);
    expect(b.classList.contains("is-in-view-hover")).toBe(true);
    jest.useRealTimers();
  });

  it("skips candidates inside an opted-out block", () => {
    setup(true);
    document.body.innerHTML =
      '<div class="kt-in-view-hover-off"><div class="hover-jump" id="a"></div></div>';
    load();
    const el = document.getElementById("a") as HTMLElement;

    expect(observed).not.toContain(el);
  });

  it("sets the glow origin to the element centre for glow elements", () => {
    setup(true);
    document.body.innerHTML = '<div class="has-enhanced-hover-glow" id="a"></div>';
    const el = document.getElementById("a") as HTMLElement;
    jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 100,
      top: 0,
      left: 0,
      right: 200,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON() {},
    });
    load();

    ioCallback?.([{ target: el, isIntersecting: true }]);

    expect(el.style.getPropertyValue("--kt-glow-x")).toBe("100px");
    expect(el.style.getPropertyValue("--kt-glow-y")).toBe("50px");
  });

  it("skips link-like candidates by default but keeps cards", () => {
    setup(true);
    document.body.innerHTML =
      '<a class="hover-jump" id="a"></a>' +
      '<a class="kt-button__link" id="b"></a>' +
      '<div class="wp-block-button"><div class="hover-scale" id="c"></div></div>' +
      '<nav class="wp-block-navigation"><div class="hover-fade" id="d"></div></nav>' +
      '<a class="kt-link-card" id="e"></a>' +
      '<div class="kt-post-card-grid__card" id="f"></div>' +
      '<div class="hover-jump" id="g"></div>';
    load();
    const ids = observed.map((el) => el.id);

    expect(ids).toEqual(["e", "f", "g"]);
  });

  it("includes link-like candidates when links are enabled", () => {
    setup(true, true, true);
    document.body.innerHTML =
      '<a class="hover-jump" id="a"></a><div class="wp-block-button"><a class="kt-button__link" id="b"></a></div>';
    load();

    expect(observed.map((el) => el.id)).toEqual(["a", "b"]);
  });

  it("skips candidates inside carousels and horizontally scrolling containers", () => {
    setup(true);
    document.body.innerHTML =
      '<div class="swiper"><div class="hover-jump" id="a"></div></div>' +
      '<div class="wp-block-wpe-slider"><div class="hover-jump" id="b"></div></div>' +
      '<div style="overflow-x:auto"><div class="hover-jump" id="c"></div></div>' +
      '<div style="overflow-x:scroll"><div><div class="hover-jump" id="d"></div></div></div>' +
      '<div style="overflow-x:hidden"><div class="hover-jump" id="e"></div></div>' +
      '<div class="hover-jump" id="f"></div>';
    load();

    expect(observed.map((el) => el.id)).toEqual(["e", "f"]);
  });

  describe("nested candidates", () => {
    const mountNested = (): void => {
      const card = document.createElement("div");
      card.className = "hover-jump";
      card.id = "card";
      const fig = document.createElement("figure");
      fig.className = "kt-image-hover-overlay";
      fig.id = "fig";
      const offWrap = document.createElement("div");
      offWrap.className = "kt-in-view-hover-off";
      const off = document.createElement("div");
      off.className = "hover-fade";
      off.id = "off";
      offWrap.appendChild(off);
      card.append(fig, offWrap);
      document.body.appendChild(card);
    };

    it("observes only the outer candidate and mirrors its state onto descendants", () => {
      setup(true);
      mountNested();
      load();
      const card = document.getElementById("card") as HTMLElement;
      const fig = document.getElementById("fig") as HTMLElement;
      const off = document.getElementById("off") as HTMLElement;

      expect(observed.map((el) => el.id)).toEqual(["card"]);

      ioCallback?.([{ target: card, isIntersecting: true }]);
      expect(card.classList.contains("is-in-view-hover")).toBe(true);
      expect(fig.classList.contains("is-in-view-hover")).toBe(true);
      expect(off.classList.contains("is-in-view-hover")).toBe(false);

      viewportCallback?.([{ target: card, isIntersecting: false }]);
      expect(card.classList.contains("is-in-view-hover")).toBe(false);
      expect(fig.classList.contains("is-in-view-hover")).toBe(false);
    });

    it("applies the class to a descendant added while the outer is active", async () => {
      jest.useFakeTimers();
      setup(true);
      mountNested();
      load();
      const card = document.getElementById("card") as HTMLElement;
      ioCallback?.([{ target: card, isIntersecting: true }]);

      const late = document.createElement("figure");
      late.className = "kt-image-hover-overlay";
      card.appendChild(late);
      await Promise.resolve();
      jest.advanceTimersByTime(150);

      expect(late.classList.contains("is-in-view-hover")).toBe(true);
      expect(observed.map((el) => el.id)).toEqual(["card"]);
      jest.useRealTimers();
    });
  });

  describe("rescan", () => {
    const flushMutations = async (): Promise<void> => {
      await Promise.resolve();
      jest.advanceTimersByTime(150);
    };

    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("keeps the active class, observes new candidates and clears removed ones", async () => {
      setup(true);
      document.body.innerHTML =
        '<div class="hover-jump" id="a"></div><div class="hover-jump" id="b"></div>';
      load();
      const a = document.getElementById("a") as HTMLElement;
      const b = document.getElementById("b") as HTMLElement;
      viewportCallback?.([
        { target: a, isIntersecting: true },
        { target: b, isIntersecting: true },
      ]);
      ioCallback?.([{ target: a, isIntersecting: true }]);

      const added = document.createElement("div");
      added.className = "hover-jump";
      added.id = "c";
      document.body.appendChild(added);
      await flushMutations();

      expect(a.classList.contains("is-in-view-hover")).toBe(true);
      expect(observed.map((el) => el.id)).toEqual(["a", "b", "c"]);

      a.remove();
      await flushMutations();

      expect(a.classList.contains("is-in-view-hover")).toBe(false);
      expect(observed.map((el) => el.id)).toEqual(["b", "c"]);
    });

    it("ignores mutations that add or remove no candidates", async () => {
      setup(true);
      document.body.innerHTML = '<div class="hover-jump" id="a"></div><p id="p"></p>';
      load();
      await flushMutations();
      const p = document.getElementById("p") as HTMLElement;
      p.className = "hover-jump";
      document.body.appendChild(document.createElement("span"));
      await flushMutations();

      expect(observed.map((el) => el.id)).toEqual(["a"]);
    });
  });
});

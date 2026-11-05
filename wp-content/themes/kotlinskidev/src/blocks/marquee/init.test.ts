function buildMarquee(itemCount: number): { el: HTMLElement; track: HTMLElement } {
  const el = document.createElement("div");
  el.className = "kt-marquee";
  const track = document.createElement("div");
  track.className = "kt-marquee__track";
  for (let i = 0; i < itemCount; i += 1) {
    const item = document.createElement("div");
    item.className = "kt-marquee__item";
    const img = document.createElement("img");
    img.loading = "lazy";
    item.append(img);
    track.append(item);
  }
  el.append(track);
  return { el, track };
}

// JSDOM has no real layout engine (getBoundingClientRect() always returns zeros), so this fakes a uniform-width row: child at index i sits at left = i * itemWidth.
function mockUniformRowLayout(track: HTMLElement, itemWidth: number): void {
  jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement
  ) {
    const rect = { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 } as DOMRect;
    if (this === track) {
      return rect;
    }
    const index = Array.from(track.children).indexOf(this);
    return { ...rect, left: index >= 0 ? index * itemWidth : 0 };
  });
  Object.defineProperty(track, "scrollWidth", {
    configurable: true,
    get: () => track.children.length * itemWidth,
  });
}

describe("marquee/init.ts", () => {
  const originalDocumentAddEventListener = document.addEventListener.bind(document);
  const originalWindowAddEventListener = window.addEventListener.bind(window);
  let documentListeners: Array<{ type: string; listener: EventListener }>;
  let windowListeners: Array<{ type: string; listener: EventListener }>;

  beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = "";

    documentListeners = [];
    jest.spyOn(document, "addEventListener").mockImplementation((type, listener, options) => {
      documentListeners.push({ type, listener: listener as EventListener });
      return originalDocumentAddEventListener(type, listener as EventListener, options);
    });

    windowListeners = [];
    jest.spyOn(window, "addEventListener").mockImplementation((type, listener, options) => {
      windowListeners.push({ type, listener: listener as EventListener });
      return originalWindowAddEventListener(type, listener as EventListener, options);
    });
  });

  afterEach(() => {
    documentListeners.forEach(({ type, listener }) => document.removeEventListener(type, listener));
    windowListeners.forEach(({ type, listener }) => window.removeEventListener(type, listener));
    jest.restoreAllMocks();
  });

  function load() {
    jest.isolateModules(() => {
      require("./init");
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));
  }

  describe("seamless-loop cloning", () => {
    // Regression: a short item list in a near-full-width container has one repeat unit narrower than the container, showing a growing blank gap (matches wolanski-web.pl's own reference marquee).

    it("keeps appending repeat units until the track is wide enough to cover shiftDistance + containerWidth", () => {
      const { el, track } = buildMarquee(3);
      document.body.append(el);
      mockUniformRowLayout(track, 100);
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 500 });

      load();

      // unit width 300, needs scrollWidth >= 800; 2 units (600) isn't enough, 3 units (900) is → 9 items.
      expect(track.children).toHaveLength(9);
      expect(track.style.getPropertyValue("--kt-marquee-shift")).toBe("-300px");
    });

    it("stops after the first clone when one repeat unit already covers the container", () => {
      const { el, track } = buildMarquee(3);
      document.body.append(el);
      mockUniformRowLayout(track, 100);
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 200 });

      load();

      // unit width 300 >= containerWidth 200, so a single clone (6 items, scrollWidth 600) already satisfies 300 + 200.
      expect(track.children).toHaveLength(6);
    });

    it("never clones more than MAX_CLONE_ITERATIONS extra repeat units even for an absurdly wide container", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      mockUniformRowLayout(track, 10);
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 100000 });

      load();

      // 1 initial clone (4 items) + at most 20 more units (2 items each) = 44.
      expect(track.children.length).toBeLessThanOrEqual(44);
    });

    it("marks every item beyond the original real set as aria-hidden and non-tabbable, regardless of how many repeat units were added", () => {
      const { el, track } = buildMarquee(3);
      document.body.append(el);
      mockUniformRowLayout(track, 100);
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 500 });

      load();

      const items = Array.from(track.querySelectorAll<HTMLElement>(".kt-marquee__item"));
      items.slice(0, 3).forEach((item) => {
        expect(item.getAttribute("aria-hidden")).toBeNull();
        expect(item.getAttribute("tabindex")).toBeNull();
      });
      items.slice(3).forEach((item) => {
        expect(item.getAttribute("aria-hidden")).toBe("true");
        expect(item.getAttribute("tabindex")).toBe("-1");
      });
    });

    it("forces every image (original and every cloned repeat) to eager loading, so no half's width can lag behind another from a late lazy-load", () => {
      const { el, track } = buildMarquee(3);
      document.body.append(el);
      mockUniformRowLayout(track, 100);
      Object.defineProperty(el, "clientWidth", { configurable: true, value: 500 });

      load();

      const images = Array.from(el.querySelectorAll<HTMLImageElement>("img"));
      expect(images.length).toBeGreaterThan(3);
      images.forEach((img) => {
        expect(img.loading).toBe("eager");
      });
    });

    it("does not set --kt-marquee-shift when the measured shift distance is zero (e.g. no real layout available)", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);

      load();

      expect(track.style.getPropertyValue("--kt-marquee-shift")).toBe("");
    });
  });

  it("does nothing when there is no .kt-marquee__track inside the element", () => {
    const el = document.createElement("div");
    el.className = "kt-marquee";
    document.body.append(el);

    expect(() => load()).not.toThrow();
  });

  describe("pause/resume", () => {
    it("pauses the track on hover and resumes on hover-out", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      load();

      el.dispatchEvent(new MouseEvent("mouseenter"));
      expect(track.classList.contains("is-paused")).toBe(true);

      el.dispatchEvent(new MouseEvent("mouseleave"));
      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("pauses on focus entering the carousel and resumes once focus leaves entirely", () => {
      const { el, track } = buildMarquee(2);
      const button = document.createElement("button");
      el.append(button);
      document.body.append(el);
      load();

      button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(track.classList.contains("is-paused")).toBe(true);

      el.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("does not resume on focusout when the next focused element is still inside the carousel", () => {
      const { el, track } = buildMarquee(2);
      const first = document.createElement("button");
      const second = document.createElement("button");
      el.append(first, second);
      document.body.append(el);
      load();

      first.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      first.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: second }));

      expect(track.classList.contains("is-paused")).toBe(true);
    });

    it("pauses on pointerdown and resumes on pointerup anywhere in the document", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      load();

      el.dispatchEvent(new Event("pointerdown") as PointerEvent);
      expect(track.classList.contains("is-paused")).toBe(true);

      document.dispatchEvent(new Event("pointerup") as PointerEvent);
      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("resumes on pointercancel too", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      load();

      el.dispatchEvent(new Event("pointerdown") as PointerEvent);
      document.dispatchEvent(new Event("pointercancel") as PointerEvent);

      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("pauses when a kt-modal opens from a trigger inside the carousel, and stays paused across hover clearing", () => {
      const { el, track } = buildMarquee(2);
      const trigger = el.querySelector(".kt-marquee__item") as HTMLElement;
      document.body.append(el);
      load();

      el.dispatchEvent(new MouseEvent("mouseenter"));
      document.dispatchEvent(new CustomEvent("kt-modal:open", { detail: { trigger } }));
      el.dispatchEvent(new MouseEvent("mouseleave"));

      expect(track.classList.contains("is-paused")).toBe(true);
    });

    it("ignores a kt-modal opened from a trigger outside the carousel", () => {
      const { el, track } = buildMarquee(2);
      const outsideTrigger = document.createElement("button");
      document.body.append(el, outsideTrigger);
      load();

      document.dispatchEvent(
        new CustomEvent("kt-modal:open", { detail: { trigger: outsideTrigger } })
      );

      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("resumes once a kt-modal closes, even though modal-manager.ts returns focus to the trigger first — that native focusin would otherwise leave the carousel stuck paused forever with no focusout ever coming", () => {
      const { el, track } = buildMarquee(2);
      const trigger = el.querySelector(".kt-marquee__item") as HTMLElement;
      trigger.tabIndex = 0;
      document.body.append(el);
      load();

      document.dispatchEvent(new CustomEvent("kt-modal:open", { detail: { trigger } }));
      trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      document.dispatchEvent(new CustomEvent("kt-modal:close", { detail: { trigger } }));

      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("resumes on scroll when paused with focus stuck true but no real hover/press/modal reason remaining", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      load();

      el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(track.classList.contains("is-paused")).toBe(true);

      window.dispatchEvent(new Event("scroll"));

      expect(track.classList.contains("is-paused")).toBe(false);
    });

    it("does not override a genuine, ongoing hover just because the page scrolled", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      load();

      el.dispatchEvent(new MouseEvent("mouseenter"));
      window.dispatchEvent(new Event("scroll"));

      expect(track.classList.contains("is-paused")).toBe(true);
    });

    it("does nothing on scroll while not paused at all", () => {
      const { el, track } = buildMarquee(2);
      document.body.append(el);
      load();

      window.dispatchEvent(new Event("scroll"));

      expect(track.classList.contains("is-paused")).toBe(false);
    });
  });
});

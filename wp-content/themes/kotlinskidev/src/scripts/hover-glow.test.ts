function mockMatchMedia({
  supportsHover = true,
  reducedMotion = false,
}: { supportsHover?: boolean; reducedMotion?: boolean } = {}) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => {
    let matches = false;
    if (query.includes("prefers-reduced-motion")) {
      matches = reducedMotion;
    } else if (query.includes("hover: hover")) {
      matches = supportsHover;
    }
    return {
      matches,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });
}

function loadScript() {
  jest.resetModules();
  require("./hover-glow");
}

function mockBoundingClientRect(el: Element, rect: Partial<DOMRect>) {
  jest.spyOn(el, "getBoundingClientRect").mockReturnValue({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON() {},
    ...rect,
  });
}

describe("hover-glow.ts", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockMatchMedia();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("does nothing when there is no enhanced-hover-glow button on the page", () => {
    document.body.innerHTML = '<a class="kt-button__link">Click</a>';

    expect(() => loadScript()).not.toThrow();
  });

  it("does nothing for a kotlinskidev/button link that has no label span", () => {
    document.body.innerHTML = '<a class="kt-button__link has-enhanced-hover-glow">Click</a>';

    expect(() => loadScript()).not.toThrow();

    const link = document.querySelector<HTMLElement>(".kt-button__link")!;
    const addEventListenerSpy = jest.spyOn(link, "addEventListener");
    link.dispatchEvent(new Event("pointermove"));

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("does not attach a pointermove listener when the device has no fine hover pointer", () => {
    mockMatchMedia({ supportsHover: false });
    document.body.innerHTML =
      '<a class="kt-button__link has-enhanced-hover-glow"><span class="kt-button__label">Click</span></a>';
    loadScript();

    const link = document.querySelector<HTMLElement>(".kt-button__link")!;
    const addEventListenerSpy = jest.spyOn(link, "addEventListener");
    link.dispatchEvent(new Event("pointermove"));

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("does not attach a pointermove listener when the user prefers reduced motion", () => {
    mockMatchMedia({ reducedMotion: true });
    document.body.innerHTML =
      '<a class="kt-button__link has-enhanced-hover-glow"><span class="kt-button__label">Click</span></a>';
    loadScript();

    const link = document.querySelector<HTMLElement>(".kt-button__link")!;
    const addEventListenerSpy = jest.spyOn(link, "addEventListener");
    link.dispatchEvent(new Event("pointermove"));

    expect(addEventListenerSpy).not.toHaveBeenCalled();
  });

  it("updates the glow position CSS variables on the kotlinskidev/button label, relative to the label's own box, on pointermove over the link", () => {
    document.body.innerHTML =
      '<a class="kt-button__link has-enhanced-hover-glow"><span class="kt-button__label">Click</span></a>';
    loadScript();

    const link = document.querySelector<HTMLElement>(".kt-button__link")!;
    const label = document.querySelector<HTMLElement>(".kt-button__label")!;
    mockBoundingClientRect(label, { left: 20, top: 25 });

    link.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 50, clientY: 70 }));
    jest.runAllTimers();

    expect(label.style.getPropertyValue("--kt-glow-x")).toBe("30px");
    expect(label.style.getPropertyValue("--kt-glow-y")).toBe("45px");
    expect(link.style.getPropertyValue("--kt-glow-x")).toBe("");
  });

  it("updates the glow position CSS variables on the core/button inner link on pointermove", () => {
    document.body.innerHTML =
      '<div class="wp-block-button has-enhanced-hover-glow"><a class="wp-block-button__link">Click</a></div>';
    loadScript();

    const link = document.querySelector<HTMLElement>(".wp-block-button__link")!;
    mockBoundingClientRect(link, { left: 0, top: 0 });

    link.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 15, clientY: 25 }));
    jest.runAllTimers();

    expect(link.style.getPropertyValue("--kt-glow-x")).toBe("15px");
    expect(link.style.getPropertyValue("--kt-glow-y")).toBe("25px");
  });

  it("updates the glow position CSS variables on a plain paragraph with has-enhanced-hover-glow", () => {
    document.body.innerHTML = '<p class="has-enhanced-hover-glow">Some text</p>';
    loadScript();

    const paragraph = document.querySelector<HTMLElement>("p")!;
    mockBoundingClientRect(paragraph, { left: 5, top: 10 });

    paragraph.dispatchEvent(
      new MouseEvent("pointermove", { bubbles: true, clientX: 35, clientY: 40 })
    );
    jest.runAllTimers();

    expect(paragraph.style.getPropertyValue("--kt-glow-x")).toBe("30px");
    expect(paragraph.style.getPropertyValue("--kt-glow-y")).toBe("30px");
  });

  it("drops intermediate pointermove events scheduled within the same animation frame", () => {
    document.body.innerHTML =
      '<a class="kt-button__link has-enhanced-hover-glow"><span class="kt-button__label">Click</span></a>';
    const rafSpy = jest.spyOn(window, "requestAnimationFrame").mockReturnValue(1);
    loadScript();

    const link = document.querySelector<HTMLElement>(".kt-button__link")!;
    const label = document.querySelector<HTMLElement>(".kt-button__label")!;
    mockBoundingClientRect(label, { left: 0, top: 0 });

    link.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 10, clientY: 10 }));
    link.dispatchEvent(new MouseEvent("pointermove", { bubbles: true, clientX: 99, clientY: 99 }));

    expect(rafSpy).toHaveBeenCalledTimes(1);
  });
});

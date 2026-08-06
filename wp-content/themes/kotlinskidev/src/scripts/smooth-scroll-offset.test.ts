function setInnerWidth(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
}

function mockMatchMedia(reducedMotion: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("reduced-motion") ? reducedMotion : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function buildAnchorAndTarget() {
  document.body.innerHTML = "";
  const link = document.createElement("a");
  link.href = "#target";
  const target = document.createElement("div");
  target.id = "target";
  jest.spyOn(target, "getBoundingClientRect").mockReturnValue({
    top: 500,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
  jest.spyOn(target, "focus");
  document.body.append(link, target);
  return { link, target };
}

describe("smooth-scroll-offset.ts", () => {
  beforeEach(() => {
    jest.resetModules();
    mockMatchMedia(false);
    setInnerWidth(1200);
    window.scrollTo = jest.fn();
    window.location.hash = "";
  });

  afterEach(() => {
    setInnerWidth(1024);
  });

  it("scrolls smoothly to the target and updates history on anchor click", () => {
    const { link, target } = buildAnchorAndTarget();
    require("./smooth-scroll-offset");
    const pushStateSpy = jest.spyOn(history, "pushState");

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "smooth" }));
    expect(target.focus).toHaveBeenCalled();
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", "#target");
  });

  it("uses auto scroll behavior when the user prefers reduced motion", () => {
    mockMatchMedia(true);
    const { link } = buildAnchorAndTarget();
    require("./smooth-scroll-offset");

    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: "auto" }));
  });

  it("uses the mobile scroll offset on a mobile viewport", () => {
    setInnerWidth(500);
    const { link } = buildAnchorAndTarget();
    require("./smooth-scroll-offset");

    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 500 }));
  });

  it("does nothing when the anchor's target element does not exist", () => {
    document.body.innerHTML = "";
    const link = document.createElement("a");
    link.href = "#missing";
    document.body.append(link);
    require("./smooth-scroll-offset");

    const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
    link.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("does nothing on click when the anchor has no href", () => {
    document.body.innerHTML = "";
    const link = document.createElement("a");
    link.setAttribute("href", "#");
    document.body.append(link);

    expect(() => require("./smooth-scroll-offset")).not.toThrow();
  });

  it("clamps the scroll target to a minimum of 0", () => {
    const { link, target } = buildAnchorAndTarget();
    (target.getBoundingClientRect as jest.Mock).mockReturnValue({
      top: -1000,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    require("./smooth-scroll-offset");

    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }));
  });

  it("scrolls to the target from an initial location hash after a short delay", () => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
    const target = document.createElement("div");
    target.id = "hash-target";
    jest.spyOn(target, "getBoundingClientRect").mockReturnValue({
      top: 300,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.append(target);
    window.location.hash = "#hash-target";

    require("./smooth-scroll-offset");
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    expect(window.scrollTo).toHaveBeenCalled();
  });

  it("does nothing on load when there is no location hash", () => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
    window.location.hash = "";

    require("./smooth-scroll-offset");
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("re-scrolls to the matching element on hashchange", () => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
    const target = document.createElement("div");
    target.id = "later-target";
    jest.spyOn(target, "getBoundingClientRect").mockReturnValue({
      top: 100,
      bottom: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    document.body.append(target);

    require("./smooth-scroll-offset");
    jest.advanceTimersByTime(100);
    expect(window.scrollTo).not.toHaveBeenCalled();

    window.location.hash = "#later-target";
    window.dispatchEvent(new Event("hashchange"));
    jest.advanceTimersByTime(100);
    jest.useRealTimers();

    expect(window.scrollTo).toHaveBeenCalled();
  });
});

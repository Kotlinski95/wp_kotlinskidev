import { computeListScrollTop, createListScroller } from "./scroll-list";

function rect(top: number, height: number): DOMRect {
  return { top, bottom: top + height, height } as DOMRect;
}

function buildList(options: {
  containerTop?: number;
  clientHeight?: number;
  scrollHeight?: number;
  scrollTop?: number;
  linkTop: number;
  linkHeight?: number;
}): { container: HTMLElement; link: HTMLElement } {
  const container = document.createElement("div");
  const link = document.createElement("a");
  container.appendChild(link);
  document.body.appendChild(container);

  const clientHeight = options.clientHeight ?? 300;
  Object.defineProperty(container, "clientHeight", { configurable: true, value: clientHeight });
  Object.defineProperty(container, "scrollHeight", {
    configurable: true,
    value: options.scrollHeight ?? 1000,
  });
  container.scrollTop = options.scrollTop ?? 0;
  container.scrollTo = jest.fn() as unknown as typeof container.scrollTo;
  jest
    .spyOn(container, "getBoundingClientRect")
    .mockImplementation(() => rect(options.containerTop ?? 100, clientHeight));
  jest
    .spyOn(link, "getBoundingClientRect")
    .mockImplementation(() => rect(options.linkTop, options.linkHeight ?? 40));
  return { container, link };
}

describe("article-toc scroll-list", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("computeListScrollTop", () => {
    it("returns null when the link is fully visible", () => {
      const { container, link } = buildList({ linkTop: 200 });
      expect(computeListScrollTop(container, link)).toBeNull();
    });

    it("centres a link below the visible area", () => {
      const { container, link } = buildList({ linkTop: 600, scrollTop: 0 });
      expect(computeListScrollTop(container, link)).toBe(370);
    });

    it("centres a link above the visible area using the current scrollTop", () => {
      const { container, link } = buildList({ linkTop: 20, scrollTop: 400 });
      expect(computeListScrollTop(container, link)).toBe(190);
    });

    it("clamps to the scrollable range", () => {
      const { container, link } = buildList({ linkTop: 5000, scrollHeight: 1000 });
      expect(computeListScrollTop(container, link)).toBe(700);
    });

    it("clamps to zero at the top", () => {
      const { container, link } = buildList({ linkTop: 90, scrollTop: 0 });
      expect(computeListScrollTop(container, link)).toBe(0);
    });
  });

  describe("createListScroller", () => {
    it("scrolls the container smoothly and never the page", () => {
      const { container, link } = buildList({ linkTop: 600 });
      window.scrollTo = jest.fn();
      createListScroller(container, () => false).scrollToLink(link);

      expect(container.scrollTo).toHaveBeenCalledWith({ top: 370, behavior: "smooth" });
      expect(window.scrollTo).not.toHaveBeenCalled();
    });

    it("uses auto behaviour under reduced motion", () => {
      const { container, link } = buildList({ linkTop: 600 });
      createListScroller(container, () => true).scrollToLink(link);

      expect(container.scrollTo).toHaveBeenCalledWith({ top: 370, behavior: "auto" });
    });

    it("does nothing when the link is already visible", () => {
      const { container, link } = buildList({ linkTop: 200 });
      createListScroller(container, () => false).scrollToLink(link);

      expect(container.scrollTo).not.toHaveBeenCalled();
    });

    it("does nothing for a hidden container or missing link", () => {
      const hidden = buildList({ linkTop: 600, clientHeight: 0 });
      const scroller = createListScroller(hidden.container, () => false);
      scroller.scrollToLink(hidden.link);
      scroller.scrollToLink(null);

      expect(hidden.container.scrollTo).not.toHaveBeenCalled();
    });

    it("skips while the container is hovered", () => {
      const { container, link } = buildList({ linkTop: 600 });
      jest.spyOn(container, "matches").mockReturnValue(true);
      createListScroller(container, () => false).scrollToLink(link);

      expect(container.scrollTo).not.toHaveBeenCalled();
    });

    it("skips for 1.2s after a wheel interaction and resumes afterwards", () => {
      const { container, link } = buildList({ linkTop: 600 });
      const scroller = createListScroller(container, () => false);

      container.dispatchEvent(new Event("wheel"));
      scroller.scrollToLink(link);
      expect(container.scrollTo).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1300);
      scroller.scrollToLink(link);
      expect(container.scrollTo).toHaveBeenCalledTimes(1);
    });

    it("skips after a touch interaction", () => {
      const { container, link } = buildList({ linkTop: 600 });
      const scroller = createListScroller(container, () => false);

      container.dispatchEvent(new Event("touchmove"));
      scroller.scrollToLink(link);

      expect(container.scrollTo).not.toHaveBeenCalled();
    });

    it("force bypasses the guard and scrolls instantly", () => {
      const { container, link } = buildList({ linkTop: 600 });
      jest.spyOn(container, "matches").mockReturnValue(true);
      const scroller = createListScroller(container, () => false);
      container.dispatchEvent(new Event("wheel"));
      scroller.scrollToLink(link, { force: true });

      expect(container.scrollTo).toHaveBeenCalledWith({ top: 370, behavior: "auto" });
    });
  });
});

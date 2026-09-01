const mockOnHandlers: Record<string, Array<(...args: unknown[]) => void>> = {};
let mockLastInstance: MockSwiper | null = null;

class MockSwiper {
  params: Record<string, unknown>;
  el: HTMLElement;
  wrapperEl: HTMLElement;
  autoplay = { pause: jest.fn(), resume: jest.fn(), start: jest.fn() };
  updateActiveIndex = jest.fn();
  setTransition = jest.fn();
  setTranslate = jest.fn();
  loopFix = jest.fn();
  slideTo = jest.fn();
  slideToLoop = jest.fn();
  slideNext = jest.fn();
  animating = false;
  activeIndex = 0;
  snapGrid: number[] = [];
  destroyed = false;
  update = jest.fn();
  pagination = { render: jest.fn(), update: jest.fn() };

  constructor(el: HTMLElement, params: Record<string, unknown>) {
    this.el = el;
    this.params = params;
    this.wrapperEl = el.querySelector(".swiper-wrapper") as HTMLElement;
    mockLastInstance = this;
  }

  on(event: string, handler: (...args: unknown[]) => void) {
    mockOnHandlers[event] = mockOnHandlers[event] ?? [];
    mockOnHandlers[event].push(handler);
  }
}

type IntersectionCallback = (
  entries: Array<{ isIntersecting: boolean; target: Element }>,
  observer: { unobserve: (el: Element) => void }
) => void;

let mockIntersectionCallback: IntersectionCallback | null = null;
let mockObserveSpy: jest.Mock;
let mockUnobserveSpy: jest.Mock;

function mockIntersectionObserver() {
  mockObserveSpy = jest.fn();
  mockIntersectionCallback = null;
  mockUnobserveSpy = jest.fn(() => {
    mockIntersectionCallback = null;
  });

  class MockIntersectionObserver {
    constructor(cb: IntersectionCallback) {
      mockIntersectionCallback = cb;
    }
    observe = mockObserveSpy;
    unobserve = mockUnobserveSpy;
    disconnect = jest.fn();
  }

  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    MockIntersectionObserver;
}

function fireIntersection(target: Element, isIntersecting: boolean) {
  mockIntersectionCallback?.([{ isIntersecting, target }], { unobserve: mockUnobserveSpy });
}

jest.mock("swiper", () => ({
  __esModule: true,
  default: jest
    .fn()
    .mockImplementation(
      (el: HTMLElement, params: Record<string, unknown>) => new MockSwiper(el, params)
    ),
}));

jest.mock("swiper/modules", () => ({
  Autoplay: "Autoplay",
  Keyboard: "Keyboard",
  Navigation: "Navigation",
  Pagination: "Pagination",
  A11y: "A11y",
  HashNavigation: "HashNavigation",
  Mousewheel: "Mousewheel",
  Parallax: "Parallax",
  Scrollbar: "Scrollbar",
  Thumbs: "Thumbs",
  Zoom: "Zoom",
  FreeMode: "FreeMode",
}));

import { SwiperInit } from "./swiper-init";

function buildContainer(slideCount: number) {
  const container = document.createElement("div");
  const wrapper = document.createElement("div");
  wrapper.className = "swiper-wrapper";
  for (let i = 0; i < slideCount; i += 1) {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";
    wrapper.append(slide);
  }
  container.append(wrapper);
  return container;
}

describe("slider/swiper-init.ts — SwiperInit", () => {
  beforeEach(() => {
    Object.keys(mockOnHandlers).forEach((key) => delete mockOnHandlers[key]);
    mockLastInstance = null;
  });

  afterEach(() => {
    delete (globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
  });

  it("enables loop when there are enough slides for the requested slidesPerView", () => {
    const container = buildContainer(6);

    SwiperInit(container, { slidesPerView: 1 });

    expect(mockLastInstance?.params.loop).toBe(true);
  });

  it("disables loop when there are not enough slides", () => {
    const container = buildContainer(2);

    SwiperInit(container, { slidesPerView: 1 });

    expect(mockLastInstance?.params.loop).toBe(false);
  });

  it("disables loop when explicitly requested even with enough slides", () => {
    const container = buildContainer(6);

    SwiperInit(container, { slidesPerView: 1, loop: false });

    expect(mockLastInstance?.params.loop).toBe(false);
  });

  it("builds a fixed-delay autoplay config in milliseconds", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true, autoplayTime: 4 });

    expect(mockLastInstance?.params.autoplay).toEqual({
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    });
  });

  it("never pauses autoplay on mouse-enter — scrolling an element under a stationary cursor fires a real pointerenter and would silently stall it before any real interaction", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true, autoplayTime: 4 });

    expect(
      (mockLastInstance?.params.autoplay as { pauseOnMouseEnter: boolean }).pauseOnMouseEnter
    ).toBe(false);
  });

  it("uses the normal autoplayTime-based delay even with smooth transition — a near-zero delay never lets the previous transition's transitionend fire, permanently freezing Autoplay", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true, autoplayTime: 4, smoothTransition: true });

    expect((mockLastInstance?.params.autoplay as { delay: number }).delay).toBe(4000);
  });

  it("passes through a plain boolean autoplay when no autoplayTime is given", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true });

    expect(mockLastInstance?.params.autoplay).toBe(true);
  });

  it("sets pagination only when pagination is requested without scrollbar", () => {
    const container = buildContainer(3);
    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    container.append(pagination);

    SwiperInit(container, { pagination: true, scrollbar: false });

    expect(mockLastInstance?.params.pagination).toEqual({
      el: pagination,
      clickable: false,
    });
    expect(mockLastInstance?.params.scrollbar).toBeUndefined();
  });

  it("leaves Swiper's own pagination clickable option off — clicks are handled by our own listener instead, bypassing Swiper's slideNext()/slidePrev() shortcut for adjacent bullets that can desync realIndex under rapid clicks", () => {
    const container = buildContainer(3);
    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    container.append(pagination);

    SwiperInit(container, { pagination: true });

    expect((mockLastInstance?.params.pagination as { clickable: boolean }).clickable).toBe(false);
  });

  it("clicking a pagination bullet calls slideToLoop directly with its index when looping — never a relative slideNext/slidePrev step", () => {
    const container = buildContainer(5);
    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    for (let i = 0; i < 5; i += 1) {
      const bullet = document.createElement("span");
      bullet.className = "swiper-pagination-bullet";
      pagination.append(bullet);
    }
    container.append(pagination);

    SwiperInit(container, { pagination: true });

    pagination.children[3].dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.slideToLoop).toHaveBeenCalledWith(3);
    expect(mockLastInstance?.slideTo).not.toHaveBeenCalled();
  });

  it("clicking a pagination bullet calls slideTo directly with its index when loop is disabled", () => {
    const container = buildContainer(2);
    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    for (let i = 0; i < 2; i += 1) {
      const bullet = document.createElement("span");
      bullet.className = "swiper-pagination-bullet";
      pagination.append(bullet);
    }
    container.append(pagination);

    SwiperInit(container, { pagination: true });

    pagination.children[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.slideTo).toHaveBeenCalledWith(1);
    expect(mockLastInstance?.slideToLoop).not.toHaveBeenCalled();
  });

  it("ignores clicks landing inside the pagination container but not on a bullet", () => {
    const container = buildContainer(3);
    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    container.append(pagination);

    SwiperInit(container, { pagination: true });

    pagination.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.slideTo).not.toHaveBeenCalled();
    expect(mockLastInstance?.slideToLoop).not.toHaveBeenCalled();
  });

  it("sets scrollbar only when scrollbar is requested without pagination", () => {
    const container = buildContainer(3);

    SwiperInit(container, { scrollbar: true, pagination: false });

    expect(mockLastInstance?.params.scrollbar).toBe(true);
    expect(mockLastInstance?.params.pagination).toBeUndefined();
  });

  it("sets neither pagination nor scrollbar when both are requested together", () => {
    const container = buildContainer(3);

    SwiperInit(container, { pagination: true, scrollbar: true });

    expect(mockLastInstance?.params.pagination).toBeUndefined();
    expect(mockLastInstance?.params.scrollbar).toBeUndefined();
  });

  it("builds per-breakpoint slidesPerView from mobile/tablet/desktop options", () => {
    const container = buildContainer(3);

    SwiperInit(container, { slidesPerMobile: 1, slidesPerTablet: 2, slidesPerDesktop: 3 });

    expect(mockLastInstance?.params.breakpoints).toEqual({
      640: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    });
  });

  it("respects an explicit spaceBetween of 0", () => {
    const container = buildContainer(3);

    SwiperInit(container, { spaceBetween: 0 });

    expect(mockLastInstance?.params.spaceBetween).toBe(0);
  });

  it("defaults spaceBetween to 16 when not provided", () => {
    const container = buildContainer(3);

    SwiperInit(container, {});

    expect(mockLastInstance?.params.spaceBetween).toBe(16);
  });

  it("uses a fixed 800ms speed for smooth transitions regardless of autoplayTime — a transition speed tied to delay reproduces the near-zero-delay Autoplay deadlock", () => {
    const container = buildContainer(3);

    SwiperInit(container, { smoothTransition: true, autoplayTime: 6 });

    expect(mockLastInstance?.params.speed).toBe(800);
  });

  it("uses the default 300ms speed without smooth transition", () => {
    const container = buildContainer(3);

    SwiperInit(container, {});

    expect(mockLastInstance?.params.speed).toBe(300);
  });

  it("sets a linear transition timing function on the wrapper for smooth transitions", () => {
    const container = buildContainer(3);
    const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;

    SwiperInit(container, { smoothTransition: true });

    expect(wrapper.style.transitionTimingFunction).toBe("linear");
  });

  it("pauses autoplay (not a hard stop) when the container is clicked", () => {
    const container = buildContainer(3);
    document.body.append(container);

    SwiperInit(container, { autoplay: true });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.pause).toHaveBeenCalled();
    document.body.innerHTML = "";
  });

  it("resumes autoplay (not a cold restart) on an outside click only after the user had interacted", () => {
    const container = buildContainer(3);
    document.body.append(container);

    SwiperInit(container, { autoplay: true });
    const outside = document.createElement("div");
    document.body.append(outside);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(mockLastInstance?.autoplay.resume).not.toHaveBeenCalled();

    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.resume).toHaveBeenCalled();
    document.body.innerHTML = "";
  });

  it("re-arms after a resume — a later click inside pauses again", () => {
    const container = buildContainer(3);
    document.body.append(container);
    const outside = document.createElement("div");
    document.body.append(outside);

    SwiperInit(container, { autoplay: true });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(2);
    document.body.innerHTML = "";
  });

  it("does not resume again on a second outside click once already resumed", () => {
    const container = buildContainer(3);
    document.body.append(container);
    const outside = document.createElement("div");
    document.body.append(outside);

    SwiperInit(container, { autoplay: true });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.resume).toHaveBeenCalledTimes(1);
    document.body.innerHTML = "";
  });

  it("a click on a child element inside the carousel still counts as an inside click (event bubbling)", () => {
    const container = buildContainer(3);
    document.body.append(container);
    const bullet = document.createElement("span");
    container.append(bullet);

    SwiperInit(container, { autoplay: true });
    bullet.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.pause).toHaveBeenCalled();
    document.body.innerHTML = "";
  });

  it("resyncs the active index on autoplay start and resume", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true });
    mockOnHandlers.autoplayStart?.forEach((handler) => handler());
    mockOnHandlers.autoplayResume?.forEach((handler) => handler());

    expect(mockLastInstance?.updateActiveIndex).toHaveBeenCalledTimes(2);
  });

  it("uses slidesPerView auto and centeredSlides when centerSlides is enabled", () => {
    const container = buildContainer(6);

    SwiperInit(container, { centerSlides: true, slidesPerView: 3 });

    expect(mockLastInstance?.params.slidesPerView).toBe("auto");
    expect(mockLastInstance?.params.centeredSlides).toBe(true);
    expect(mockLastInstance?.params.breakpoints).toBeUndefined();
  });

  it("keeps numeric slidesPerView and per-breakpoint values when centerSlides is disabled", () => {
    const container = buildContainer(6);

    SwiperInit(container, { centerSlides: false, slidesPerView: 3 });

    expect(mockLastInstance?.params.slidesPerView).toBe(3);
    expect(mockLastInstance?.params.centeredSlides).toBe(false);
    expect(mockLastInstance?.params.breakpoints).toBeDefined();
  });

  it("enables loop for centered mode with more than 2 slides regardless of slidesPerView", () => {
    const container = buildContainer(3);

    SwiperInit(container, { centerSlides: true, slidesPerView: 5 });

    expect(mockLastInstance?.params.loop).toBe(true);
  });

  it("disables loop for centered mode with 2 or fewer slides", () => {
    const container = buildContainer(2);

    SwiperInit(container, { centerSlides: true });

    expect(mockLastInstance?.params.loop).toBe(false);
  });

  it("does not wire autoplay click handling when autoplay is disabled", () => {
    const container = buildContainer(3);
    document.body.append(container);

    SwiperInit(container, { autoplay: false });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.pause).not.toHaveBeenCalled();
    document.body.innerHTML = "";
  });

  it("never wires freeMode into the params — it deadlocks Autoplay's slideNext progression", () => {
    const container = buildContainer(3);

    SwiperInit(container, { smoothTransition: true, autoplay: true, autoplayTime: 5 });

    expect(mockLastInstance?.params.freeMode).toBeUndefined();
  });

  it("wires pagination the same way for every variant, including centerSlides and multi-slidesPerView", () => {
    const container = buildContainer(6);
    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    container.append(pagination);

    SwiperInit(container, { centerSlides: true, pagination: true, slidesPerView: 3 });

    expect(mockLastInstance?.params.pagination).toEqual({ el: pagination, clickable: false });
  });

  it("does not enable freeMode without smooth transition either", () => {
    const container = buildContainer(3);

    SwiperInit(container, { smoothTransition: false });

    expect(mockLastInstance?.params.freeMode).toBeUndefined();
  });

  it("enables touch/drag handling by default", () => {
    const container = buildContainer(3);

    SwiperInit(container, {});

    expect(mockLastInstance?.params.simulateTouch).toBe(true);
    expect(mockLastInstance?.params.allowTouchMove).toBe(true);
    expect(mockLastInstance?.params.grabCursor).toBe(true);
  });

  it("disables touch/drag handling entirely when draggable is turned off, independent of continuousAutoplay", () => {
    const container = buildContainer(3);

    SwiperInit(container, { draggable: false });

    expect(mockLastInstance?.params.simulateTouch).toBe(false);
    expect(mockLastInstance?.params.allowTouchMove).toBe(false);
    expect(mockLastInstance?.params.grabCursor).toBe(false);
  });

  describe("continuousAutoplay — config", () => {
    it("enables freeMode with momentum off, no sticky snapping — a real linear ticker", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(mockLastInstance?.params.freeMode).toEqual({
        enabled: true,
        momentum: false,
        sticky: false,
      });
    });

    it("uses a near-zero delay so the next transition starts as soon as the previous one ends, but starts disabled — the IntersectionObserver decides when it actually begins", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 5 });

      expect(mockLastInstance?.params.autoplay).toEqual({
        enabled: false,
        delay: 1,
        disableOnInteraction: false,
        pauseOnMouseEnter: false,
      });
    });

    it("uses autoplayTime as the continuous scroll speed, independent of the smoothTransition speed", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 8 });

      expect(mockLastInstance?.params.speed).toBe(8000);
    });

    it("defaults the continuous speed to 20s when no autoplayTime is given", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(mockLastInstance?.params.speed).toBe(20000);
    });

    it("does not also apply the smoothTransition touch spread — continuousAutoplay owns freeMode exclusively", () => {
      const container = buildContainer(3);

      SwiperInit(container, {
        continuousAutoplay: true,
        smoothTransition: true,
        autoplay: true,
      });

      expect(mockLastInstance?.params.followFinger).toBeUndefined();
      expect(mockLastInstance?.params.freeMode).toEqual({
        enabled: true,
        momentum: false,
        sticky: false,
      });
    });

    it("applies a linear transition-timing-function on the wrapper — without it, each per-slide transition eases in/out and the loop looks like it's speeding up and slowing down instead of one continuous motion", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(wrapper.style.transitionTimingFunction).toBe("linear");
    });

    it("keeps Swiper's own touch/drag handling enabled by default, even while the continuous ticker runs — draggable defaults to true so users can still manually swipe", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(mockLastInstance?.params.simulateTouch).toBe(true);
      expect(mockLastInstance?.params.allowTouchMove).toBe(true);
      expect(mockLastInstance?.params.grabCursor).toBe(true);
    });

    it("disables Swiper's own touch/drag handling when draggable is explicitly turned off — a mouse click still reaches swiper.animating while the ticker runs, and freeMode.onTouchStart() snaps to the transition's target translate (not the live interpolated position) whenever that path is reachable, which is exactly the visible jump this mode must never produce", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true, draggable: false });

      expect(mockLastInstance?.params.simulateTouch).toBe(false);
      expect(mockLastInstance?.params.allowTouchMove).toBe(false);
      expect(mockLastInstance?.params.grabCursor).toBe(false);
    });
  });

  describe("continuousAutoplay — starts once visible, not on init", () => {
    beforeEach(() => {
      mockIntersectionObserver();
    });

    it("does not start autoplay immediately on init", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(mockLastInstance?.autoplay.start).not.toHaveBeenCalled();
      expect(mockObserveSpy).toHaveBeenCalledWith(container);
    });

    it("starts autoplay once the carousel scrolls into view", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });
      fireIntersection(container, true);

      expect(mockLastInstance?.autoplay.start).toHaveBeenCalledTimes(1);
    });

    it("does not start while merely approaching but not yet intersecting", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });
      fireIntersection(container, false);

      expect(mockLastInstance?.autoplay.start).not.toHaveBeenCalled();
    });

    it("stops observing once started, so it never restarts on a later re-intersection", () => {
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });
      fireIntersection(container, true);
      fireIntersection(container, true);

      expect(mockUnobserveSpy).toHaveBeenCalledWith(container);
      expect(mockLastInstance?.autoplay.start).toHaveBeenCalledTimes(1);
    });

    it("falls back to starting immediately when IntersectionObserver is unsupported", () => {
      delete (globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver;
      const container = buildContainer(3);

      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(mockLastInstance?.autoplay.start).toHaveBeenCalledTimes(1);
    });
  });

  describe("continuousAutoplay — pause/resume on hover and focus, at any time", () => {
    beforeEach(() => {
      mockIntersectionObserver();
    });

    it("pauses on hover", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
    });

    it("resumes on hover-out by advancing to the next slide — no transition was interrupted (animating was false at pause time), so there is nothing to finish, only a new cycle to start", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 5 });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledWith(5000, true, true);
      expect(mockLastInstance?.autoplay.resume).not.toHaveBeenCalled();
    });

    it("pauses on focus entering the carousel", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const button = document.createElement("button");
      container.append(button);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("resumes once focus leaves the carousel entirely", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const button = document.createElement("button");
      const outside = document.createElement("button");
      container.append(button);
      document.body.append(outside);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      button.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: outside }));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("stays paused when focus moves between children inside the carousel", () => {
      const container = buildContainer(3);
      const first = document.createElement("button");
      const second = document.createElement("button");
      container.append(first, second);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      first.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      first.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: second }));

      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
    });

    it("does not resume on hover-out while still focused — both hover and focus must clear", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const button = document.createElement("button");
      const outside = document.createElement("button");
      container.append(button);
      document.body.append(outside);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    });

    it("resumes once the last of hover/focus clears, in either order", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const button = document.createElement("button");
      const outside = document.createElement("button");
      container.append(button);
      document.body.append(outside);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      container.dispatchEvent(new MouseEvent("mouseenter"));
      button.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: outside }));
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();

      container.dispatchEvent(new MouseEvent("mouseleave"));
      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("can be paused and resumed repeatedly at any time — not a one-shot gate", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      for (let i = 0; i < 3; i += 1) {
        container.dispatchEvent(new MouseEvent("mouseenter"));
        container.dispatchEvent(new MouseEvent("mouseleave"));
      }

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(3);
      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(3);
    });

    it("a bare click event never pauses — press-tracking is driven by pointerdown/pointerup, not click", () => {
      const container = buildContainer(3);
      document.body.append(container);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(mockLastInstance?.autoplay.pause).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    });

    it("resyncs the active index on autoplay start and resume in continuous mode too", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      mockOnHandlers.autoplayStart?.forEach((handler) => handler());
      mockOnHandlers.autoplayResume?.forEach((handler) => handler());

      expect(mockLastInstance?.updateActiveIndex).toHaveBeenCalledTimes(2);
    });

    function buildRealSlideStructure(container: HTMLElement) {
      const slide = container.querySelector(".swiper-slide") as HTMLElement;
      const coverInner = document.createElement("div");
      coverInner.className = "wp-block-cover__inner-container";
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = "Read more";
      coverInner.append(link);
      slide.append(coverInner);
      return link;
    }

    it("pauses on hover reaching a link nested several levels deep inside a slide (a real core/cover banner, not a direct child)", () => {
      const container = buildContainer(3);
      const link = buildRealSlideStructure(container);
      document.body.append(container);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("resumes once focus leaves a deeply nested link entirely, not just its immediate parent", () => {
      const container = buildContainer(3);
      const link = buildRealSlideStructure(container);
      document.body.append(container);
      const outside = document.createElement("button");
      document.body.append(outside);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      link.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: outside }));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("mouseenter/mouseleave bound directly on the container (not delegated) still catch a pointer that lands on a deeply nested slide child — the browser fires mouseenter on every ancestor whose box the pointer newly entered, not just the exact target", () => {
      const container = buildContainer(3);
      buildRealSlideStructure(container);
      document.body.append(container);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("freezes the wrapper at its live computed translate before pausing — swiper.autoplay.pause() alone lets the in-flight transition keep animating to its target and only stops the *next* cycle, which reads as 'nothing happened' on a fast continuous ticker", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      wrapper.style.transform = "matrix(1, 0, 0, 1, -337.5, 0)";
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.setTransition).toHaveBeenCalledWith(0);
      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(-337.5);
    });

    it("freezes correctly when the browser reports the wrapper transform as matrix3d() instead of matrix() — Swiper always sets translate3d(), and WebKit (Safari/iOS) preserves that as a 16-value matrix3d() with the x-translation at index 12, not 4; missing this made every mobile Safari freeze read translateX as 0 and snap the carousel back to its start on release", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      wrapper.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -337.5, 0, 0, 1)";
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.setTransition).toHaveBeenCalledWith(0);
      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(-337.5);
    });

    it("freezes using the transform value at the exact moment of pause, not a stale/rounded one", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      wrapper.style.transform = "matrix(1, 0, 0, 1, -812.25, 0)";
      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(-812.25);
    });

    it("does not call setTransition/setTranslate when there is no transform yet (translate 0)", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.setTransition).toHaveBeenCalledWith(0);
      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(0);
    });

    it("resets swiper.animating to false after freezing — a killed 0-duration transition never fires a real transitionend, so a stale animating:true would permanently block every future slideTo() from re-arming its own completion tracking, silently breaking resume forever (confirmed via real Playwright e2e, not just this mock)", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });
      mockLastInstance!.animating = true;

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.animating).toBe(false);
    });

    it("never calls loopFix() on freeze — loopFix()'s DOM reorder (prepend/append duplicated loop slides) rotates which element occupies which slot even when it reports the wrapper translate as unchanged, so a fixed-position hover would silently freeze on a different slide's content than what was actually under the cursor (confirmed via real-browser probe: with a small slide count the reorder threshold is crossed on nearly every hover, deterministically shifting content by exactly one slide every time)", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.loopFix).not.toHaveBeenCalled();
    });

    it("does not re-freeze or re-pause when a second pause trigger fires while already paused — e.g. hovering in while already focus-paused", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const button = document.createElement("button");
      container.append(button);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      button.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      container.dispatchEvent(new MouseEvent("mouseenter"));

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
      expect(mockLastInstance?.setTransition).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("pauses on pointerdown anywhere inside the carousel — including plain non-focusable slide text, not just links/buttons", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      text.textContent = "Banner heading";
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("resumes once pointerup fires anywhere in the document, including inside the carousel itself — press-release is location-independent, unlike the old outside-click-only design", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      text.dispatchEvent(new Event("pointerup", { bubbles: true }));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("resumes once pointerup fires outside the carousel too", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      const outside = document.createElement("div");
      container.append(text);
      document.body.append(outside);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      outside.dispatchEvent(new Event("pointerup", { bubbles: true }));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("a pointercancel (e.g. an OS/browser gesture interrupting the drag) also releases a stuck press", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      document.dispatchEvent(new Event("pointercancel", { bubbles: true }));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("re-checks the real cursor position on release instead of trusting a stale hover flag — a spurious mouseleave firing mid-drag (a known browser quirk during fast pointer movement/reflow) must not resume autoplay while the mouse pointer is still genuinely over the carousel on release", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      container.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 200,
          bottom: 200,
          width: 200,
          height: 200,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      container.dispatchEvent(new MouseEvent("mouseleave"));
      text.dispatchEvent(
        new MouseEvent("pointerup", { bubbles: true, clientX: 100, clientY: 100 })
      );

      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();

      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("re-asserts pause on release when still hovering — overrides Swiper's own FreeMode module, which force-resumes autoplay via _freeModeStaticRelease once a drag has lasted past its internal 200ms sliderFirstMove threshold, regardless of our own hover state", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      container.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 200,
          bottom: 200,
          width: 200,
          height: 200,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      const pauseCallsBeforeRelease = mockLastInstance!.autoplay.pause.mock.calls.length;

      // Simulate Swiper's own internal FreeMode+Autoplay interaction forcing
      // a resume the instant the drag ends, as it does for any drag lasting
      // past its own 200ms threshold — this happens synchronously inside
      // Swiper's core touchend handling, before our own release logic runs.
      mockLastInstance!.autoplay.resume();
      text.dispatchEvent(
        new MouseEvent("pointerup", { bubbles: true, clientX: 100, clientY: 100 })
      );

      expect(mockLastInstance?.autoplay.pause.mock.calls.length).toBeGreaterThan(
        pauseCallsBeforeRelease
      );
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    });

    it("re-asserts pause on release for a touch drag too, even though touch never sets hovered/focused — a touch release used to skip the FreeMode override entirely and let it force-resume unguarded", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      const pauseCallsBeforeRelease = mockLastInstance!.autoplay.pause.mock.calls.length;

      // Simulate Swiper's own internal FreeMode+Autoplay interaction forcing
      // a resume the instant the drag ends, exactly as it does for a mouse
      // drag — this happens synchronously inside Swiper's core touchend
      // handling, before our own release logic runs.
      mockLastInstance!.autoplay.resume();
      const touchPointerUp = new Event("pointerup", { bubbles: true }) as PointerEvent;
      Object.defineProperty(touchPointerUp, "pointerType", { value: "touch" });
      text.dispatchEvent(touchPointerUp);

      expect(mockLastInstance?.autoplay.pause.mock.calls.length).toBeGreaterThan(
        pauseCallsBeforeRelease
      );
      document.body.innerHTML = "";
    });

    it("resumes on release when the pointer's real position is genuinely outside the carousel bounds, even without an accompanying mouseleave", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      container.getBoundingClientRect = () =>
        ({
          left: 0,
          top: 0,
          right: 200,
          bottom: 200,
          width: 200,
          height: 200,
          x: 0,
          y: 0,
          toJSON: () => ({}),
        }) as DOMRect;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      text.dispatchEvent(
        new MouseEvent("pointerup", { bubbles: true, clientX: 500, clientY: 500 })
      );

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("ignores a stray pointerup with no preceding press — does not double-resume or throw", () => {
      const container = buildContainer(3);
      document.body.append(container);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      expect(() => document.dispatchEvent(new Event("pointerup", { bubbles: true }))).not.toThrow();
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    });

    it("reproduces hover-in, press (pointerdown) inside, then hover-out — stays paused through both, resumes cleanly only once pointerup finally fires", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      container.dispatchEvent(new MouseEvent("mouseleave"));
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();

      text.dispatchEvent(new Event("pointerup", { bubbles: true }));
      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("stays paused for the whole duration of a drag while the pointer is still held, even if the drag crosses a slide boundary (freeMode momentum/translate changing mid-gesture)", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      wrapper.style.transform = "matrix(1, 0, 0, 1, -450, 0)";

      expect(mockLastInstance?.autoplay.pause).toHaveBeenCalledTimes(1);
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    });

    it("saves the drag-end position at release time so the eventual resume starts from wherever the drag actually left off, not the pre-drag freeze point — regression: this used to rely on Swiper's own semantic 'touchEnd' event firing before our pointerup handler, but under real/emulated touch that ordering isn't guaranteed (confirmed via Chrome's Input.emulateTouchFromMouseEvent, the exact mechanism DevTools' device toolbar uses), so the drag-end position is now captured directly on pointerup instead", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 10 });
      mockLastInstance!.snapGrid = [0, 300, 600];

      text.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      wrapper.style.transform = "matrix(1, 0, 0, 1, -200, 0)";
      text.dispatchEvent(new Event("pointerup", { bubbles: true }));

      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(-300);
      const [catchUpDuration] = mockLastInstance!.setTransition.mock.calls.at(-1) as [number];
      expect(catchUpDuration).toBeLessThan(10000);
      expect(catchUpDuration).toBeGreaterThanOrEqual(50);

      wrapper.dispatchEvent(new Event("transitionend"));
      expect(mockLastInstance?.slideNext).toHaveBeenCalledWith(10000, true, true);
      document.body.innerHTML = "";
    });

    it("clears a stale hovered flag on a touch-typed release — Chrome's touch-from-mouse emulation (what DevTools' device toolbar uses for a mouse-driven touch drag) fires a genuine mouseenter alongside the synthetic touch events with no matching mouseleave, which would otherwise leave hovered stuck true forever and permanently block any resume, since real touch has no hover concept at all", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const text = document.createElement("p");
      container.append(text);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      const touchPointerDown = new Event("pointerdown", { bubbles: true }) as PointerEvent;
      Object.defineProperty(touchPointerDown, "pointerType", { value: "touch" });
      text.dispatchEvent(touchPointerDown);

      const touchPointerUp = new Event("pointerup", { bubbles: true }) as PointerEvent;
      Object.defineProperty(touchPointerUp, "pointerType", { value: "touch" });
      text.dispatchEvent(touchPointerUp);

      expect(mockLastInstance?.slideNext).toHaveBeenCalledTimes(1);
      document.body.innerHTML = "";
    });

    it("resumes by finishing the interrupted transition via the next full cycle — reads whether Swiper's own animating flag was true at the moment of pause (a live position/state signal, never a timer). Falls back to a synchronous full-speed slideNext() when snapGrid data isn't available to compute a catch-up target", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 20 });
      mockLastInstance!.animating = true;
      mockLastInstance!.activeIndex = 2;

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledWith(20000, true, true);
      expect(mockLastInstance?.autoplay.resume).not.toHaveBeenCalled();
    });

    it("scales the resumed catch-up's duration to the remaining distance — finishing an interrupted transition at the full nominal speed would cover less ground in the same time, visibly slowing the ticker down until the next natural cycle restores it", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 10 });
      mockLastInstance!.animating = true;
      mockLastInstance!.activeIndex = 1;
      mockLastInstance!.snapGrid = [0, 300, 600];
      wrapper.style.transform = "matrix(1, 0, 0, 1, -150, 0)";

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.setTransition).toHaveBeenCalledWith(5000);
      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(-300);
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();

      wrapper.dispatchEvent(new Event("transitionend"));
      expect(mockLastInstance?.slideNext).toHaveBeenCalledWith(10000, true, true);
    });

    it("never re-navigates via slideTo()/slideNext() with a computed partial duration for the catch-up itself — even a near-zero remaining distance (frozen right at the edge of its grid target) animates the raw translate directly and only calls slideNext() once that catch-up genuinely finishes, avoiding the loop-boundary reindex jump a same-target slideTo() could trip (confirmed via real-site Playwright velocity sampling)", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 10 });
      mockLastInstance!.animating = true;
      mockLastInstance!.activeIndex = 1;
      mockLastInstance!.snapGrid = [0, 300, 600];
      wrapper.style.transform = "matrix(1, 0, 0, 1, -299.9, 0)";

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.slideTo).not.toHaveBeenCalled();
      expect(mockLastInstance?.setTransition).toHaveBeenCalledWith(50);
      expect(mockLastInstance?.setTranslate).toHaveBeenCalledWith(-300);
      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();

      wrapper.dispatchEvent(new Event("transitionend"));
      expect(mockLastInstance?.slideTo).not.toHaveBeenCalled();
      expect(mockLastInstance?.slideNext).toHaveBeenCalledWith(10000, true, true);
    });

    it("still scales the catch-up's duration down to a small floor for a genuinely short (but not negligible) remaining distance", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 10 });
      mockLastInstance!.animating = true;
      mockLastInstance!.activeIndex = 1;
      mockLastInstance!.snapGrid = [0, 300, 600];
      wrapper.style.transform = "matrix(1, 0, 0, 1, -280, 0)";

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      const [catchUpDuration] = mockLastInstance!.setTransition.mock.calls.at(-1) as [number];
      expect(catchUpDuration).toBeGreaterThanOrEqual(50);
    });

    it("does not finish the catch-up (never calls the deferred slideNext) when the transitionend fires on a different element — ignores bubbled/child transitions on the wrapper's own listener", () => {
      const container = buildContainer(3);
      const wrapper = container.querySelector(".swiper-wrapper") as HTMLElement;
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 10 });
      mockLastInstance!.animating = true;
      mockLastInstance!.activeIndex = 1;
      mockLastInstance!.snapGrid = [0, 300, 600];
      wrapper.style.transform = "matrix(1, 0, 0, 1, -150, 0)";

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      const unrelated = document.createElement("div");
      wrapper.append(unrelated);
      unrelated.dispatchEvent(new Event("transitionend", { bubbles: true }));

      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
    });

    it("advances to a genuinely new slide on resume when paused between cycles — animating was false at pause time, so there is no in-flight transition to finish", () => {
      const container = buildContainer(3);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 20 });
      mockLastInstance!.animating = false;

      container.dispatchEvent(new MouseEvent("mouseenter"));
      container.dispatchEvent(new MouseEvent("mouseleave"));

      expect(mockLastInstance?.slideNext).toHaveBeenCalledWith(20000, true, true);
      expect(mockLastInstance?.slideTo).not.toHaveBeenCalled();
      expect(mockLastInstance?.autoplay.resume).not.toHaveBeenCalled();
    });

    it("a click event (with no pointerdown/pointerup) never affects pause state — still hovering stays paused, a bare click resumes nothing", () => {
      const container = buildContainer(3);
      document.body.append(container);
      const outside = document.createElement("div");
      document.body.append(outside);
      SwiperInit(container, { continuousAutoplay: true, autoplay: true });

      container.dispatchEvent(new MouseEvent("mouseenter"));
      outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      expect(mockLastInstance?.slideNext).not.toHaveBeenCalled();
      expect(mockLastInstance?.slideTo).not.toHaveBeenCalled();
      document.body.innerHTML = "";
    });
  });

  describe("progress circle — discrete autoplay only", () => {
    function buildProgressCircle(radius = 16) {
      const svgNS = "http://www.w3.org/2000/svg";
      const wrap = document.createElement("div");
      wrap.className = "swiper-progress";
      const circle = document.createElementNS(svgNS, "circle") as unknown as SVGCircleElement;
      circle.setAttribute("class", "swiper-progress-fill");
      circle.setAttribute("r", String(radius));
      wrap.append(circle as unknown as Node);
      return { wrap, circle };
    }

    it("sets the initial dasharray/dashoffset from the circle's radius so it starts empty", () => {
      const container = buildContainer(3);
      const { wrap, circle } = buildProgressCircle(16);
      container.append(wrap);

      SwiperInit(container, { autoplay: true, autoplayTime: 5 });

      const circumference = String(2 * Math.PI * 16);
      expect(circle.style.strokeDasharray).toBe(circumference);
      expect(circle.style.strokeDashoffset).toBe(circumference);
    });

    it("fills the ring as autoplayTimeLeft's percentage counts down toward the next slide", () => {
      const container = buildContainer(3);
      const { wrap, circle } = buildProgressCircle(10);
      container.append(wrap);
      const circumference = 2 * Math.PI * 10;

      SwiperInit(container, { autoplay: true, autoplayTime: 5 });
      mockOnHandlers.autoplayTimeLeft?.forEach((handler) => handler(mockLastInstance, 2500, 0.5));

      expect(circle.style.strokeDashoffset).toBe(String(circumference * 0.5));
    });

    it("does nothing when no progress element is present", () => {
      const container = buildContainer(3);

      expect(() => SwiperInit(container, { autoplay: true, autoplayTime: 5 })).not.toThrow();
    });

    it("is not wired at all in continuousAutoplay mode, even if a progress element is present", () => {
      const container = buildContainer(3);
      const { wrap, circle } = buildProgressCircle(16);
      container.append(wrap);
      mockIntersectionObserver();

      SwiperInit(container, { continuousAutoplay: true, autoplay: true, autoplayTime: 5 });
      mockOnHandlers.autoplayTimeLeft?.forEach((handler) => handler(mockLastInstance, 2500, 0.5));

      expect(circle.style.strokeDashoffset).toBe("");
    });
  });

  describe("pagination resync on full page load — self-corrects a bullet count that raced with slidesPerView:'auto' measurement, CSS, or images still loading during init", () => {
    let originalReadyState: DocumentReadyState;

    beforeEach(() => {
      originalReadyState = document.readyState;
    });

    afterEach(() => {
      Object.defineProperty(document, "readyState", {
        configurable: true,
        get: () => originalReadyState,
      });
    });

    function buildPagination() {
      const pagination = document.createElement("div");
      pagination.className = "swiper-pagination";
      return pagination;
    }

    function mockReadyState(value: DocumentReadyState) {
      Object.defineProperty(document, "readyState", {
        configurable: true,
        get: () => value,
      });
    }

    it("re-measures and re-renders pagination immediately when the document is already fully loaded", () => {
      mockReadyState("complete");
      const rafSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb: FrameRequestCallback) => {
          cb(0);
          return 0;
        });
      const container = buildContainer(3);
      container.append(buildPagination());

      SwiperInit(container, { pagination: true });

      expect(mockLastInstance?.update).toHaveBeenCalled();
      expect(mockLastInstance?.pagination.render).toHaveBeenCalled();
      expect(mockLastInstance?.pagination.update).toHaveBeenCalled();
      rafSpy.mockRestore();
    });

    it("waits for the window load event before re-measuring when the document is still loading — CSS/images/fonts may not have settled yet", () => {
      mockReadyState("loading");
      const rafSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb: FrameRequestCallback) => {
          cb(0);
          return 0;
        });
      const container = buildContainer(3);
      container.append(buildPagination());

      SwiperInit(container, { pagination: true });

      expect(mockLastInstance?.update).not.toHaveBeenCalled();

      window.dispatchEvent(new Event("load"));

      expect(mockLastInstance?.update).toHaveBeenCalled();
      expect(mockLastInstance?.pagination.render).toHaveBeenCalled();
      expect(mockLastInstance?.pagination.update).toHaveBeenCalled();
      rafSpy.mockRestore();
    });

    it("does not resync when pagination is disabled — nothing to self-correct", () => {
      mockReadyState("complete");
      const rafSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb: FrameRequestCallback) => {
          cb(0);
          return 0;
        });
      const container = buildContainer(3);

      SwiperInit(container, { pagination: false });

      expect(mockLastInstance?.update).not.toHaveBeenCalled();
      rafSpy.mockRestore();
    });

    it("does not resync a destroyed swiper instance — the load event can fire well after the block was removed from the page", () => {
      mockReadyState("loading");
      const rafSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb: FrameRequestCallback) => {
          cb(0);
          return 0;
        });
      const container = buildContainer(3);
      container.append(buildPagination());

      SwiperInit(container, { pagination: true });
      mockLastInstance!.destroyed = true;

      window.dispatchEvent(new Event("load"));

      expect(mockLastInstance?.update).not.toHaveBeenCalled();
      rafSpy.mockRestore();
    });
  });
});

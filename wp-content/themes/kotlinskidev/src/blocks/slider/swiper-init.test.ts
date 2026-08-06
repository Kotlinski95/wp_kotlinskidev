const mockOnHandlers: Record<string, Array<() => void>> = {};
let mockLastInstance: MockSwiper | null = null;

class MockSwiper {
  params: Record<string, unknown>;
  el: HTMLElement;
  autoplay = { stop: jest.fn(), start: jest.fn() };
  updateActiveIndex = jest.fn();

  constructor(el: HTMLElement, params: Record<string, unknown>) {
    this.el = el;
    this.params = params;
    mockLastInstance = this;
  }

  on(event: string, handler: () => void) {
    mockOnHandlers[event] = mockOnHandlers[event] ?? [];
    mockOnHandlers[event].push(handler);
  }
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
      pauseOnMouseEnter: true,
    });
  });

  it("uses a 1ms delay for smooth-transition autoplay", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true, autoplayTime: 4, smoothTransition: true });

    expect((mockLastInstance?.params.autoplay as { delay: number }).delay).toBe(1);
  });

  it("passes through a plain boolean autoplay when no autoplayTime is given", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true });

    expect(mockLastInstance?.params.autoplay).toBe(true);
  });

  it("sets pagination only when pagination is requested without scrollbar", () => {
    const container = buildContainer(3);

    SwiperInit(container, { pagination: true, scrollbar: false });

    expect(mockLastInstance?.params.pagination).toBe(true);
    expect(mockLastInstance?.params.scrollbar).toBeUndefined();
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

  it("uses a slower fixed speed for smooth transitions based on autoplayTime", () => {
    const container = buildContainer(3);

    SwiperInit(container, { smoothTransition: true, autoplayTime: 6 });

    expect(mockLastInstance?.params.speed).toBe(6000);
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

  it("stops autoplay when the container is clicked", () => {
    const container = buildContainer(3);
    document.body.append(container);

    SwiperInit(container, { autoplay: true });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.stop).toHaveBeenCalled();
    document.body.innerHTML = "";
  });

  it("resumes autoplay on an outside click only after the user had interacted", () => {
    const container = buildContainer(3);
    document.body.append(container);

    SwiperInit(container, { autoplay: true });
    const outside = document.createElement("div");
    document.body.append(outside);

    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(mockLastInstance?.autoplay.start).not.toHaveBeenCalled();

    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    outside.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.start).toHaveBeenCalled();
    document.body.innerHTML = "";
  });

  it("resyncs the active index on autoplay start and resume", () => {
    const container = buildContainer(3);

    SwiperInit(container, { autoplay: true });
    mockOnHandlers.autoplayStart?.forEach((handler) => handler());
    mockOnHandlers.autoplayResume?.forEach((handler) => handler());

    expect(mockLastInstance?.updateActiveIndex).toHaveBeenCalledTimes(2);
  });

  it("does not wire autoplay click handling when autoplay is disabled", () => {
    const container = buildContainer(3);
    document.body.append(container);

    SwiperInit(container, { autoplay: false });
    container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(mockLastInstance?.autoplay.stop).not.toHaveBeenCalled();
    document.body.innerHTML = "";
  });
});

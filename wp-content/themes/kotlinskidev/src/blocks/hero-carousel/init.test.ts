type IntersectionCallback = (
  entries: Array<{ isIntersecting: boolean; target: Element }>,
  observer: { unobserve: (el: Element) => void }
) => void;

let mockIntersectionCallback: IntersectionCallback | null = null;
let mockIntersectionOptions: IntersectionObserverInit | undefined;
let mockObserveSpy: jest.Mock;
let mockUnobserveSpy: jest.Mock;

function mockIntersectionObserver() {
  mockObserveSpy = jest.fn();
  mockUnobserveSpy = jest.fn();

  class MockIntersectionObserver {
    constructor(cb: IntersectionCallback, options: IntersectionObserverInit) {
      mockIntersectionCallback = cb;
      mockIntersectionOptions = options;
    }
    observe = mockObserveSpy;
    unobserve = mockUnobserveSpy;
    disconnect = jest.fn();
  }

  (globalThis.window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    MockIntersectionObserver;
}

interface FakeSwiper {
  slides: HTMLElement[];
  activeIndex: number;
  previousIndex: number;
  on: jest.Mock;
}

let mockInitSwiperReturn: FakeSwiper;

jest.mock("@utils/carousel/initSwiper", () => ({
  initSwiper: jest.fn(() => mockInitSwiperReturn),
}));

function buildSlide({
  video,
  lazyImg,
}: { video?: { dataSrc?: string; dataPoster?: string }; lazyImg?: boolean } = {}) {
  const slide = document.createElement("div");
  if (video) {
    const videoEl = document.createElement("video");
    if (video.dataSrc) {
      videoEl.dataset.src = video.dataSrc;
    }
    if (video.dataPoster) {
      videoEl.dataset.poster = video.dataPoster;
    }
    jest.spyOn(videoEl, "play").mockReturnValue(Promise.resolve());
    jest.spyOn(videoEl, "pause").mockImplementation(() => {});
    slide.append(videoEl);
  }
  if (lazyImg) {
    const img = document.createElement("img");
    img.loading = "lazy";
    img.src = "photo.jpg";
    slide.append(img);
  }
  return slide;
}

function buildCarouselElement(settings: Record<string, unknown> = {}) {
  document.body.innerHTML = "";
  const el = document.createElement("div");
  el.className = "hero-carousel__swiper";
  el.setAttribute("data-carousel-settings", JSON.stringify(settings));
  document.body.append(el);
  return el;
}

function loadModule() {
  jest.resetModules();
  mockIntersectionCallback = null;
  require("./init");
}

describe("hero-carousel/init.ts", () => {
  beforeEach(() => {
    mockIntersectionObserver();
  });

  afterEach(() => {
    delete (globalThis.window as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    document.body.innerHTML = "";
  });

  it("does nothing when there are no hero carousel elements", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
    expect(mockObserveSpy).not.toHaveBeenCalled();
  });

  it("observes the element with a large root margin by default", () => {
    buildCarouselElement();

    loadModule();

    expect(mockObserveSpy).toHaveBeenCalledTimes(1);
    expect(mockIntersectionOptions?.rootMargin).toBe("200px 0px");
  });

  it("uses a zero root margin when lazyLoad is enabled in settings", () => {
    buildCarouselElement({ lazyLoad: true });

    loadModule();

    expect(mockIntersectionOptions?.rootMargin).toBe("0px");
  });

  it("does not initialize the carousel before it intersects", () => {
    const el = buildCarouselElement();
    mockInitSwiperReturn = { slides: [], activeIndex: 0, previousIndex: 0, on: jest.fn() };
    loadModule();

    mockIntersectionCallback?.([{ isIntersecting: false, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    expect(mockUnobserveSpy).not.toHaveBeenCalled();
  });

  it("initializes the swiper and toggles visibility once the carousel intersects", () => {
    const el = buildCarouselElement();
    mockInitSwiperReturn = { slides: [], activeIndex: 0, previousIndex: 0, on: jest.fn() };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    expect(el.style.visibility).toBe("visible");
    expect(mockUnobserveSpy).toHaveBeenCalledWith(el);
  });

  it("preloads images and prepares video sources for non-active slides only", () => {
    const el = buildCarouselElement();
    const activeSlide = buildSlide({ lazyImg: true });
    const otherSlide = buildSlide({
      lazyImg: true,
      video: { dataSrc: "b.mp4", dataPoster: "b.jpg" },
    });
    mockInitSwiperReturn = {
      slides: [activeSlide, otherSlide],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
    };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    expect(activeSlide.querySelector("img")?.loading).toBe("lazy");
    expect(otherSlide.querySelector("img")?.loading).toBe("eager");
    const otherVideo = otherSlide.querySelector("video") as HTMLVideoElement;
    expect(otherVideo.src).toContain("b.mp4");
    expect(otherVideo.poster).toContain("b.jpg");
  });

  it("plays the active slide's video once initialized", () => {
    const el = buildCarouselElement();
    const activeSlide = buildSlide({ video: {} });
    mockInitSwiperReturn = {
      slides: [activeSlide],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
    };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    expect(activeSlide.querySelector("video")?.play).toHaveBeenCalled();
  });

  it("pauses the previous slide's video on slideChangeTransitionStart", () => {
    const el = buildCarouselElement();
    const slideA = buildSlide({ video: {} });
    const slideB = buildSlide({ video: {} });
    const onHandlers: Record<string, () => void> = {};
    mockInitSwiperReturn = {
      slides: [slideA, slideB],
      activeIndex: 1,
      previousIndex: 0,
      on: jest.fn((event: string, handler: () => void) => {
        onHandlers[event] = handler;
      }),
    };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });
    onHandlers.slideChangeTransitionStart();

    expect(slideA.querySelector("video")?.pause).toHaveBeenCalled();
  });

  it("plays the new active slide's video on slideChangeTransitionEnd", () => {
    const el = buildCarouselElement();
    const slideA = buildSlide({ video: {} });
    const slideB = buildSlide({ video: {} });
    const onHandlers: Record<string, () => void> = {};
    mockInitSwiperReturn = {
      slides: [slideA, slideB],
      activeIndex: 1,
      previousIndex: 0,
      on: jest.fn((event: string, handler: () => void) => {
        onHandlers[event] = handler;
      }),
    };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });
    onHandlers.slideChangeTransitionEnd();

    expect(slideB.querySelector("video")?.play).toHaveBeenCalled();
  });
});

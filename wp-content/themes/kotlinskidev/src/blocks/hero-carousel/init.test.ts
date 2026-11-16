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
  update?: jest.Mock;
  slideNext?: jest.Mock;
  slidePrev?: jest.Mock;
  slideTo?: jest.Mock;
  autoplay?: { pause: jest.Mock; resume: jest.Mock };
}

let mockInitSwiperReturn: FakeSwiper;

jest.mock("@utils/carousel/initSwiper", () => ({
  initSwiper: jest.fn(() => mockInitSwiperReturn),
}));

function buildSlide({
  video,
  lazyImg,
}: {
  video?: {
    dataSrc?: string;
    dataPoster?: string;
    dataSrcAlpha?: string;
    dataPosterMobile?: string;
  };
  lazyImg?: boolean;
} = {}) {
  const slide = document.createElement("div");
  if (video) {
    const videoEl = document.createElement("video");
    if (video.dataSrc) {
      videoEl.dataset.src = video.dataSrc;
    }
    if (video.dataSrcAlpha) {
      videoEl.dataset.srcAlpha = video.dataSrcAlpha;
    }
    if (video.dataPoster) {
      videoEl.dataset.poster = video.dataPoster;
    }
    if (video.dataPosterMobile) {
      videoEl.dataset.ktPosterMobile = video.dataPosterMobile;
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

async function flushPromises() {
  for (let i = 0; i < 10; i += 1) {
    await Promise.resolve();
  }
}

async function intersect(el: HTMLElement) {
  mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
    unobserve: mockUnobserveSpy,
  });
  window.dispatchEvent(new Event("pointerdown"));
  await flushPromises();
}

const mockMobileViewport = (): (() => void) => {
  const original = window.matchMedia;
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: query === "(max-width: 781px)" || query === "(max-width: 1023px)",
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })) as unknown as typeof window.matchMedia;
  return () => {
    window.matchMedia = original;
  };
};

describe("hero-carousel/init.ts", () => {
  beforeEach(() => {
    mockIntersectionObserver();
    (window as unknown as { scheduler: { yield: () => Promise<void> } }).scheduler = {
      yield: () => Promise.resolve(),
    };
  });

  afterEach(() => {
    delete (globalThis.window as unknown as { IntersectionObserver?: unknown })
      .IntersectionObserver;
    delete (globalThis.window as unknown as { scheduler?: unknown }).scheduler;
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
    mockInitSwiperReturn = {
      slides: [],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
    };
    loadModule();

    mockIntersectionCallback?.([{ isIntersecting: false, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    expect(mockUnobserveSpy).not.toHaveBeenCalled();
  });

  it("initializes the swiper and toggles visibility once the carousel intersects", async () => {
    const el = buildCarouselElement();
    mockInitSwiperReturn = {
      slides: [],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
    };

    loadModule();
    await intersect(el);

    expect(el.style.visibility).toBe("visible");
    expect(mockUnobserveSpy).toHaveBeenCalledWith(el);
  });

  it("prepares the active slide's video and, for the next slide, only its poster and images", async () => {
    const el = buildCarouselElement();
    const activeSlide = buildSlide({ lazyImg: true, video: { dataSrc: "a.mp4" } });
    const otherSlide = buildSlide({
      lazyImg: true,
      video: { dataSrc: "b.mp4", dataPoster: "b.jpg" },
    });
    const farSlide = buildSlide({
      lazyImg: true,
      video: { dataSrc: "c.mp4", dataPoster: "c.jpg" },
    });
    mockInitSwiperReturn = {
      slides: [activeSlide, otherSlide, farSlide],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
    };

    loadModule();
    await intersect(el);

    const otherVideo = otherSlide.querySelector("video") as HTMLVideoElement;
    const farVideo = farSlide.querySelector("video") as HTMLVideoElement;
    expect((activeSlide.querySelector("video") as HTMLVideoElement).src).toContain("a.mp4");
    expect(activeSlide.querySelector("img")?.loading).toBe("eager");
    expect(otherSlide.querySelector("img")?.loading).toBe("eager");
    expect(otherVideo.src).toBe("");
    expect(otherVideo.poster).toContain("b.jpg");
    expect(farSlide.querySelector("img")?.loading).toBe("lazy");
    expect(farVideo.src).toBe("");
    expect(farVideo.poster).toBe("");
  });

  it("yields to the main thread between init steps", async () => {
    const yieldSpy = jest.fn(() => Promise.resolve());
    (window as unknown as { scheduler: { yield: () => Promise<void> } }).scheduler = {
      yield: yieldSpy,
    };
    const el = buildCarouselElement();
    mockInitSwiperReturn = {
      slides: [],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
    };
    loadModule();
    await intersect(el);

    expect(yieldSpy).toHaveBeenCalledTimes(2);
  });

  describe("late initialization", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    const observe = () => {
      const el = buildCarouselElement();
      mockInitSwiperReturn = {
        slides: [],
        activeIndex: 0,
        previousIndex: 0,
        on: jest.fn(),
        update: jest.fn(),
      };
      loadModule();
      mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
        unobserve: mockUnobserveSpy,
      });
      return el;
    };

    it("does not create the swiper until the page is idle or the user interacts", async () => {
      jest.useFakeTimers();
      observe();
      const { initSwiper } = jest.requireMock("@utils/carousel/initSwiper") as {
        initSwiper: jest.Mock;
      };
      await flushPromises();

      expect(initSwiper).not.toHaveBeenCalled();
    });

    it("creates the swiper once the idle timeout elapses", async () => {
      jest.useFakeTimers();
      observe();
      const { initSwiper } = jest.requireMock("@utils/carousel/initSwiper") as {
        initSwiper: jest.Mock;
      };

      jest.advanceTimersByTime(1300);
      await flushPromises();

      expect(initSwiper).toHaveBeenCalledTimes(1);
    });

    it.each(["pointerdown", "keydown", "touchstart", "wheel", "scroll"])(
      "creates the swiper early on %s",
      async (type) => {
        jest.useFakeTimers();
        observe();
        const { initSwiper } = jest.requireMock("@utils/carousel/initSwiper") as {
          initSwiper: jest.Mock;
        };

        window.dispatchEvent(new Event(type));
        await flushPromises();

        expect(initSwiper).toHaveBeenCalled();
      }
    );
  });

  it("prepares the target and following slide on slideChangeTransitionStart", async () => {
    const el = buildCarouselElement();
    const slides = [
      buildSlide({ video: {} }),
      buildSlide({ video: { dataSrc: "b.mp4" } }),
      buildSlide({ video: { dataSrc: "c.mp4" } }),
      buildSlide({ video: { dataSrc: "d.mp4" } }),
    ];
    const onHandlers: Record<string, () => void> = {};
    mockInitSwiperReturn = {
      slides,
      activeIndex: 1,
      previousIndex: 0,
      on: jest.fn((event: string, handler: () => void) => {
        onHandlers[event] = handler;
      }),
      update: jest.fn(),
    };

    loadModule();
    await intersect(el);
    onHandlers.slideChangeTransitionStart();

    expect((slides[1].querySelector("video") as HTMLVideoElement).src).toContain("b.mp4");
    expect((slides[2].querySelector("video") as HTMLVideoElement).src).toContain("c.mp4");
    expect((slides[3].querySelector("video") as HTMLVideoElement).src).toBe("");
  });

  describe("navigation clicked before swiper init", () => {
    const setup = () => {
      const el = buildCarouselElement();
      el.innerHTML =
        '<div class="swiper-button-prev"></div><div class="swiper-button-next"></div><div class="swiper-pagination"><span class="swiper-pagination-bullet"></span><span class="swiper-pagination-bullet"></span></div>';
      mockInitSwiperReturn = {
        slides: [buildSlide()],
        activeIndex: 0,
        previousIndex: 0,
        on: jest.fn(),
        update: jest.fn(),
        slideNext: jest.fn(),
        slidePrev: jest.fn(),
        slideTo: jest.fn(),
      };
      loadModule();
      return el;
    };

    it("replays a next-arrow click once init completes", async () => {
      const el = setup();
      el.querySelector<HTMLElement>(".swiper-button-next")?.click();
      await intersect(el);

      expect(mockInitSwiperReturn.slideNext).toHaveBeenCalledTimes(1);
      expect(mockInitSwiperReturn.slidePrev).not.toHaveBeenCalled();
    });

    it("replays a prev-arrow click once init completes", async () => {
      const el = setup();
      el.querySelector<HTMLElement>(".swiper-button-prev")?.click();
      await intersect(el);

      expect(mockInitSwiperReturn.slidePrev).toHaveBeenCalledTimes(1);
    });

    it("replays a pagination bullet click as slideTo its index", async () => {
      const el = setup();
      el.querySelectorAll<HTMLElement>(".swiper-pagination-bullet")[1].click();
      await intersect(el);

      expect(mockInitSwiperReturn.slideTo).toHaveBeenCalledWith(1);
    });

    it("stops capturing clicks when swiper initialisation fails", async () => {
      const el = setup();
      const { initSwiper } = jest.requireMock("@utils/carousel/initSwiper") as {
        initSwiper: jest.Mock;
      };
      initSwiper.mockImplementationOnce(() => {
        throw new Error("init failed");
      });
      const removeSpy = jest.spyOn(el, "removeEventListener");
      await intersect(el);

      expect(removeSpy).toHaveBeenCalledWith("click", expect.any(Function));
    });

    it("does not replay clicks made after init completes", async () => {
      const el = setup();
      await intersect(el);
      el.querySelector<HTMLElement>(".swiper-button-next")?.click();

      expect(mockInitSwiperReturn.slideNext).not.toHaveBeenCalled();
    });
  });

  it("plays the active slide's video once the page settles", async () => {
    jest.useFakeTimers();
    const el = buildCarouselElement();
    const activeSlide = buildSlide({ video: {} });
    mockInitSwiperReturn = {
      slides: [activeSlide],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
    };

    loadModule();
    await intersect(el);

    jest.runAllTimers();

    expect(activeSlide.querySelector("video")?.play).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("pauses the previous slide's video on slideChangeTransitionStart", async () => {
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
      update: jest.fn(),
    };

    loadModule();
    await intersect(el);
    onHandlers.slideChangeTransitionStart();

    expect(slideA.querySelector("video")?.pause).toHaveBeenCalled();
  });

  it("plays the new active slide's video on slideChangeTransitionEnd", async () => {
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
      update: jest.fn(),
    };

    loadModule();
    await intersect(el);
    onHandlers.slideChangeTransitionEnd();

    expect(slideB.querySelector("video")?.play).toHaveBeenCalled();
  });

  it("pauses autoplay on hover and resumes on mouse leave", async () => {
    document.body.innerHTML = "";
    const carousel = document.createElement("div");
    carousel.className = "hero-carousel";
    const el = buildCarouselElement();
    carousel.append(el);
    document.body.append(carousel);
    const autoplay = { pause: jest.fn(), resume: jest.fn() };
    mockInitSwiperReturn = {
      slides: [],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
      autoplay,
    };

    loadModule();
    await intersect(el);

    carousel.dispatchEvent(new Event("mouseenter"));
    expect(autoplay.pause).toHaveBeenCalledTimes(1);

    carousel.dispatchEvent(new Event("mouseleave"));
    expect(autoplay.resume).toHaveBeenCalledTimes(1);
  });

  it("pauses autoplay while a slide has keyboard focus and resumes once focus leaves entirely", async () => {
    document.body.innerHTML = "";
    const carousel = document.createElement("div");
    carousel.className = "hero-carousel";
    const el = buildCarouselElement();
    const link = document.createElement("a");
    carousel.append(el, link);
    document.body.append(carousel);
    const autoplay = { pause: jest.fn(), resume: jest.fn() };
    mockInitSwiperReturn = {
      slides: [],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
      autoplay,
    };

    loadModule();
    await intersect(el);

    link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(autoplay.pause).toHaveBeenCalledTimes(1);

    carousel.dispatchEvent(
      new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body })
    );
    expect(autoplay.resume).toHaveBeenCalledTimes(1);
  });

  it("stays paused when focus moves between elements inside the carousel", async () => {
    document.body.innerHTML = "";
    const carousel = document.createElement("div");
    carousel.className = "hero-carousel";
    const el = buildCarouselElement();
    const linkA = document.createElement("a");
    const linkB = document.createElement("a");
    carousel.append(el, linkA, linkB);
    document.body.append(carousel);
    const autoplay = { pause: jest.fn(), resume: jest.fn() };
    mockInitSwiperReturn = {
      slides: [],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
      autoplay,
    };

    loadModule();
    await intersect(el);

    linkA.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(autoplay.pause).toHaveBeenCalledTimes(1);

    carousel.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: linkB }));
    expect(autoplay.resume).not.toHaveBeenCalled();
  });

  describe("poster, alpha source and reset", () => {
    const originalUserAgent = navigator.userAgent;
    const setUserAgent = (ua: string) =>
      Object.defineProperty(navigator, "userAgent", { configurable: true, value: ua });

    beforeEach(() => {
      jest
        .spyOn(HTMLCanvasElement.prototype, "getContext")
        .mockReturnValue({ clearRect: jest.fn(), drawImage: jest.fn() } as never);
    });

    afterEach(() => {
      setUserAgent(originalUserAgent);
      jest.restoreAllMocks();
    });

    const IPHONE_UA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    const CHROME_UA =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    const run = async (slides: HTMLElement[]) => {
      const el = buildCarouselElement();
      const onHandlers: Record<string, () => void> = {};
      mockInitSwiperReturn = {
        slides,
        activeIndex: 0,
        previousIndex: 0,
        on: jest.fn((event: string, handler: () => void) => {
          onHandlers[event] = handler;
        }),
        update: jest.fn(),
      };
      loadModule();
      await intersect(el);
      return onHandlers;
    };

    it("sets the poster of the next slide video at init while src stays lazy", async () => {
      const next = buildSlide({ video: { dataSrc: "b.mp4", dataPoster: "b.jpg" } });
      const far = buildSlide({ video: { dataSrc: "c.mp4", dataPoster: "c.jpg" } });
      await run([buildSlide({ video: { dataSrc: "a.mp4", dataPoster: "a.jpg" } }), next, far]);

      const nextVideo = next.querySelector("video") as HTMLVideoElement;
      const farVideo = far.querySelector("video") as HTMLVideoElement;
      expect(nextVideo.poster).toContain("b.jpg");
      expect(nextVideo.src).toBe("");
      expect(farVideo.poster).toBe("");
    });

    it("picks the mobile poster on narrow viewports", async () => {
      const restore = mockMobileViewport();
      const active = buildSlide({
        video: {
          dataSrc: "a.mp4",

          dataPoster: "a.jpg",
          dataPosterMobile: "a-m.jpg",
        },
      });
      await run([active]);

      const video = active.querySelector("video") as HTMLVideoElement;
      expect(video.src).toContain("a.mp4");
      expect(video.poster).toContain("a-m.jpg");
      restore();
    });

    it("keeps the desktop poster on wide viewports", async () => {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: 1600 });
      const active = buildSlide({
        video: {
          dataSrc: "a.mp4",

          dataPoster: "a.jpg",
          dataPosterMobile: "a-m.jpg",
        },
      });
      await run([active]);

      const video = active.querySelector("video") as HTMLVideoElement;
      expect(video.src).toContain("a.mp4");
      expect(video.poster).toContain("a.jpg");
    });

    it("marks the video as playing once it fires its playing event", async () => {
      const active = buildSlide({ video: { dataSrc: "a.mp4" } });
      await run([active]);

      const video = active.querySelector("video") as HTMLVideoElement;
      video.dispatchEvent(new Event("playing"));

      expect(video.classList.contains("is-playing")).toBe(true);
    });

    it("uses the alpha source on WebKit browsers", async () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({ video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov" } });
      await run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.mov");
    });

    it("draws the alpha video through a canvas on iOS WebKit", async () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({
        video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov", dataPoster: "a.webp" },
      });
      await run([slide]);

      expect(slide.querySelector("canvas.hero-carousel__alpha-canvas")).not.toBeNull();
      expect(slide.classList.contains("hero-carousel__bg--alpha-canvas")).toBe(true);
    });

    it("keeps the native video on desktop Safari even with an alpha source", async () => {
      setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      );
      const slide = buildSlide({ video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov" } });
      await run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.mov");
      expect(slide.querySelector("canvas")).toBeNull();
    });

    it("holds an opaque slide video behind its poster on iOS until the first frame", async () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({ video: { dataSrc: "a.mp4", dataPoster: "a.webp" } });
      const video = slide.querySelector("video") as HTMLVideoElement;
      const bg = document.createElement("div");
      bg.className = "hero-carousel__bg";
      slide.append(bg);
      bg.append(video);
      await run([slide]);

      expect(bg.classList.contains("hero-carousel__bg--video-pending")).toBe(true);
      expect(bg.style.getPropertyValue("--kt-hero-poster")).toContain("a.webp");
    });

    it("does not hold slide videos outside iOS", async () => {
      setUserAgent(CHROME_UA);
      const slide = buildSlide({ video: { dataSrc: "a.mp4", dataPoster: "a.webp" } });
      const video = slide.querySelector("video") as HTMLVideoElement;
      const bg = document.createElement("div");
      bg.className = "hero-carousel__bg";
      slide.append(bg);
      bg.append(video);
      await run([slide]);

      expect(bg.classList.contains("hero-carousel__bg--video-pending")).toBe(false);
    });

    it("keeps the data-src source on non-WebKit browsers even with an alpha source", async () => {
      setUserAgent(CHROME_UA);
      const slide = buildSlide({ video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov" } });
      await run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.webm");
    });

    it("keeps the data-src source on WebKit browsers when no alpha source is set", async () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({ video: { dataSrc: "a.webm" } });
      await run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.webm");
    });

    it("pauses without rewinding the outgoing video, then rewinds it at transition end", async () => {
      const outgoing = buildSlide({ video: { dataSrc: "a.webm" } });
      const incoming = buildSlide({ video: { dataSrc: "b.webm" } });
      const handlers = await run([outgoing, incoming]);
      const outgoingVideo = outgoing.querySelector("video") as HTMLVideoElement;
      outgoingVideo.currentTime = 3;
      mockInitSwiperReturn.previousIndex = 0;
      mockInitSwiperReturn.activeIndex = 1;

      handlers.slideChangeTransitionStart();
      expect(outgoingVideo.currentTime).toBe(3);

      handlers.slideChangeTransitionEnd();
      expect(outgoingVideo.currentTime).toBe(0);
    });
  });
});

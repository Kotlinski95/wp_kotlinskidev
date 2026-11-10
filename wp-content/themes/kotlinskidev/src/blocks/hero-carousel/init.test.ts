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
  video?: { dataSrc?: string; dataPoster?: string; dataSrcAlpha?: string };
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

  it("initializes the swiper and toggles visibility once the carousel intersects", () => {
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

    expect(el.style.visibility).toBe("visible");
    expect(mockUnobserveSpy).toHaveBeenCalledWith(el);
  });

  it("prepares the active slide on init and only the next slide after the page settles, not later slides", () => {
    jest.useFakeTimers();
    const el = buildCarouselElement();
    const activeSlide = buildSlide({ lazyImg: true, video: { dataSrc: "a.mp4" } });
    const otherSlide = buildSlide({
      lazyImg: true,
      video: { dataSrc: "b.mp4", dataPoster: "b.jpg" },
    });
    const farSlide = buildSlide({ lazyImg: true, video: { dataSrc: "c.mp4" } });
    mockInitSwiperReturn = {
      slides: [activeSlide, otherSlide, farSlide],
      activeIndex: 0,
      previousIndex: 0,
      on: jest.fn(),
      update: jest.fn(),
    };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    const otherVideo = otherSlide.querySelector("video") as HTMLVideoElement;
    expect(otherVideo.src).toBe("");
    expect((activeSlide.querySelector("video") as HTMLVideoElement).src).toContain("a.mp4");
    jest.runAllTimers();

    expect(activeSlide.querySelector("img")?.loading).toBe("eager");
    expect(otherSlide.querySelector("img")?.loading).toBe("eager");
    expect(otherVideo.src).toContain("b.mp4");
    expect(otherVideo.poster).toContain("b.jpg");
    expect(farSlide.querySelector("img")?.loading).toBe("lazy");
    expect((farSlide.querySelector("video") as HTMLVideoElement).src).toBe("");
    jest.useRealTimers();
  });

  describe("deferred preparation of the next slide", () => {
    const start = () => {
      const el = buildCarouselElement();
      const activeSlide = buildSlide({ video: { dataSrc: "a.mp4" } });
      const nextSlide = buildSlide({ video: { dataSrc: "b.mp4", dataPoster: "b.jpg" } });
      mockInitSwiperReturn = {
        slides: [activeSlide, nextSlide],
        activeIndex: 0,
        previousIndex: 0,
        on: jest.fn(),
        update: jest.fn(),
      };
      loadModule();
      mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
        unobserve: mockUnobserveSpy,
      });
      return nextSlide.querySelector("video") as HTMLVideoElement;
    };

    afterEach(() => {
      jest.useRealTimers();
    });

    it("keeps the next slide untouched before the delay elapses", () => {
      jest.useFakeTimers();
      const nextVideo = start();

      jest.advanceTimersByTime(1900);

      expect(nextVideo.src).toBe("");
      expect(nextVideo.poster).toContain("b.jpg");
    });

    it("prepares the next slide once the delay elapses", () => {
      jest.useFakeTimers();
      const nextVideo = start();

      jest.advanceTimersByTime(2100);

      expect(nextVideo.src).toContain("b.mp4");
      expect(nextVideo.poster).toContain("b.jpg");
    });

    it.each(["pointerdown", "keydown", "touchstart", "scroll"])(
      "prepares the next slide early on %s",
      (type) => {
        jest.useFakeTimers();
        const nextVideo = start();

        window.dispatchEvent(new Event(type));

        expect(nextVideo.src).toContain("b.mp4");
        expect(nextVideo.poster).toContain("b.jpg");
      }
    );
  });

  it("prepares the target and following slide on slideChangeTransitionStart", () => {
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
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });
    onHandlers.slideChangeTransitionStart();

    expect((slides[1].querySelector("video") as HTMLVideoElement).src).toContain("b.mp4");
    expect((slides[2].querySelector("video") as HTMLVideoElement).src).toContain("c.mp4");
    expect((slides[3].querySelector("video") as HTMLVideoElement).src).toBe("");
  });

  it("plays the active slide's video once the page settles", () => {
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
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    jest.runAllTimers();

    expect(activeSlide.querySelector("video")?.play).toHaveBeenCalled();
    jest.useRealTimers();
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
      update: jest.fn(),
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
      update: jest.fn(),
    };

    loadModule();
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });
    onHandlers.slideChangeTransitionEnd();

    expect(slideB.querySelector("video")?.play).toHaveBeenCalled();
  });

  it("pauses autoplay on hover and resumes on mouse leave", () => {
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
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    carousel.dispatchEvent(new Event("mouseenter"));
    expect(autoplay.pause).toHaveBeenCalledTimes(1);

    carousel.dispatchEvent(new Event("mouseleave"));
    expect(autoplay.resume).toHaveBeenCalledTimes(1);
  });

  it("pauses autoplay while a slide has keyboard focus and resumes once focus leaves entirely", () => {
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
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

    link.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(autoplay.pause).toHaveBeenCalledTimes(1);

    carousel.dispatchEvent(
      new FocusEvent("focusout", { bubbles: true, relatedTarget: document.body })
    );
    expect(autoplay.resume).toHaveBeenCalledTimes(1);
  });

  it("stays paused when focus moves between elements inside the carousel", () => {
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
    mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
      unobserve: mockUnobserveSpy,
    });

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

    const run = (slides: HTMLElement[]) => {
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
      mockIntersectionCallback?.([{ isIntersecting: true, target: el }], {
        unobserve: mockUnobserveSpy,
      });
      return onHandlers;
    };

    it("sets the poster of every slide video at init while src stays lazy", () => {
      const far = buildSlide({ video: { dataSrc: "c.mp4", dataPoster: "c.jpg" } });
      run([buildSlide({ video: { dataSrc: "a.mp4", dataPoster: "a.jpg" } }), far]);

      const farVideo = far.querySelector("video") as HTMLVideoElement;
      expect(farVideo.poster).toContain("c.jpg");
      expect(farVideo.src).toBe("");
    });

    it("uses the alpha source on WebKit browsers", () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({ video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov" } });
      run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.mov");
    });

    it("draws the alpha video through a canvas on iOS WebKit", () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({
        video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov", dataPoster: "a.webp" },
      });
      run([slide]);

      expect(slide.querySelector("canvas.hero-carousel__alpha-canvas")).not.toBeNull();
      expect(slide.classList.contains("hero-carousel__bg--alpha-canvas")).toBe(true);
    });

    it("keeps the native video on desktop Safari even with an alpha source", () => {
      setUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
      );
      const slide = buildSlide({ video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov" } });
      run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.mov");
      expect(slide.querySelector("canvas")).toBeNull();
    });

    it("holds an opaque slide video behind its poster on iOS until the first frame", () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({ video: { dataSrc: "a.mp4", dataPoster: "a.webp" } });
      const video = slide.querySelector("video") as HTMLVideoElement;
      const bg = document.createElement("div");
      bg.className = "hero-carousel__bg";
      slide.append(bg);
      bg.append(video);
      run([slide]);

      expect(bg.classList.contains("hero-carousel__bg--video-pending")).toBe(true);
      expect(bg.style.getPropertyValue("--kt-hero-poster")).toContain("a.webp");
    });

    it("does not hold slide videos outside iOS", () => {
      setUserAgent(CHROME_UA);
      const slide = buildSlide({ video: { dataSrc: "a.mp4", dataPoster: "a.webp" } });
      const video = slide.querySelector("video") as HTMLVideoElement;
      const bg = document.createElement("div");
      bg.className = "hero-carousel__bg";
      slide.append(bg);
      bg.append(video);
      run([slide]);

      expect(bg.classList.contains("hero-carousel__bg--video-pending")).toBe(false);
    });

    it("keeps the data-src source on non-WebKit browsers even with an alpha source", () => {
      setUserAgent(CHROME_UA);
      const slide = buildSlide({ video: { dataSrc: "a.webm", dataSrcAlpha: "a.mov" } });
      run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.webm");
    });

    it("keeps the data-src source on WebKit browsers when no alpha source is set", () => {
      setUserAgent(IPHONE_UA);
      const slide = buildSlide({ video: { dataSrc: "a.webm" } });
      run([slide]);

      expect((slide.querySelector("video") as HTMLVideoElement).src).toContain("a.webm");
    });

    it("pauses without rewinding the outgoing video, then rewinds it at transition end", () => {
      const outgoing = buildSlide({ video: { dataSrc: "a.webm" } });
      const incoming = buildSlide({ video: { dataSrc: "b.webm" } });
      const handlers = run([outgoing, incoming]);
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

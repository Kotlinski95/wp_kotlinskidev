interface FakeSwiper {
  slides: HTMLElement[];
  activeIndex: number;
  on: jest.Mock;
  destroy: jest.Mock;
}

let mockLastSwiper: FakeSwiper | null = null;
let mockLastInitSwiperArgs: unknown[] = [];
const mockSlideChangeHandlers: Array<() => void> = [];
const mockZoomTeardown = jest.fn();

jest.mock("@utils/carousel/initSwiper", () => ({
  initSwiper: jest.fn((el: HTMLElement, settings: unknown, options: unknown) => {
    mockLastInitSwiperArgs = [el, settings, options];
    const slides = Array.from(el.querySelectorAll<HTMLElement>(".swiper-slide"));
    mockLastSwiper = {
      slides,
      activeIndex: 0,
      on: jest.fn((event: string, handler: () => void) => {
        if (event === "slideChange") {
          mockSlideChangeHandlers.push(handler);
        }
      }),
      destroy: jest.fn(),
    };
    return mockLastSwiper;
  }),
}));

jest.mock("@utils/zoom/attachImageZoom", () => ({
  attachImageZoom: jest.fn(() => mockZoomTeardown),
}));

function mockMatchMedia(isMobile: boolean) {
  (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
    matches: query.includes("max-width") ? isMobile : false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function mockRaf() {
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  });
}

function buildGallery({
  images,
  mobileImages,
  settings = {},
  withTrigger = true,
}: {
  images: unknown[];
  mobileImages?: unknown[];
  settings?: Record<string, unknown>;
  withTrigger?: boolean;
}) {
  document.body.innerHTML = "";
  const gallery = document.createElement("div");
  gallery.setAttribute("data-gallery-lightbox", "true");
  gallery.setAttribute("data-images", JSON.stringify(images));
  gallery.setAttribute("data-settings", JSON.stringify(settings));
  if (mobileImages) {
    gallery.setAttribute("data-mobile-images", JSON.stringify(mobileImages));
  }
  if (withTrigger) {
    const trigger = document.createElement("button");
    trigger.className = "gallery-lightbox-trigger";
    trigger.innerHTML =
      '<img src="thumb.jpg" alt="thumb" /><span class="gallery-lightbox-count"></span><span class="gallery-lightbox-video-badge"></span>';
    gallery.append(trigger);
  }
  document.body.append(gallery);
  return gallery;
}

const imageItem = (overrides: Record<string, unknown> = {}) => ({
  src: "photo.jpg",
  alt: "A photo",
  type: "image",
  poster: "",
  width: 800,
  height: 600,
  ...overrides,
});

const videoItem = (overrides: Record<string, unknown> = {}) => ({
  src: "clip.mp4",
  alt: "A clip",
  type: "video",
  poster: "poster.jpg",
  width: 800,
  height: 600,
  ...overrides,
});

function loadModule() {
  jest.resetModules();
  mockLastSwiper = null;
  mockLastInitSwiperArgs = [];
  mockSlideChangeHandlers.length = 0;
  require("./init");
}

describe("gallery-lightbox/init.ts", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    mockRaf();
    HTMLMediaElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLMediaElement.prototype.pause = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("does nothing when there are no gallery elements", () => {
    document.body.innerHTML = "";

    expect(() => loadModule()).not.toThrow();
  });

  it("does nothing when the gallery has no images", () => {
    buildGallery({ images: [] });

    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    expect(document.getElementById("gallery-lightbox-modal")).toBeNull();
  });

  it("does nothing when the gallery has no trigger element", () => {
    buildGallery({ images: [imageItem()], withTrigger: false });

    expect(() => loadModule()).not.toThrow();
  });

  it("opens the modal with an image slide when the trigger is clicked", () => {
    buildGallery({ images: [imageItem({ alt: "Nice view" })] });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const modal = document.getElementById("gallery-lightbox-modal");
    expect(modal).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(modal?.querySelector("img")?.getAttribute("alt")).toBe("Nice view");
  });

  it("escapes special characters in image alt text", () => {
    buildGallery({ images: [imageItem({ alt: '"><script>x</script>' })] });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const modal = document.getElementById("gallery-lightbox-modal") as HTMLElement;
    expect(modal.querySelector("script")).toBeNull();
    expect(modal.querySelector("img")?.getAttribute("alt")).toBe('"><script>x</script>');
  });

  it("renders a video slide with controls and poster", () => {
    buildGallery({ images: [videoItem()], settings: { videoControls: true } });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const video = document.querySelector("#gallery-lightbox-modal video") as HTMLVideoElement;
    expect(video).not.toBeNull();
    expect(video.getAttribute("poster")).toBe("poster.jpg");
    expect(video.hasAttribute("controls")).toBe(true);
  });

  it("forces loop only when there is more than one image and loop is not disabled", () => {
    buildGallery({ images: [imageItem(), imageItem()], settings: { loop: true } });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const options = mockLastInitSwiperArgs[2] as { forceLoop: boolean };
    expect(options.forceLoop).toBe(true);
  });

  it("does not force loop for a single-image gallery", () => {
    buildGallery({ images: [imageItem()] });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const options = mockLastInitSwiperArgs[2] as { forceLoop: boolean };
    expect(options.forceLoop).toBe(false);
  });

  it("attaches image zoom to the initially active slide", () => {
    buildGallery({ images: [imageItem()] });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    expect(require("@utils/zoom/attachImageZoom").attachImageZoom).toHaveBeenCalledWith(
      mockLastSwiper?.slides[0]
    );
  });

  it("does not attach image zoom when the active slide is a video", () => {
    buildGallery({ images: [videoItem()] });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    expect(require("@utils/zoom/attachImageZoom").attachImageZoom).not.toHaveBeenCalled();
  });

  it("autoplays the active video when videoAutoplay is enabled", () => {
    buildGallery({ images: [videoItem()], settings: { videoAutoplay: true } });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));
    const video = document.querySelector("#gallery-lightbox-modal video") as HTMLVideoElement;

    expect(video.play).toBeDefined();
  });

  it("passes the trigger-sync callback to initSwiper only when trackActiveSlide is enabled", () => {
    buildGallery({ images: [imageItem(), imageItem()], settings: { trackActiveSlide: true } });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const options = mockLastInitSwiperArgs[2] as { onSlideChange?: unknown };
    expect(typeof options.onSlideChange).toBe("function");
  });

  it("does not pass a trigger-sync callback when trackActiveSlide is disabled", () => {
    buildGallery({ images: [imageItem(), imageItem()], settings: {} });
    loadModule();

    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const options = mockLastInitSwiperArgs[2] as { onSlideChange?: unknown };
    expect(options.onSlideChange).toBeUndefined();
  });

  it("closes the modal and restores scroll on close-button click", () => {
    buildGallery({ images: [imageItem()] });
    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));
    const modal = document.getElementById("gallery-lightbox-modal") as HTMLElement;

    modal.querySelector(".gallery-lightbox-close")?.dispatchEvent(new MouseEvent("click"));
    expect(modal.classList.contains("is-open")).toBe(false);

    modal.dispatchEvent(new Event("transitionend"));
    expect(mockLastSwiper?.destroy).toHaveBeenCalledWith(true, true);
    expect(document.getElementById("gallery-lightbox-modal")).toBeNull();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the modal when clicking the backdrop", () => {
    buildGallery({ images: [imageItem()] });
    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));
    const modal = document.getElementById("gallery-lightbox-modal") as HTMLElement;

    const event = new MouseEvent("click");
    Object.defineProperty(event, "target", { value: modal });
    modal.dispatchEvent(event);

    expect(modal.classList.contains("is-open")).toBe(false);
  });

  it("does not close the modal when clicking inside its content", () => {
    buildGallery({ images: [imageItem()] });
    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));
    const modal = document.getElementById("gallery-lightbox-modal") as HTMLElement;
    modal.classList.add("is-open");

    const swiperArea = modal.querySelector(".gallery-lightbox-swiper") as HTMLElement;
    swiperArea.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(modal.classList.contains("is-open")).toBe(true);
  });

  it("closes the modal on Escape", () => {
    buildGallery({ images: [imageItem()] });
    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));
    const modal = document.getElementById("gallery-lightbox-modal") as HTMLElement;

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(modal.classList.contains("is-open")).toBe(false);
  });

  it("pauses and re-zooms the active slide on slideChange", () => {
    buildGallery({ images: [imageItem(), imageItem()] });
    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));
    const attachSpy = require("@utils/zoom/attachImageZoom").attachImageZoom as jest.Mock;
    attachSpy.mockClear();

    mockSlideChangeHandlers.forEach((handler) => handler());

    expect(mockZoomTeardown).toHaveBeenCalled();
    expect(attachSpy).toHaveBeenCalled();
  });

  it("syncs the trigger thumbnail to the first mobile image on a mobile viewport", () => {
    mockMatchMedia(true);
    buildGallery({
      images: [imageItem({ src: "desktop.jpg" })],
      mobileImages: [imageItem({ src: "mobile.jpg", alt: "Mobile alt" })],
    });

    loadModule();

    const img = document.querySelector(".gallery-lightbox-trigger img") as HTMLImageElement;
    expect(img.src).toContain("mobile.jpg");
    expect(img.alt).toBe("Mobile alt");
  });

  it("falls back to the desktop image list when mobile image JSON is invalid", () => {
    document.body.innerHTML = "";
    const gallery = document.createElement("div");
    gallery.setAttribute("data-gallery-lightbox", "true");
    gallery.setAttribute("data-images", JSON.stringify([imageItem({ src: "desktop.jpg" })]));
    gallery.setAttribute("data-mobile-images", "{not-json");
    gallery.setAttribute("data-settings", "{}");
    const trigger = document.createElement("button");
    trigger.className = "gallery-lightbox-trigger";
    trigger.innerHTML = '<img src="thumb.jpg" alt="thumb" />';
    gallery.append(trigger);
    document.body.append(gallery);
    mockMatchMedia(true);

    loadModule();
    document.querySelector(".gallery-lightbox-trigger")?.dispatchEvent(new MouseEvent("click"));

    const modalImg = document.querySelector("#gallery-lightbox-modal img") as HTMLImageElement;
    expect(modalImg.src).toContain("desktop.jpg");
  });
});

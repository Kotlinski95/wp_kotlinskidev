type Entry = { isIntersecting: boolean; target: Element };

let capturedCallback: ((entries: Entry[]) => void) | null = null;
let capturedOptions: IntersectionObserverInit | undefined;

class MockIntersectionObserver {
  constructor(cb: (entries: Entry[]) => void, options: IntersectionObserverInit) {
    capturedCallback = cb;
    capturedOptions = options;
  }
  observe = jest.fn();
  disconnect = jest.fn();
}

const setup = (): { video: HTMLVideoElement; play: jest.Mock; pause: jest.Mock } => {
  document.body.innerHTML =
    '<video class="kt-device-frame__image" data-src="http://x/a.mp4" preload="none"></video>';
  const video = document.querySelector("video") as HTMLVideoElement;
  const play = jest.fn().mockResolvedValue(undefined);
  const pause = jest.fn();
  video.play = play;
  video.pause = pause;
  return { video, play, pause };
};

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

describe("device-frame init", () => {
  beforeEach(() => {
    jest.resetModules();
    capturedCallback = null;
    capturedOptions = undefined;
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      MockIntersectionObserver;
  });

  it("observes with a 200px root margin", () => {
    setup();
    jest.isolateModules(() => {
      require("./init");
    });

    expect(capturedOptions?.rootMargin).toBe("200px");
  });

  it("sets src from data-src and plays when near the viewport", () => {
    const { video, play } = setup();
    jest.isolateModules(() => {
      require("./init");
    });

    capturedCallback?.([{ isIntersecting: true, target: video }]);

    expect(video.getAttribute("src")).toBe("http://x/a.mp4");
    expect(video.dataset.src).toBeUndefined();
    expect(play).toHaveBeenCalled();
  });

  it("sets poster from data-poster together with src", () => {
    const { video } = setup();
    video.setAttribute("data-poster", "http://x/p.jpg");
    jest.isolateModules(() => {
      require("./init");
    });

    capturedCallback?.([{ isIntersecting: true, target: video }]);

    expect(video.getAttribute("poster")).toBe("http://x/p.jpg");
    expect(video.dataset.poster).toBeUndefined();
  });

  it("uses the mobile poster on narrow viewports", () => {
    const { video } = setup();
    video.setAttribute("data-poster", "http://x/p.jpg");
    video.setAttribute("data-kt-poster-mobile", "http://x/p-m.jpg");
    const restore = mockMobileViewport();
    jest.isolateModules(() => {
      require("./init");
    });

    capturedCallback?.([{ isIntersecting: true, target: video }]);

    expect(video.getAttribute("poster")).toBe("http://x/p-m.jpg");
    restore();
  });

  it("uses the full poster on wide viewports", () => {
    const { video } = setup();
    video.setAttribute("data-poster", "http://x/p.jpg");
    video.setAttribute("data-kt-poster-mobile", "http://x/p-m.jpg");
    Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true });
    jest.isolateModules(() => {
      require("./init");
    });

    capturedCallback?.([{ isIntersecting: true, target: video }]);

    expect(video.getAttribute("poster")).toBe("http://x/p.jpg");
  });

  it("sets the lightbox video src when its modal opens", () => {
    document.body.innerHTML =
      '<div id="m"><video class="kt-device-frame-lightbox__media" data-src="http://x/b.mp4" preload="none"></video></div>';
    const modal = document.getElementById("m") as HTMLElement;
    jest.isolateModules(() => {
      require("./init");
    });

    document.dispatchEvent(new CustomEvent("kt-modal:open", { detail: { modal } }));

    const video = modal.querySelector("video") as HTMLVideoElement;
    expect(video.getAttribute("src")).toBe("http://x/b.mp4");
    expect(video.dataset.src).toBeUndefined();
  });

  it("pauses once it leaves the viewport", () => {
    const { video, pause } = setup();
    jest.isolateModules(() => {
      require("./init");
    });

    capturedCallback?.([{ isIntersecting: true, target: video }]);
    capturedCallback?.([{ isIntersecting: false, target: video }]);

    expect(pause).toHaveBeenCalled();
  });

  it("does nothing when no lazy videos exist", () => {
    document.body.innerHTML = "";
    jest.isolateModules(() => {
      require("./init");
    });

    expect(capturedCallback).toBeNull();
  });
});

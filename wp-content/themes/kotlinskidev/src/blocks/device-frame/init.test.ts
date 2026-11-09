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

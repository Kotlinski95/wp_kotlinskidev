import { initCoverVideoControls } from "./cover-video-controls";

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;

let observerCallback: ObserverCallback = () => undefined;

beforeEach(() => {
  document.body.innerHTML = "";
  observerCallback = () => undefined;

  class FakeObserver {
    constructor(callback: ObserverCallback) {
      observerCallback = callback;
    }
    observe = jest.fn();
  }
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = FakeObserver;
  window.matchMedia = jest
    .fn()
    .mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

const mountVideo = (attributes: Record<string, string>): HTMLVideoElement => {
  const video = document.createElement("video");
  Object.entries(attributes).forEach(([name, value]) => video.setAttribute(name, value));
  document.body.appendChild(video);
  video.play = jest.fn().mockResolvedValue(undefined);
  video.pause = jest.fn();
  return video;
};

describe("initCoverVideoControls", () => {
  it("seeks to the first frame once metadata loads when autoplay is off", () => {
    const video = mountVideo({ "data-kt-video-autoplay": "off" });

    initCoverVideoControls();
    video.dispatchEvent(new Event("loadedmetadata"));

    expect(video.currentTime).toBeCloseTo(0.001);
  });

  it("pauses the video when it leaves the viewport", () => {
    const video = mountVideo({ "data-kt-video-pause-offscreen": "true" });

    initCoverVideoControls();
    observerCallback([{ isIntersecting: false }]);

    expect(video.pause).toHaveBeenCalled();
  });

  it("resumes a paused video when it re-enters the viewport", () => {
    const video = mountVideo({ "data-kt-video-pause-offscreen": "true" });
    Object.defineProperty(video, "paused", { value: true });

    initCoverVideoControls();
    observerCallback([{ isIntersecting: true }]);

    expect(video.play).toHaveBeenCalled();
  });

  it("does not resume when the visitor prefers reduced motion", () => {
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const video = mountVideo({ "data-kt-video-pause-offscreen": "true" });
    Object.defineProperty(video, "paused", { value: true });

    initCoverVideoControls();
    observerCallback([{ isIntersecting: true }]);

    expect(video.play).not.toHaveBeenCalled();
  });

  it("does not resume a video whose autoplay is off", () => {
    const video = mountVideo({
      "data-kt-video-pause-offscreen": "true",
      "data-kt-video-autoplay": "off",
    });
    Object.defineProperty(video, "paused", { value: true });

    initCoverVideoControls();
    observerCallback([{ isIntersecting: true }]);

    expect(video.play).not.toHaveBeenCalled();
  });
});

describe("reveal after video ends", () => {
  const mountCover = (
    inner: string[],
    videoAttributes: Record<string, string> = {}
  ): { cover: HTMLElement; video: HTMLVideoElement } => {
    document.body.innerHTML = "";
    const cover = document.createElement("div");
    cover.className = "wp-block-cover";
    cover.dataset.ktRevealAfterEnd = "true";
    const innerContainer = document.createElement("div");
    innerContainer.className = "wp-block-cover__inner-container";
    inner.forEach((className) => {
      const child = document.createElement("p");
      if (className) {
        child.className = className;
      }
      innerContainer.appendChild(child);
    });
    cover.append(document.createElement("video"), innerContainer);
    cover.querySelector("video")?.classList.add("wp-block-cover__video-background");
    document.body.appendChild(cover);
    const video = cover.querySelector("video") as HTMLVideoElement;
    Object.entries(videoAttributes).forEach(([name, value]) => video.setAttribute(name, value));
    video.play = jest.fn().mockResolvedValue(undefined);
    return { cover, video };
  };

  it("reveals animated descendants when the video ends", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);

    initCoverVideoControls();
    const target = cover.querySelector(".fade-up-on-scroll") as HTMLElement;
    expect(target.classList.contains("visible")).toBe(false);
    video.dispatchEvent(new Event("ended"));

    expect(target.classList.contains("visible")).toBe(true);
  });

  it("reveals shortly before the video ends", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    Object.defineProperty(video, "duration", { value: 15, configurable: true });
    Object.defineProperty(video, "currentTime", {
      value: 14.7,
      configurable: true,
      writable: true,
    });

    initCoverVideoControls();
    video.dispatchEvent(new Event("timeupdate"));

    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();
  });

  it("keeps content hidden while the video is still playing", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    Object.defineProperty(video, "duration", { value: 15, configurable: true });
    Object.defineProperty(video, "currentTime", { value: 5, configurable: true, writable: true });

    initCoverVideoControls();
    video.dispatchEvent(new Event("timeupdate"));

    expect(cover.querySelector(".fade-up-on-scroll.visible")).toBeNull();
  });

  it("hides the content again when the video restarts", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    Object.defineProperty(video, "duration", { value: 15, configurable: true });
    Object.defineProperty(video, "currentTime", { value: 15, configurable: true, writable: true });

    initCoverVideoControls();
    video.dispatchEvent(new Event("ended"));
    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();

    (video as { currentTime: number }).currentTime = 0.2;
    video.dispatchEvent(new Event("playing"));

    expect(cover.querySelector(".fade-up-on-scroll.visible")).toBeNull();
  });

  it("keeps the content revealed and returns to the last frame when the browser rewinds an ended, paused video", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    Object.defineProperty(video, "duration", { value: 15, configurable: true });
    Object.defineProperty(video, "currentTime", { value: 15, configurable: true, writable: true });

    initCoverVideoControls();
    video.dispatchEvent(new Event("ended"));
    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();

    (video as { currentTime: number }).currentTime = 11.2;
    video.dispatchEvent(new Event("timeupdate"));

    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();
    expect(video.currentTime).toBe(15);
  });

  it("does not reveal early when autoplay is off", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"], {
      "data-kt-video-autoplay": "off",
    });

    initCoverVideoControls();

    expect(video.play).not.toHaveBeenCalled();
    expect(cover.querySelector(".visible")).toBeNull();
  });

  it("reveals immediately for reduced motion", () => {
    window.matchMedia = jest
      .fn()
      .mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    const { cover } = mountCover(["fade-up-on-scroll"]);

    initCoverVideoControls();

    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();
  });

  it("reveals when the video errors", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);

    initCoverVideoControls();
    video.dispatchEvent(new Event("error"));

    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();
  });

  it("reveals when autoplay is blocked by the browser", async () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    video.play = jest.fn().mockRejectedValue(new DOMException("blocked", "NotAllowedError"));

    initCoverVideoControls();
    await Promise.resolve();
    await Promise.resolve();

    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();
  });

  it("does not reveal when play is aborted by a source swap", async () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    video.play = jest.fn().mockRejectedValue(new DOMException("aborted", "AbortError"));

    initCoverVideoControls();
    await Promise.resolve();
    await Promise.resolve();

    expect(cover.querySelector(".fade-up-on-scroll.visible")).toBeNull();
  });

  it("reveals at once when the video already ended", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);
    Object.defineProperty(video, "ended", { value: true });

    initCoverVideoControls();

    expect(cover.querySelector(".fade-up-on-scroll.visible")).not.toBeNull();
  });

  it("targets the inner container when no descendant has an animation class", () => {
    const { cover, video } = mountCover([""]);

    initCoverVideoControls();
    const inner = cover.querySelector(".wp-block-cover__inner-container") as HTMLElement;
    expect(inner.classList.contains("fade-in-on-scroll")).toBe(true);
    expect(inner.classList.contains("visible")).toBe(false);
    video.dispatchEvent(new Event("ended"));

    expect(inner.classList.contains("visible")).toBe(true);
  });

  it("releases will-change after the reveal transition", () => {
    const { cover, video } = mountCover(["fade-up-on-scroll"]);

    initCoverVideoControls();
    video.dispatchEvent(new Event("ended"));
    const target = cover.querySelector(".fade-up-on-scroll") as HTMLElement;
    target.dispatchEvent(new Event("transitionend"));

    expect(target.style.willChange).toBe("auto");
  });
});

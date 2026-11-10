import { holdVideoUntilFirstFrame } from "./video-first-frame";

const mount = (poster = ""): { container: HTMLElement; video: HTMLVideoElement } => {
  document.body.innerHTML = "";
  const container = document.createElement("div");
  container.className = "hero-carousel__bg";
  const video = document.createElement("video");
  if (poster) {
    video.poster = poster;
  }
  container.appendChild(video);
  document.body.appendChild(container);
  return { container, video };
};

describe("holdVideoUntilFirstFrame", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("hides the video behind the poster until playback starts and a frame is presented", () => {
    const { container, video } = mount("poster.webp");
    const frameCallbacks: Array<() => void> = [];
    Object.defineProperty(video, "requestVideoFrameCallback", {
      configurable: true,
      value: jest.fn((callback: () => void) => {
        frameCallbacks.push(callback);
        return 1;
      }),
    });

    expect(holdVideoUntilFirstFrame(video)).toBe(true);
    expect(container.classList.contains("hero-carousel__bg--video-pending")).toBe(true);
    expect(container.style.getPropertyValue("--kt-hero-poster")).toContain("poster.webp");

    video.dispatchEvent(new Event("playing"));
    expect(container.classList.contains("hero-carousel__bg--video-pending")).toBe(true);

    frameCallbacks[0]();
    expect(container.classList.contains("hero-carousel__bg--video-pending")).toBe(false);
  });

  it("releases on timeupdate when requestVideoFrameCallback is missing", () => {
    const { container, video } = mount();
    holdVideoUntilFirstFrame(video);

    video.dispatchEvent(new Event("playing"));
    expect(container.classList.contains("hero-carousel__bg--video-pending")).toBe(true);

    video.dispatchEvent(new Event("timeupdate"));
    expect(container.classList.contains("hero-carousel__bg--video-pending")).toBe(false);
  });

  it("always releases after the fallback delay so a stalled video never stays hidden", () => {
    const { container, video } = mount("poster.webp");
    holdVideoUntilFirstFrame(video);
    video.dispatchEvent(new Event("playing"));

    jest.advanceTimersByTime(4000);

    expect(container.classList.contains("hero-carousel__bg--video-pending")).toBe(false);
  });

  it("does not hold twice and ignores videos outside a hero background", () => {
    const { video } = mount();
    expect(holdVideoUntilFirstFrame(video)).toBe(true);
    expect(holdVideoUntilFirstFrame(video)).toBe(false);

    const loose = document.createElement("video");
    document.body.appendChild(loose);
    expect(holdVideoUntilFirstFrame(loose)).toBe(false);
  });
});

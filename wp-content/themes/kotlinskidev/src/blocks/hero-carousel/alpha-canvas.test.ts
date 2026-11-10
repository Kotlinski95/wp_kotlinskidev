import { attachAlphaCanvas } from "./alpha-canvas";

interface FakeContext {
  clearRect: jest.Mock;
  drawImage: jest.Mock;
}

const mountVideo = (poster = ""): { container: HTMLElement; video: HTMLVideoElement } => {
  document.body.innerHTML = "";
  const container = document.createElement("div");
  container.className = "hero-carousel__bg";
  const video = document.createElement("video");
  if (poster) {
    video.poster = poster;
  }
  container.appendChild(video);
  document.body.appendChild(container);
  Object.defineProperty(video, "readyState", { configurable: true, value: 4 });
  Object.defineProperty(video, "videoWidth", { configurable: true, value: 1280 });
  Object.defineProperty(video, "videoHeight", { configurable: true, value: 720 });
  return { container, video };
};

describe("attachAlphaCanvas", () => {
  let context: FakeContext;
  let frameCallbacks: Array<() => void>;

  beforeEach(() => {
    context = { clearRect: jest.fn(), drawImage: jest.fn() };
    frameCallbacks = [];
    jest
      .spyOn(HTMLCanvasElement.prototype, "getContext")
      .mockReturnValue(context as unknown as CanvasRenderingContext2D);
    jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frameCallbacks.push(() => callback(0));
      return frameCallbacks.length;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const runFrame = (): void => {
    const next = frameCallbacks.shift();
    next?.();
  };

  it("adds an aria-hidden canvas next to the video and marks the container", () => {
    const { container, video } = mountVideo("poster.webp");

    expect(attachAlphaCanvas(video)).toBe(true);

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.className).toBe("hero-carousel__alpha-canvas");
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(video.nextElementSibling).toBe(canvas);
    expect(container.classList.contains("hero-carousel__bg--alpha-canvas")).toBe(true);
    expect(container.style.getPropertyValue("--kt-hero-poster")).toContain("poster.webp");
  });

  it("does not attach twice and bails out when 2d context is unavailable", () => {
    const { container, video } = mountVideo();
    attachAlphaCanvas(video);
    expect(attachAlphaCanvas(video)).toBe(false);
    expect(container.querySelectorAll("canvas")).toHaveLength(1);

    jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const second = mountVideo();
    expect(attachAlphaCanvas(second.video)).toBe(false);
    expect(second.container.querySelector("canvas")).toBeNull();
  });

  it("draws frames only while the video plays and drops the poster after the first frame", () => {
    const { container, video } = mountVideo("poster.webp");
    attachAlphaCanvas(video);

    expect(context.drawImage).not.toHaveBeenCalled();

    video.dispatchEvent(new Event("playing"));
    runFrame();
    expect(context.clearRect).toHaveBeenCalled();
    expect(context.drawImage).toHaveBeenCalledTimes(1);
    expect(container.classList.contains("hero-carousel__bg--alpha-drawing")).toBe(true);

    runFrame();
    expect(context.drawImage).toHaveBeenCalledTimes(2);

    video.dispatchEvent(new Event("pause"));
    runFrame();
    expect(context.drawImage).toHaveBeenCalledTimes(3);
    expect(frameCallbacks).toHaveLength(0);
  });

  it("uses requestVideoFrameCallback when the browser provides it", () => {
    const { video } = mountVideo();
    const callbacks: Array<() => void> = [];
    Object.defineProperty(video, "requestVideoFrameCallback", {
      configurable: true,
      value: jest.fn((callback: () => void) => {
        callbacks.push(callback);
        return 1;
      }),
    });
    attachAlphaCanvas(video);

    video.dispatchEvent(new Event("playing"));
    expect(callbacks).toHaveLength(1);
    callbacks[0]();

    expect(context.drawImage).toHaveBeenCalledTimes(1);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("sizes the canvas to the video aspect ratio and draws one frame on loadeddata", () => {
    const { container, video } = mountVideo();
    Object.defineProperty(video, "videoWidth", { configurable: true, value: 1000 });
    Object.defineProperty(video, "videoHeight", { configurable: true, value: 500 });
    attachAlphaCanvas(video);

    video.dispatchEvent(new Event("loadeddata"));

    const canvas = container.querySelector("canvas") as HTMLCanvasElement;
    expect(canvas.width).toBe(480);
    expect(canvas.height).toBe(240);
    expect(context.drawImage).toHaveBeenCalledTimes(1);
  });
});

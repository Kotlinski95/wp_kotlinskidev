const CANVAS_CLASS = "hero-carousel__alpha-canvas";
const ACTIVE_CLASS = "hero-carousel__bg--alpha-canvas";
const DRAWING_CLASS = "hero-carousel__bg--alpha-drawing";
const POSTER_PROPERTY = "--kt-hero-poster";
const CANVAS_WIDTH = 480;
const DEFAULT_ASPECT_RATIO = 9 / 16;

export const attachAlphaCanvas = (video: HTMLVideoElement): boolean => {
  const container = video.parentElement;
  if (!container || container.querySelector(`.${CANVAS_CLASS}`)) {
    return false;
  }

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return false;
  }

  canvas.className = CANVAS_CLASS;
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = CANVAS_WIDTH;
  canvas.height = Math.round(CANVAS_WIDTH * DEFAULT_ASPECT_RATIO);

  if (video.poster) {
    container.style.setProperty(POSTER_PROPERTY, `url(${JSON.stringify(video.poster)})`);
  }
  container.classList.add(ACTIVE_CLASS);
  video.after(canvas);

  let playing = false;
  let scheduled = false;
  let visible = true;

  const fitCanvasToVideo = (): void => {
    if (!video.videoWidth || !video.videoHeight) {
      return;
    }
    const height = Math.round((CANVAS_WIDTH * video.videoHeight) / video.videoWidth);
    if (canvas.height !== height) {
      canvas.height = height;
    }
  };

  const drawFrame = (): void => {
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }
    fitCanvasToVideo();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    container.classList.add(DRAWING_CLASS);
  };

  const schedule = (): void => {
    if (!playing || !visible || scheduled) {
      return;
    }
    scheduled = true;
    const onFrame = (): void => {
      scheduled = false;
      drawFrame();
      schedule();
    };
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(onFrame);
    } else {
      window.requestAnimationFrame(onFrame);
    }
  };

  const start = (): void => {
    playing = true;
    schedule();
  };

  const stop = (): void => {
    playing = false;
  };

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      schedule();
    }).observe(container);
  }

  video.addEventListener("playing", start);
  video.addEventListener("pause", stop);
  video.addEventListener("ended", stop);
  video.addEventListener("loadeddata", drawFrame);
  video.addEventListener("seeked", drawFrame);

  if (!video.paused) {
    start();
  }

  return true;
};

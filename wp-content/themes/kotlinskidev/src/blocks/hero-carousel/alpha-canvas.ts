const CANVAS_CLASS = "hero-carousel__alpha-canvas";
const ACTIVE_CLASS = "hero-carousel__bg--alpha-canvas";
const DRAWING_CLASS = "hero-carousel__bg--alpha-drawing";
const POSTER_PROPERTY = "--kt-hero-poster";
const CANVAS_WIDTH = 480;
const DEFAULT_ASPECT_RATIO = 9 / 16;

interface FrameLoop {
  start: () => void;
  stop: () => void;
  drawFrame: () => void;
  setVisible: (isVisible: boolean) => void;
}

interface AlphaCanvasTarget {
  video: HTMLVideoElement;
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

const insertCanvas = (video: HTMLVideoElement, container: HTMLElement) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) {
    return null;
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
  return { canvas, context };
};

const fitCanvasToVideo = ({ video, canvas }: AlphaCanvasTarget): void => {
  if (!video.videoWidth || !video.videoHeight) {
    return;
  }
  const height = Math.round((CANVAS_WIDTH * video.videoHeight) / video.videoWidth);
  if (canvas.height !== height) {
    canvas.height = height;
  }
};

const drawFrame = (target: AlphaCanvasTarget): void => {
  const { video, container, canvas, context } = target;
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    return;
  }
  fitCanvasToVideo(target);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  container.classList.add(DRAWING_CLASS);
};

const requestNextFrame = (video: HTMLVideoElement, onFrame: () => void): void => {
  if (typeof video.requestVideoFrameCallback === "function") {
    video.requestVideoFrameCallback(onFrame);
  } else {
    window.requestAnimationFrame(onFrame);
  }
};

const createFrameLoop = (target: AlphaCanvasTarget): FrameLoop => {
  let playing = false;
  let scheduled = false;
  let visible = true;

  const schedule = (): void => {
    if (!playing || !visible || scheduled) {
      return;
    }
    scheduled = true;
    requestNextFrame(target.video, () => {
      scheduled = false;
      drawFrame(target);
      schedule();
    });
  };

  return {
    start: () => {
      playing = true;
      schedule();
    },
    stop: () => {
      playing = false;
    },
    drawFrame: () => drawFrame(target),
    setVisible: (isVisible) => {
      visible = isVisible;
      schedule();
    },
  };
};

export const attachAlphaCanvas = (video: HTMLVideoElement): boolean => {
  const container = video.parentElement;
  if (!container || container.querySelector(`.${CANVAS_CLASS}`)) {
    return false;
  }

  const inserted = insertCanvas(video, container);
  if (!inserted) {
    return false;
  }

  const loop = createFrameLoop({ video, container, ...inserted });

  if (typeof IntersectionObserver !== "undefined") {
    new IntersectionObserver((entries) => {
      loop.setVisible(entries[entries.length - 1].isIntersecting);
    }).observe(container);
  }

  video.addEventListener("playing", loop.start);
  video.addEventListener("pause", loop.stop);
  video.addEventListener("ended", loop.stop);
  video.addEventListener("loadeddata", loop.drawFrame);
  video.addEventListener("seeked", loop.drawFrame);

  if (!video.paused) {
    loop.start();
  }

  return true;
};

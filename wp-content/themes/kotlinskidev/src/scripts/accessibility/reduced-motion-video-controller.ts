import { matchReducedMotionQuery } from "./reduced-motion-query";
import { addIndicatorToVideo, removeAllIndicators } from "./video-indicator";
import {
  extractVideoState,
  getTargetVideos,
  pauseVideo,
  PAUSED_VIDEO_SELECTOR,
  restoreVideo,
  type VideoState,
} from "./video-operations";

export interface ReducedMotionVideoController {
  init: () => void;
  checkVideos: () => void;
}

declare global {
  interface Window {
    reducedMotionVideoController?: ReducedMotionVideoController;
  }
}

function createReducedMotionVideoController(): ReducedMotionVideoController {
  const originalStates = new Map<HTMLVideoElement, VideoState>();
  const mediaQuery = matchReducedMotionQuery();

  const pauseAllVideos = (): void => {
    getTargetVideos().forEach((video) => {
      if (!originalStates.has(video)) {
        originalStates.set(video, extractVideoState(video));
      }
      pauseVideo(video);
    });
  };

  const restoreAllVideos = (): void => {
    document.querySelectorAll<HTMLVideoElement>(PAUSED_VIDEO_SELECTOR).forEach((video) => {
      const originalState = originalStates.get(video);
      if (originalState) {
        restoreVideo(video, originalState);
      }
    });
  };

  const addAllIndicators = (): void => {
    document.querySelectorAll<HTMLVideoElement>(PAUSED_VIDEO_SELECTOR).forEach(addIndicatorToVideo);
  };

  const applyMotionPreference = (prefersReducedMotion: boolean): void => {
    if (prefersReducedMotion) {
      pauseAllVideos();
      addAllIndicators();
    } else {
      restoreAllVideos();
      removeAllIndicators();
    }
  };

  const init = (): void => {
    applyMotionPreference(mediaQuery.matches);
    mediaQuery.addEventListener("change", (event) => applyMotionPreference(event.matches));

    const observer = new MutationObserver(() => {
      if (mediaQuery.matches) {
        pauseAllVideos();
        addAllIndicators();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  };

  return {
    init,
    checkVideos: () => applyMotionPreference(mediaQuery.matches),
  };
}

function initializeVideoController(): ReducedMotionVideoController {
  const videoController = createReducedMotionVideoController();
  videoController.init();

  window.reducedMotionVideoController = videoController;
  return videoController;
}

export function startVideoController(): () => ReducedMotionVideoController | undefined {
  if (document.readyState !== "loading") {
    const controller = initializeVideoController();
    return () => controller;
  }

  let controller: ReducedMotionVideoController | undefined;
  document.addEventListener("DOMContentLoaded", () => {
    controller = initializeVideoController();
  });
  return () => controller;
}

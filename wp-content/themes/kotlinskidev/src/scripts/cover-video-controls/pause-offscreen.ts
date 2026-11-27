import {
  isAccessibilityMotionStopped,
  onAccessibilityMotionChange,
} from "@utils/accessibility-motion";
import { prefersReducedMotion } from "./reduced-motion";

const VISIBILITY_THRESHOLD = 0.1;

const playQuietly = (video: HTMLVideoElement): void => {
  void video.play().catch(() => undefined);
};

const isInViewport = (video: HTMLVideoElement): boolean => {
  const rect = video.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
};

export const pauseWhenOffscreen = (video: HTMLVideoElement): void => {
  const shouldAutoplay = video.dataset.ktVideoAutoplay !== "off";

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];

      if (!entry.isIntersecting) {
        video.pause();
        return;
      }

      if (shouldAutoplay && !prefersReducedMotion() && !video.ended && video.paused) {
        playQuietly(video);
      }
    },
    { threshold: VISIBILITY_THRESHOLD }
  );

  observer.observe(video);

  if (isAccessibilityMotionStopped()) {
    video.pause();
  }

  onAccessibilityMotionChange((stopped) => {
    if (stopped) {
      video.pause();
    } else if (shouldAutoplay && !video.ended && video.paused && isInViewport(video)) {
      playQuietly(video);
    }
  });
};

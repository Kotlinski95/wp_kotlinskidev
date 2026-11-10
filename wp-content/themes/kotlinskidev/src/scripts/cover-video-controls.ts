import {
  REVEAL_AFTER_END_SELECTOR,
  SCROLL_ANIMATION_SELECTOR,
  clearWillChangeAfterReveal,
} from "./scroll-animation-selectors";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FIRST_FRAME_TIME = 0.001;
const REVEAL_LEAD_SECONDS = 0.4;
const END_FRAME_TOLERANCE_SECONDS = 0.05;

const showFirstFrame = (video: HTMLVideoElement): void => {
  const seek = () => {
    video.currentTime = FIRST_FRAME_TIME;
  };

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    seek();
    return;
  }

  video.addEventListener("loadedmetadata", seek, { once: true });
};

const playQuietly = (video: HTMLVideoElement): void => {
  void video.play().catch(() => undefined);
};

const pauseWhenOffscreen = (video: HTMLVideoElement): void => {
  const shouldAutoplay = video.dataset.ktVideoAutoplay !== "off";

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];

      if (!entry.isIntersecting) {
        video.pause();
        return;
      }

      const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      if (shouldAutoplay && !reducedMotion && !video.ended && video.paused) {
        playQuietly(video);
      }
    },
    { threshold: 0.1 }
  );

  observer.observe(video);
};

const INNER_CONTAINER_SELECTOR = ".wp-block-cover__inner-container";
const FALLBACK_CLASS = "fade-in-on-scroll";

const resolveRevealTargets = (cover: HTMLElement): HTMLElement[] => {
  const inner = cover.querySelector<HTMLElement>(INNER_CONTAINER_SELECTOR);
  const targets = Array.from(cover.querySelectorAll<HTMLElement>(SCROLL_ANIMATION_SELECTOR));

  if (
    inner &&
    !inner.matches(SCROLL_ANIMATION_SELECTOR) &&
    !inner.querySelector(SCROLL_ANIMATION_SELECTOR)
  ) {
    inner.classList.add(FALLBACK_CLASS);
    targets.push(inner);
  } else if (inner?.matches(SCROLL_ANIMATION_SELECTOR) && !targets.includes(inner)) {
    targets.push(inner);
  }

  return targets;
};

const revealAfterEnd = (cover: HTMLElement): void => {
  const video = cover.querySelector<HTMLVideoElement>("video.wp-block-cover__video-background");
  if (!video) {
    return;
  }

  const targets = resolveRevealTargets(cover);
  let revealed = false;

  const reveal = () => {
    if (revealed) {
      return;
    }
    revealed = true;
    targets.forEach((el) => {
      el.classList.add("visible");
      clearWillChangeAfterReveal(el);
    });
  };

  const hide = () => {
    if (!revealed) {
      return;
    }
    revealed = false;
    targets.forEach((el) => el.classList.remove("visible"));
  };

  let playedToEnd = false;

  const restoreEndFrame = () => {
    if (video.duration - video.currentTime > END_FRAME_TOLERANCE_SECONDS) {
      video.currentTime = video.duration;
    }
  };

  const syncVisibility = () => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      return;
    }
    if (playedToEnd && video.paused) {
      restoreEndFrame();
      return;
    }
    if (video.ended || video.duration - video.currentTime <= REVEAL_LEAD_SECONDS) {
      reveal();
      return;
    }
    hide();
  };

  const onPlaying = () => {
    if (video.currentTime < video.duration - REVEAL_LEAD_SECONDS) {
      playedToEnd = false;
    }
    syncVisibility();
  };

  const onEnded = () => {
    playedToEnd = true;
    reveal();
  };

  if (window.matchMedia(REDUCED_MOTION_QUERY).matches || video.ended) {
    reveal();
    return;
  }

  video.addEventListener("timeupdate", syncVisibility);
  video.addEventListener("playing", onPlaying);
  video.addEventListener("seeked", syncVisibility);
  video.addEventListener("ended", onEnded);
  video.addEventListener("error", reveal, { once: true });

  if (video.dataset.ktVideoAutoplay !== "off") {
    void video.play().catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        reveal();
      }
    });
  }
};

export const initCoverVideoControls = (root: ParentNode = document): void => {
  root
    .querySelectorAll<HTMLVideoElement>("video[data-kt-video-autoplay='off']")
    .forEach(showFirstFrame);

  root
    .querySelectorAll<HTMLVideoElement>("video[data-kt-video-pause-offscreen='true']")
    .forEach(pauseWhenOffscreen);

  root.querySelectorAll<HTMLElement>(REVEAL_AFTER_END_SELECTOR).forEach(revealAfterEnd);
};

initCoverVideoControls();

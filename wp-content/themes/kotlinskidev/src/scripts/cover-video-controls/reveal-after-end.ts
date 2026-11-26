import { clearWillChangeAfterReveal } from "../scroll-animation-selectors";
import { prefersReducedMotion } from "./reduced-motion";
import { resolveRevealTargets } from "./reveal-targets";

const COVER_VIDEO_SELECTOR = "video.wp-block-cover__video-background";
const REVEAL_LEAD_SECONDS = 0.4;
const END_FRAME_TOLERANCE_SECONDS = 0.05;

interface RevealToggle {
  reveal: () => void;
  hide: () => void;
}

const createRevealToggle = (targets: HTMLElement[]): RevealToggle => {
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

  return { reveal, hide };
};

const bindVideoToReveal = (video: HTMLVideoElement, { reveal, hide }: RevealToggle): void => {
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

  video.addEventListener("timeupdate", syncVisibility);
  video.addEventListener("playing", onPlaying);
  video.addEventListener("seeked", syncVisibility);
  video.addEventListener("ended", onEnded);
  video.addEventListener("error", reveal, { once: true });
};

const startAutoplayOrRevealIfBlocked = (video: HTMLVideoElement, reveal: () => void): void => {
  if (video.dataset.ktVideoAutoplay === "off") {
    return;
  }
  void video.play().catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      reveal();
    }
  });
};

export const revealAfterEnd = (cover: HTMLElement): void => {
  const video = cover.querySelector<HTMLVideoElement>(COVER_VIDEO_SELECTOR);
  if (!video) {
    return;
  }

  const toggle = createRevealToggle(resolveRevealTargets(cover));

  if (prefersReducedMotion() || video.ended) {
    toggle.reveal();
    return;
  }

  bindVideoToReveal(video, toggle);
  startAutoplayOrRevealIfBlocked(video, toggle.reveal);
};

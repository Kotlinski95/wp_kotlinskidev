export interface VideoState {
  autoplay: boolean;
  muted: boolean;
  loop: boolean;
  controls: boolean;
}

export const PAUSED_VIDEO_SELECTOR = "video[data-reduced-motion-paused]";

const TARGET_VIDEO_SELECTORS: readonly string[] = [
  ".wp-block-cover video",
  ".wp-block-cover-image video",
  "video[autoplay]",
  'video[data-autoplay="true"]',
  ".hero-banner video",
  ".background-video",
];

const PAUSED_ARIA_LABEL = "Video paused due to reduced motion preference";
const PAUSED_TITLE = "Video paused (Reduced motion mode) - Click to play manually";

export function getTargetVideos(): HTMLVideoElement[] {
  return TARGET_VIDEO_SELECTORS.flatMap((selector) =>
    Array.from(document.querySelectorAll<HTMLVideoElement>(selector))
  );
}

export function extractVideoState(video: HTMLVideoElement): VideoState {
  return {
    autoplay: video.hasAttribute("autoplay"),
    muted: video.muted,
    loop: video.loop,
    controls: video.hasAttribute("controls"),
  };
}

export function pauseVideo(video: HTMLVideoElement): void {
  if (video.hasAttribute("data-user-override")) {
    return;
  }

  video.pause();
  video.removeAttribute("autoplay");
  video.setAttribute("data-reduced-motion-paused", "true");

  if (!video.hasAttribute("controls")) {
    video.setAttribute("controls", "true");
    video.setAttribute("data-controls-added", "true");
  }

  video.muted = true;
  video.setAttribute("aria-label", PAUSED_ARIA_LABEL);
  video.setAttribute("title", PAUSED_TITLE);
}

export function restoreVideo(video: HTMLVideoElement, originalState: VideoState): void {
  if (originalState.autoplay) {
    video.setAttribute("autoplay", "true");
    if (!video.hasAttribute("data-user-interacted")) {
      video.play().catch(() => console.warn("Autoplay prevented by browser policy"));
    }
  }

  video.muted = originalState.muted;
  video.loop = originalState.loop;

  if (video.hasAttribute("data-controls-added")) {
    video.removeAttribute("controls");
    video.removeAttribute("data-controls-added");
  }

  video.removeAttribute("data-reduced-motion-paused");
  video.removeAttribute("aria-label");
  video.removeAttribute("title");
}

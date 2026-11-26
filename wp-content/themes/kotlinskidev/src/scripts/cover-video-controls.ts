import { REVEAL_AFTER_END_SELECTOR } from "./scroll-animation-selectors";
import { showFirstFrame } from "./cover-video-controls/first-frame";
import { pauseWhenOffscreen } from "./cover-video-controls/pause-offscreen";
import { revealAfterEnd } from "./cover-video-controls/reveal-after-end";

const MANUAL_START_VIDEO_SELECTOR = "video[data-kt-video-autoplay='off']";
const PAUSE_OFFSCREEN_VIDEO_SELECTOR = "video[data-kt-video-pause-offscreen='true']";

export const initCoverVideoControls = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLVideoElement>(MANUAL_START_VIDEO_SELECTOR).forEach(showFirstFrame);
  root
    .querySelectorAll<HTMLVideoElement>(PAUSE_OFFSCREEN_VIDEO_SELECTOR)
    .forEach(pauseWhenOffscreen);
  root.querySelectorAll<HTMLElement>(REVEAL_AFTER_END_SELECTOR).forEach(revealAfterEnd);
};

initCoverVideoControls();

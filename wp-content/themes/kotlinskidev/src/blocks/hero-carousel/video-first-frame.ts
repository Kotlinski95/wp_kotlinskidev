const PENDING_CLASS = "hero-carousel__bg--video-pending";
const POSTER_PROPERTY = "--kt-hero-poster";
const FALLBACK_RELEASE_MS = 4000;

export const holdVideoUntilFirstFrame = (video: HTMLVideoElement): boolean => {
  const container = video.closest<HTMLElement>(".hero-carousel__bg");
  if (!container || video.dataset.ktFrameHold) {
    return false;
  }
  video.dataset.ktFrameHold = "true";

  if (video.poster) {
    container.style.setProperty(POSTER_PROPERTY, `url(${JSON.stringify(video.poster)})`);
  }
  container.classList.add(PENDING_CLASS);

  let released = false;
  const release = (): void => {
    if (released) {
      return;
    }
    released = true;
    container.classList.remove(PENDING_CLASS);
  };

  const onPlaying = (): void => {
    window.setTimeout(release, FALLBACK_RELEASE_MS);
    if (typeof video.requestVideoFrameCallback === "function") {
      video.requestVideoFrameCallback(release);
    } else {
      video.addEventListener("timeupdate", release, { once: true });
    }
  };

  if (!video.paused && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    onPlaying();
  } else {
    video.addEventListener("playing", onPlaying, { once: true });
  }

  return true;
};

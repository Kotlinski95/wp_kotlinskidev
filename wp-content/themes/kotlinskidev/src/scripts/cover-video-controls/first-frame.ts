const FIRST_FRAME_TIME = 0.001;

export const showFirstFrame = (video: HTMLVideoElement): void => {
  const seek = () => {
    video.currentTime = FIRST_FRAME_TIME;
  };

  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    seek();
    return;
  }

  video.addEventListener("loadedmetadata", seek, { once: true });
};

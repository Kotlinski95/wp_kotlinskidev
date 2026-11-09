const NEAR_VIEWPORT_MARGIN = "200px";

const activate = (video: HTMLVideoElement): void => {
  if (video.dataset.src) {
    video.src = video.dataset.src;
    delete video.dataset.src;
  }
  if (video.dataset.poster) {
    video.poster = video.dataset.poster;
    delete video.dataset.poster;
  }
  video.play()?.catch(() => undefined);
};

const initDeviceFrameVideos = (): void => {
  const videos = document.querySelectorAll<HTMLVideoElement>(
    "video.kt-device-frame__image[data-src], video.kt-device-frame__image[data-poster]"
  );
  if (!videos.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) {
          activate(video);
        } else if (!video.dataset.src) {
          video.pause();
        }
      });
    },
    { rootMargin: NEAR_VIEWPORT_MARGIN }
  );

  videos.forEach((video) => observer.observe(video));
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDeviceFrameVideos);
} else {
  initDeviceFrameVideos();
}

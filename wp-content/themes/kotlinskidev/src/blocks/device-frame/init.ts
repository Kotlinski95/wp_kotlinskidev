import {
  clearVideoPosterData,
  clearVideoSourceData,
  resolveVideoPoster,
  resolveVideoSource,
} from "@utils/responsive-media";

const NEAR_VIEWPORT_MARGIN = "200px";

const activate = (video: HTMLVideoElement): void => {
  const source = resolveVideoSource(video);
  if (source) {
    video.src = source;
    clearVideoSourceData(video);
  }
  const poster = resolveVideoPoster(video);
  if (poster) {
    video.poster = poster;
    clearVideoPosterData(video);
  }
  video.play()?.catch(() => undefined);
};

const loadLightboxVideos = (event: Event): void => {
  const modal = (event as CustomEvent<{ modal: HTMLElement }>).detail?.modal;
  modal?.querySelectorAll<HTMLVideoElement>("video[data-src]").forEach((video) => {
    video.src = video.dataset.src ?? "";
    delete video.dataset.src;
  });
};

const initDeviceFrameVideos = (): void => {
  document.addEventListener("kt-modal:open", loadLightboxVideos);
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

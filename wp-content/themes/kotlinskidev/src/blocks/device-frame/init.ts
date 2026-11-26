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

const findPoster = (video: HTMLVideoElement): Element | null =>
  video.closest(".kt-device-frame__screen")?.querySelector(".kt-device-frame__poster") ?? null;

const whenIdleAfterLoad = (callback: () => void): void => {
  const run = (): void => {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(callback, { timeout: 1500 });
      return;
    }
    window.setTimeout(callback, 0);
  };
  if (document.readyState === "complete") {
    run();
    return;
  }
  window.addEventListener("load", run, { once: true });
};

const watchPlaying = (video: HTMLVideoElement): void => {
  const screen = video.closest(".kt-device-frame__screen");
  if (!screen) {
    return;
  }
  video.addEventListener(
    "playing",
    () => {
      const reveal = (): void => {
        video.classList.add("is-playing");
        screen.classList.add("kt-device-frame__screen--playing");
      };
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(reveal);
        window.setTimeout(reveal, 1000);
        return;
      }
      reveal();
    },
    { once: true }
  );
};

const loadLightboxVideos = (event: Event): void => {
  const modal = (event as CustomEvent<{ modal: HTMLElement }>).detail?.modal;
  modal?.querySelectorAll<HTMLVideoElement>("video[data-src]").forEach((video) => {
    if (video.dataset.poster) {
      video.poster = video.dataset.poster;
      delete video.dataset.poster;
    }
    video.preload = "auto";
    video.src = video.dataset.src ?? "";
    delete video.dataset.src;
    video.load();
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
          if (video.dataset.src && findPoster(video)) {
            watchPlaying(video);
            whenIdleAfterLoad(() => activate(video));
            return;
          }
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

type Device = "mobile" | "tablet" | "desktop";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const DATASET_KEY: Record<Device, "ktSrcMobile" | "ktSrcTablet" | "ktSrcDesktop"> = {
  mobile: "ktSrcMobile",
  tablet: "ktSrcTablet",
  desktop: "ktSrcDesktop",
};

const POSTER_KEY: Record<Device, "ktPosterMobile" | "ktPosterTablet" | "ktPosterDesktop"> = {
  mobile: "ktPosterMobile",
  tablet: "ktPosterTablet",
  desktop: "ktPosterDesktop",
};

const applyPoster = (video: HTMLVideoElement, device: Device): void => {
  const poster = video.dataset[POSTER_KEY[device]];

  if (poster === undefined) {
    return;
  }

  if (poster === "") {
    video.removeAttribute("poster");
    return;
  }

  video.setAttribute("poster", poster);
};

const readBreakpoint = (
  video: HTMLVideoElement,
  key: "ktBpMobile" | "ktBpTablet"
): number | null => {
  const value = Number(video.dataset[key]);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const shouldPlay = (video: HTMLVideoElement): boolean =>
  video.dataset.ktVideoAutoplay !== "off" && !window.matchMedia(REDUCED_MOTION_QUERY).matches;

const applySource = (video: HTMLVideoElement, device: Device): void => {
  applyPoster(video, device);

  const source = video.dataset[DATASET_KEY[device]];

  if (!source || video.getAttribute("src") === source) {
    return;
  }

  video.setAttribute("src", source);
  video.load();

  if (shouldPlay(video)) {
    void video.play().catch(() => undefined);
  }
};

const bindVideo = (video: HTMLVideoElement): void => {
  const mobileMax = readBreakpoint(video, "ktBpMobile");
  const tabletMax = readBreakpoint(video, "ktBpTablet");

  if (mobileMax === null || tabletMax === null) {
    return;
  }

  const mobileQuery = window.matchMedia(`(max-width: ${mobileMax}px)`);
  const tabletQuery = window.matchMedia(`(max-width: ${tabletMax}px)`);

  const currentDevice = (): Device => {
    if (mobileQuery.matches) {
      return "mobile";
    }
    return tabletQuery.matches ? "tablet" : "desktop";
  };

  const update = () => applySource(video, currentDevice());

  mobileQuery.addEventListener("change", update);
  tabletQuery.addEventListener("change", update);
  update();
};

export const initResponsiveMedia = (root: ParentNode = document): void => {
  root.querySelectorAll<HTMLVideoElement>("video[data-kt-src-desktop]").forEach(bindVideo);
};

initResponsiveMedia();

import { getBreakpoints } from "../scripts/utils";

export type Device = "mobile" | "tablet" | "desktop";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

const SRC_KEY: Record<Device, "ktSrcMobile" | "ktSrcTablet" | "ktSrcDesktop"> = {
  mobile: "ktSrcMobile",
  tablet: "ktSrcTablet",
  desktop: "ktSrcDesktop",
};

const ALPHA_SRC_KEY: Record<Device, "ktSrcAlphaMobile" | "ktSrcAlphaTablet" | "ktSrcAlphaDesktop"> =
  {
    mobile: "ktSrcAlphaMobile",
    tablet: "ktSrcAlphaTablet",
    desktop: "ktSrcAlphaDesktop",
  };

const POSTER_KEY: Record<Device, "ktPosterMobile" | "ktPosterTablet" | "ktPosterDesktop"> = {
  mobile: "ktPosterMobile",
  tablet: "ktPosterTablet",
  desktop: "ktPosterDesktop",
};

const deviceQueries = (): { mobile: string; tablet: string } => {
  const breakpoints = getBreakpoints();
  return {
    mobile: `(max-width: ${breakpoints.mobile_max}px)`,
    tablet: `(max-width: ${breakpoints.tablet_max}px)`,
  };
};

export const currentDevice = (): Device => {
  const queries = deviceQueries();

  if (typeof window.matchMedia === "function") {
    if (window.matchMedia(queries.mobile).matches) {
      return "mobile";
    }
    return window.matchMedia(queries.tablet).matches ? "tablet" : "desktop";
  }

  const breakpoints = getBreakpoints();
  if (window.innerWidth <= breakpoints.mobile_max) {
    return "mobile";
  }
  return window.innerWidth <= breakpoints.tablet_max ? "tablet" : "desktop";
};

export const watchDevice = (callback: (device: Device) => void): void => {
  if (typeof window.matchMedia !== "function") {
    return;
  }

  const queries = deviceQueries();
  const notify = () => callback(currentDevice());
  window.matchMedia(queries.mobile).addEventListener("change", notify);
  window.matchMedia(queries.tablet).addEventListener("change", notify);
};

export const resolveVideoSource = (
  video: HTMLVideoElement,
  device: Device = currentDevice()
): string | undefined => video.dataset[SRC_KEY[device]] || video.dataset.src || undefined;

export const resolveVideoAlphaSource = (
  video: HTMLVideoElement,
  device: Device = currentDevice()
): string | undefined =>
  video.dataset[ALPHA_SRC_KEY[device]] || video.dataset.srcAlpha || undefined;

export const resolveVideoPoster = (
  video: HTMLVideoElement,
  device: Device = currentDevice()
): string | undefined => video.dataset[POSTER_KEY[device]] ?? video.dataset.poster;

export const clearVideoSourceData = (video: HTMLVideoElement): void => {
  (Object.keys(SRC_KEY) as Device[]).forEach((device) => {
    delete video.dataset[SRC_KEY[device]];
  });
  (Object.keys(ALPHA_SRC_KEY) as Device[]).forEach((device) => {
    delete video.dataset[ALPHA_SRC_KEY[device]];
  });
  delete video.dataset.src;
};

export const clearVideoPosterData = (video: HTMLVideoElement): void => {
  (Object.keys(POSTER_KEY) as Device[]).forEach((device) => {
    delete video.dataset[POSTER_KEY[device]];
  });
  delete video.dataset.poster;
};

const shouldPlay = (video: HTMLVideoElement): boolean =>
  video.dataset.ktVideoAutoplay !== "off" && !window.matchMedia(REDUCED_MOTION_QUERY).matches;

export const applyResponsiveVideo = (
  video: HTMLVideoElement,
  device: Device = currentDevice()
): void => {
  const poster = resolveVideoPoster(video, device);

  if (poster === "") {
    video.removeAttribute("poster");
  } else if (poster !== undefined) {
    video.setAttribute("poster", poster);
  }

  const source = video.dataset[SRC_KEY[device]];

  if (!source || video.getAttribute("src") === source) {
    return;
  }

  video.setAttribute("src", source);
  video.load();

  if (shouldPlay(video)) {
    void video.play().catch(() => undefined);
  }
};

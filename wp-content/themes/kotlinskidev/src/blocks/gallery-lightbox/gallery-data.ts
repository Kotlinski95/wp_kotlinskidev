import type { CarouselSettings } from "@utils/carousel/types";

export interface GalleryMedia {
  src: string;
  alt: string;
  type: "image" | "video";
  poster: string;
  width: number;
  height: number;
}

export interface GalleryLightboxSettings extends Partial<CarouselSettings> {
  lockHeight?: boolean;
  videoControls?: boolean;
  videoAutoplay?: boolean;
  videoLoop?: boolean;
  videoMuted?: boolean;
}

interface ThemeWindow {
  kotlinskiTheme?: {
    breakpoints?: { mobile_max?: number };
    mobileBreakpoint?: number;
  };
}

const DEFAULT_MOBILE_BREAKPOINT_PX = 781;

const themeWindow = window as unknown as ThemeWindow;

export const MOBILE_BREAKPOINT: number =
  themeWindow.kotlinskiTheme?.breakpoints?.mobile_max ??
  themeWindow.kotlinskiTheme?.mobileBreakpoint ??
  DEFAULT_MOBILE_BREAKPOINT_PX;

export const isMobileViewport = (): boolean =>
  window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

const parseMobileImages = (gallery: HTMLElement): GalleryMedia[] | null => {
  if (!isMobileViewport() || !gallery.dataset.mobileImages) {
    return null;
  }
  try {
    const mobile = JSON.parse(gallery.dataset.mobileImages);
    return Array.isArray(mobile) && mobile.length ? mobile : null;
  } catch {
    return null;
  }
};

export const parseImages = (gallery: HTMLElement): GalleryMedia[] => {
  const mobileImages = parseMobileImages(gallery);
  if (mobileImages) {
    return mobileImages;
  }
  try {
    return JSON.parse(gallery.dataset.images ?? "[]");
  } catch {
    return [];
  }
};

export const parseSettings = (gallery: HTMLElement): GalleryLightboxSettings => {
  try {
    return JSON.parse(gallery.dataset.settings ?? "{}");
  } catch {
    return {};
  }
};

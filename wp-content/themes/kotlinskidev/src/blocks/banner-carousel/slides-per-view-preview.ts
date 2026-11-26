import type React from "react";
import type { CarouselSettings } from "@utils/carousel/types";

type SlidesPerView = CarouselSettings["slidesPerView"];

interface SlidesPerViewByBreakpoint {
  base: SlidesPerView;
  mobile: SlidesPerView;
  tablet: SlidesPerView;
  desktop: SlidesPerView;
}

const SLIDES_VARIABLE_BY_BREAKPOINT: Record<keyof SlidesPerViewByBreakpoint, string> = {
  base: "--banner-slides-base",
  mobile: "--banner-slides-mobile",
  tablet: "--banner-slides-tablet",
  desktop: "--banner-slides-desktop",
};

const AUTO_CLASS_BY_BREAKPOINT: Record<keyof SlidesPerViewByBreakpoint, string> = {
  base: "banner-carousel--base-auto",
  mobile: "banner-carousel--mobile-auto",
  tablet: "banner-carousel--tablet-auto",
  desktop: "banner-carousel--desktop-auto",
};

const BREAKPOINT_ORDER: Array<keyof SlidesPerViewByBreakpoint> = [
  "base",
  "mobile",
  "tablet",
  "desktop",
];

export const buildPreviewClassName = (slidesPerView: SlidesPerViewByBreakpoint): string =>
  [
    "banner-carousel",
    ...BREAKPOINT_ORDER.map((breakpoint) =>
      slidesPerView[breakpoint] === "auto" ? AUTO_CLASS_BY_BREAKPOINT[breakpoint] : ""
    ),
  ]
    .filter(Boolean)
    .join(" ");

export const buildPreviewStyle = (
  slidesPerView: SlidesPerViewByBreakpoint
): React.CSSProperties => {
  const previewStyle: Record<string, string> = {};
  BREAKPOINT_ORDER.forEach((breakpoint) => {
    if (slidesPerView[breakpoint] !== "auto") {
      previewStyle[SLIDES_VARIABLE_BY_BREAKPOINT[breakpoint]] = String(slidesPerView[breakpoint]);
    }
  });
  return previewStyle as React.CSSProperties;
};

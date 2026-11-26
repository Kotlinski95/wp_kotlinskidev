import type React from "react";
import { DEFAULT_SLIDE_MAX_WIDTH } from "./constants";
import type { SliderAttributes } from "./slider-attributes";

export interface PaletteEntry {
  name: string;
  slug: string;
  color: string;
}

export const SLIDE_MAX_WIDTH_UNITS = [
  { value: "px", label: "px", default: 900 },
  { value: "%", label: "%", default: 50 },
  { value: "rem", label: "rem", default: 56.25 },
  { value: "vw", label: "vw", default: 70 },
];

export const toPaletteEntries = (raw: unknown): PaletteEntry[] => {
  if (Array.isArray(raw)) {
    return raw as PaletteEntry[];
  }
  if (raw && typeof raw === "object") {
    return Object.values(raw as Record<string, unknown>).flatMap(toPaletteEntries);
  }
  return [];
};

export const normalizeSlideMaxWidth = (value: SliderAttributes["slideMaxWidth"]): string =>
  typeof value === "number" ? `${value}px` : value || DEFAULT_SLIDE_MAX_WIDTH;

const flatWidth = (perView: number | "auto", spaceBetween: number): string =>
  perView === "auto" ? "auto" : `calc((100% - ${spaceBetween * (perView - 1)}px) / ${perView})`;

const centeredLayout = (attributes: SliderAttributes) => ({
  className: "swiper has-center-slides",
  style: {
    "--kt-slider-slide-width": `${100 - attributes.peek * 2}%`,
    "--kt-slider-slide-max-width": normalizeSlideMaxWidth(attributes.slideMaxWidth),
  } as React.CSSProperties,
});

const flatLayout = (attributes: SliderAttributes) => ({
  className: "swiper",
  style: {
    "--kt-slider-editor-flat-width": flatWidth(
      attributes.slidesPerView || 1,
      attributes.spaceBetween
    ),
    "--kt-slider-editor-flat-width-mobile": flatWidth(
      attributes.slidesPerMobile || 1,
      attributes.spaceBetween
    ),
    "--kt-slider-editor-flat-width-tablet": flatWidth(
      attributes.slidesPerTablet || 1,
      attributes.spaceBetween
    ),
    "--kt-slider-editor-flat-width-desktop": flatWidth(
      attributes.slidesPerDesktop || 1,
      attributes.spaceBetween
    ),
  } as React.CSSProperties,
});

export const editorSlideLayoutVars = (
  attributes: SliderAttributes
): { className: string; style: React.CSSProperties } =>
  attributes.centerSlides ? centeredLayout(attributes) : flatLayout(attributes);

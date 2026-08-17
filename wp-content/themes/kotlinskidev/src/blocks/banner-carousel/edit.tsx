import React from "react";
import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
} from "@wordpress/block-editor";
import CarouselPanel from "@utils/carousel/CarouselPanel";
import type { CarouselSettings } from "@utils/carousel/types";
import "./style.scss";

export interface BannerCarouselAttributes extends Partial<CarouselSettings> {
  images: { id: number; url: string; alt?: string }[];
}

export default function Edit({
  attributes,
  setAttributes,
}: {
  attributes: BannerCarouselAttributes;
  setAttributes: (attributes: Partial<BannerCarouselAttributes>) => void;
}) {
  const { images = [], ...carouselSettings } = attributes;
  const {
    slidesPerView = 1,
    slidesPerMobile = 1,
    slidesPerTablet = 1,
    slidesPerDesktop = 1,
  } = carouselSettings;

  const onSelectImages = (newImages: { id: number; url: string; alt?: string }[]) => {
    setAttributes({ images: newImages.map((img) => ({ id: img.id, url: img.url, alt: img.alt })) });
  };

  const previewClassName = [
    "banner-carousel",
    slidesPerView === "auto" ? "banner-carousel--base-auto" : "",
    slidesPerMobile === "auto" ? "banner-carousel--mobile-auto" : "",
    slidesPerTablet === "auto" ? "banner-carousel--tablet-auto" : "",
    slidesPerDesktop === "auto" ? "banner-carousel--desktop-auto" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const previewStyle: Record<string, string> = {};
  if (slidesPerView !== "auto") {
    previewStyle["--banner-slides-base"] = String(slidesPerView);
  }
  if (slidesPerMobile !== "auto") {
    previewStyle["--banner-slides-mobile"] = String(slidesPerMobile);
  }
  if (slidesPerTablet !== "auto") {
    previewStyle["--banner-slides-tablet"] = String(slidesPerTablet);
  }
  if (slidesPerDesktop !== "auto") {
    previewStyle["--banner-slides-desktop"] = String(slidesPerDesktop);
  }

  return (
    <>
      <InspectorControls>
        <CarouselPanel
          settings={carouselSettings}
          onChange={(partial) => setAttributes(partial)}
          features={{
            slidesPerBreakpoint: true,
            scrollbar: true,
            autoplay: true,
            arrowsPosition: true,
            navColor: true,
            navPlacement: true,
          }}
        />
      </InspectorControls>
      <div
        {...useBlockProps({
          className: previewClassName,
          style: previewStyle as React.CSSProperties,
        })}
      >
        <MediaUploadCheck>
          <MediaUpload
            onSelect={onSelectImages}
            allowedTypes={["image"]}
            multiple
            gallery
            value={images.map((img) => img.id)}
            render={({ open }) => (
              <button onClick={open} className="button button-primary">
                {images.length ? "Edit Banners" : "Add Banners"}
              </button>
            )}
          />
        </MediaUploadCheck>
        <div className="swiper">
          <div className="swiper-wrapper">
            {images.map((img, i) => (
              <div className="swiper-slide" key={i}>
                <img src={img.url} alt={img.alt || ""} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

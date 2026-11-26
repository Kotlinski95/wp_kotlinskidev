import React from "react";
import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
} from "@wordpress/block-editor";
import CarouselPanel from "@utils/carousel/CarouselPanel";
import type { CarouselSettings } from "@utils/carousel/types";
import { buildPreviewClassName, buildPreviewStyle } from "./slides-per-view-preview";
import "./style.scss";

export interface BannerCarouselAttributes extends Partial<CarouselSettings> {
  images: { id: number; url: string; alt?: string }[];
}

const CAROUSEL_PANEL_FEATURES = {
  slidesPerBreakpoint: true,
  scrollbar: true,
  autoplay: true,
  arrowsPosition: true,
  navColor: true,
  navPlacement: true,
  transitionEffect: true,
};

type BannerImage = BannerCarouselAttributes["images"][number];

interface BannerPreviewProps {
  images: BannerImage[];
  slidesPerView: Parameters<typeof buildPreviewClassName>[0];
  onSelectImages: (newImages: BannerImage[]) => void;
}

const BannerPreview = ({ images, slidesPerView, onSelectImages }: BannerPreviewProps) => (
  <div
    {...useBlockProps({
      className: buildPreviewClassName(slidesPerView),
      style: buildPreviewStyle(slidesPerView),
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
);

export default function Edit({
  attributes,
  setAttributes,
}: {
  attributes: BannerCarouselAttributes;
  setAttributes: (attributes: Partial<BannerCarouselAttributes>) => void;
}) {
  const { images = [], ...carouselSettings } = attributes;
  const {
    slidesPerView: slidesPerViewBase = 1,
    slidesPerMobile = 1,
    slidesPerTablet = 1,
    slidesPerDesktop = 1,
  } = carouselSettings;

  const onSelectImages = (newImages: { id: number; url: string; alt?: string }[]) => {
    setAttributes({ images: newImages.map((img) => ({ id: img.id, url: img.url, alt: img.alt })) });
  };

  const slidesPerView = {
    base: slidesPerViewBase,
    mobile: slidesPerMobile,
    tablet: slidesPerTablet,
    desktop: slidesPerDesktop,
  };

  return (
    <>
      <InspectorControls>
        <CarouselPanel
          settings={carouselSettings}
          onChange={(partial) => setAttributes(partial)}
          features={CAROUSEL_PANEL_FEATURES}
        />
      </InspectorControls>
      <BannerPreview
        images={images}
        slidesPerView={slidesPerView}
        onSelectImages={onSelectImages}
      />
    </>
  );
}

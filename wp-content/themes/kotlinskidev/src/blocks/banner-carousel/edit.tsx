import React from "react";
import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
} from "@wordpress/block-editor";
import { CheckboxControl, RangeControl, PanelBody } from "@wordpress/components";
import "./style.scss";

interface BannerCarouselAttributes {
  images: { id: number; url: string; alt?: string }[];
  showPagination: boolean;
  showArrows: boolean;
  slidesPerView: number;
  enableAutoSwiping: boolean;
  autoSwipingTime: number;
  enableLoopMode: boolean;
  slidesPerMobile: number;
  slidesPerTablet: number;
  slidesPerDesktop: number;
  showScrollbar: boolean;
}

export default function Edit({
  attributes,
  setAttributes,
}: {
  attributes: BannerCarouselAttributes;
  setAttributes: (attributes: Partial<BannerCarouselAttributes>) => void;
}) {
  const {
    images = [],
    showPagination = true,
    showArrows = true,
    slidesPerView = 1,
    enableAutoSwiping = false,
    autoSwipingTime = 1,
    enableLoopMode = false,
    slidesPerMobile = 1,
    slidesPerTablet = 1,
    slidesPerDesktop = 1,
    showScrollbar = false,
  } = attributes;

  const onSelectImages = (newImages: { id: number; url: string; alt?: string }[]) => {
    setAttributes({ images: newImages.map((img) => ({ id: img.id, url: img.url, alt: img.alt })) });
  };

  return (
    <>
      <InspectorControls>
        <PanelBody title="Carousel Settings" initialOpen={true}>
          <CheckboxControl
            label="Show Pagination"
            checked={showPagination}
            onChange={(value) => setAttributes({ showPagination: value })}
          />
          <CheckboxControl
            label="Show Arrows"
            checked={showArrows}
            onChange={(value) => setAttributes({ showArrows: value })}
          />
          <RangeControl
            label="Slides Per View"
            value={slidesPerView}
            onChange={(value) => setAttributes({ slidesPerView: value || 1 })}
            min={1}
            max={5}
          />
          <CheckboxControl
            label="Enable Auto Swiping"
            checked={enableAutoSwiping}
            onChange={(value) => setAttributes({ enableAutoSwiping: value })}
          />
          <RangeControl
            label="Auto Swiping Time (seconds)"
            value={autoSwipingTime}
            onChange={(value) => setAttributes({ autoSwipingTime: value || 1 })}
            min={1}
            max={10}
          />
          <CheckboxControl
            label="Enable Loop Mode"
            checked={enableLoopMode}
            onChange={(value) => setAttributes({ enableLoopMode: value })}
          />
          <RangeControl
            label="Slides Per View (Mobile)"
            value={slidesPerMobile}
            onChange={(value) => setAttributes({ slidesPerMobile: value || 1 })}
            min={1}
            max={5}
          />
          <RangeControl
            label="Slides Per View (Tablet)"
            value={slidesPerTablet}
            onChange={(value) => setAttributes({ slidesPerTablet: value || 1 })}
            min={1}
            max={5}
          />
          <RangeControl
            label="Slides Per View (Desktop)"
            value={slidesPerDesktop}
            onChange={(value) => setAttributes({ slidesPerDesktop: value || 1 })}
            min={1}
            max={5}
          />
          <CheckboxControl
            label="Show Scrollbar"
            checked={showScrollbar}
            onChange={(value) => setAttributes({ showScrollbar: value })}
          />
        </PanelBody>
      </InspectorControls>
      <div {...useBlockProps()}>
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

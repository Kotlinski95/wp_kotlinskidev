import React from "react";
import { PanelBody, RangeControl, ToggleControl, SelectControl } from "@wordpress/components";
import { __experimentalColorGradientControl as ColorGradientControl } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import type { CarouselSettings, CarouselFeatures } from "./types";
import SlidesPerViewControl from "./SlidesPerViewControl";

interface CarouselPanelProps {
  settings: Partial<CarouselSettings>;
  onChange: (partial: Partial<CarouselSettings>) => void;
  features?: CarouselFeatures;
  title?: string;
}

export default function CarouselPanel({
  settings,
  onChange,
  features = {},
  title,
}: CarouselPanelProps) {
  const {
    showArrows = true,
    showPagination = true,
    showScrollbar = false,
    loop = true,
    draggable = true,
    autoplay = false,
    autoplayDelay = 3000,
    slidesPerView = 1,
    slidesPerMobile = 1,
    slidesPerTablet = 1,
    slidesPerDesktop = 1,
    lazyLoad = false,
    arrowsPosition = "sides",
    navColor = "",
    navColorOnHover = false,
    navPlacement = "inside",
    trackActiveSlide = false,
    paginationPlacement = "inside",
  } = settings;

  const pendingNavColorRef = React.useRef<string | null>(null);

  const handleNavColorChange = (value: string | undefined) => {
    if (value !== undefined) {
      pendingNavColorRef.current = value;
      onChange({ navColor: value });
    } else if (pendingNavColorRef.current !== null) {
      pendingNavColorRef.current = null;
    } else {
      onChange({ navColor: "" });
    }
  };

  const isNavGradient = navColor.includes("gradient");

  return (
    <PanelBody title={title ?? __("Carousel Settings", "kotlinskidev")} initialOpen={true}>
      <ToggleControl
        label={__("Show Arrows", "kotlinskidev")}
        checked={showArrows}
        onChange={(value) => onChange({ showArrows: value })}
      />
      {showArrows && features.arrowsPosition && (
        <SelectControl
          label={__("Arrows Position", "kotlinskidev")}
          value={arrowsPosition}
          options={[
            { label: __("Default (sides)", "kotlinskidev"), value: "sides" },
            { label: __("Bottom left", "kotlinskidev"), value: "bottom-left" },
            { label: __("Bottom center", "kotlinskidev"), value: "bottom-center" },
            { label: __("Bottom right", "kotlinskidev"), value: "bottom-right" },
          ]}
          onChange={(value) =>
            onChange({ arrowsPosition: value as CarouselSettings["arrowsPosition"] })
          }
        />
      )}
      {showArrows && features.navPlacement && arrowsPosition !== "sides" && (
        <ToggleControl
          label={__("Show navigation outside carousel", "kotlinskidev")}
          help={__("Renders nav below the slides instead of overlaying them.", "kotlinskidev")}
          checked={navPlacement === "outside"}
          onChange={(value) => onChange({ navPlacement: value ? "outside" : "inside" })}
        />
      )}
      {(showArrows || showPagination) && features.navColor && (
        <ColorGradientControl
          label={__("Navigation color", "kotlinskidev")}
          colorValue={navColor && !isNavGradient ? navColor : undefined}
          gradientValue={isNavGradient ? navColor : undefined}
          onColorChange={handleNavColorChange}
          onGradientChange={handleNavColorChange}
          clearable={true}
          __experimentalIsRenderedInSidebar={true}
          __nextHasNoMarginBottom
        />
      )}
      {(showArrows || showPagination) && features.navColor && navColor && (
        <ToggleControl
          label={__("Color on hover only", "kotlinskidev")}
          help={__("Uses default colors normally; applies custom color on hover.", "kotlinskidev")}
          checked={navColorOnHover}
          onChange={(value) => onChange({ navColorOnHover: value })}
        />
      )}
      <ToggleControl
        label={__("Show Pagination", "kotlinskidev")}
        checked={showPagination}
        onChange={(value) => onChange({ showPagination: value })}
      />
      {showPagination && features.paginationPlacement && (
        <ToggleControl
          label={__("Show pagination outside carousel", "kotlinskidev")}
          help={__(
            "Renders the pagination dots below the slides instead of overlaying them.",
            "kotlinskidev"
          )}
          checked={paginationPlacement === "outside"}
          onChange={(value) => onChange({ paginationPlacement: value ? "outside" : "inside" })}
        />
      )}
      {features.scrollbar && (
        <ToggleControl
          label={__("Show Scrollbar", "kotlinskidev")}
          checked={showScrollbar}
          onChange={(value) => onChange({ showScrollbar: value })}
        />
      )}
      <ToggleControl
        label={__("Loop Mode", "kotlinskidev")}
        checked={loop}
        onChange={(value) => onChange({ loop: value })}
      />
      <ToggleControl
        label={__("Draggable", "kotlinskidev")}
        help={__("Lets users manually swipe/drag through the slides.", "kotlinskidev")}
        checked={draggable}
        onChange={(value) => onChange({ draggable: value })}
      />
      {features.autoplay && (
        <>
          <ToggleControl
            label={__("Autoplay", "kotlinskidev")}
            checked={autoplay}
            onChange={(value) => onChange({ autoplay: value })}
          />
          {autoplay && (
            <RangeControl
              label={__("Autoplay Delay (seconds)", "kotlinskidev")}
              value={autoplayDelay / 1000}
              onChange={(value) => onChange({ autoplayDelay: (value ?? 3) * 1000 })}
              min={1}
              max={10}
            />
          )}
        </>
      )}
      {features.lazyLoad && (
        <ToggleControl
          label={__("Lazy Load First Image", "kotlinskidev")}
          help={__("Enable if this block is below the fold.", "kotlinskidev")}
          checked={lazyLoad}
          onChange={(value) => onChange({ lazyLoad: value })}
        />
      )}
      {features.trackActiveSlide && (
        <ToggleControl
          label={__("Track active slide", "kotlinskidev")}
          help={__(
            "Keeps the featured image and counter in sync with the last viewed slide.",
            "kotlinskidev"
          )}
          checked={trackActiveSlide}
          onChange={(value) => onChange({ trackActiveSlide: value })}
        />
      )}
      {features.slidesPerBreakpoint && (
        <>
          <SlidesPerViewControl
            label={__("Slides Per View", "kotlinskidev")}
            value={slidesPerView}
            onChange={(value) => onChange({ slidesPerView: value })}
          />
          <SlidesPerViewControl
            label={__("Slides (Mobile)", "kotlinskidev")}
            value={slidesPerMobile}
            onChange={(value) => onChange({ slidesPerMobile: value })}
          />
          <SlidesPerViewControl
            label={__("Slides (Tablet)", "kotlinskidev")}
            value={slidesPerTablet}
            onChange={(value) => onChange({ slidesPerTablet: value })}
          />
          <SlidesPerViewControl
            label={__("Slides (Desktop)", "kotlinskidev")}
            value={slidesPerDesktop}
            onChange={(value) => onChange({ slidesPerDesktop: value })}
          />
        </>
      )}
    </PanelBody>
  );
}

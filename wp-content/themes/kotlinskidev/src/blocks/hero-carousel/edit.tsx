import React from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import CarouselPanel from "@utils/carousel/CarouselPanel";
import type { CarouselSettings } from "@utils/carousel/types";
import { EditorNav, EditorPagination } from "./hero-editor-nav";
import type { HeroCarouselEditProps } from "./hero-carousel-attributes";
import { SlidesPanel } from "./hero-slides-panel";
import { useHeroSlides } from "./use-hero-slides";
import "./style.scss";

export type { HeroCarouselAttributes } from "./hero-carousel-attributes";

const ALLOWED_BLOCKS = ["kotlinskidev/hero-carousel-slide"];

const SLIDES_TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/hero-carousel-slide", {}],
  ["kotlinskidev/hero-carousel-slide", {}],
];

const DEFAULT_MIN_HEIGHT_SVH = 80;

const CAROUSEL_PANEL_FEATURES = {
  arrowsPosition: true,
  navColor: true,
  navPlacement: true,
  autoplay: true,
  lazyLoad: true,
  transitionEffect: true,
  autoHeight: true,
};

const buildNavColorStyle = (
  navColor: string,
  navColorOnHover: boolean
): React.CSSProperties | undefined => {
  if (!navColor) {
    return undefined;
  }
  return navColorOnHover
    ? ({ "--carousel-nav-color-hover": navColor } as React.CSSProperties)
    : ({ "--carousel-nav-color": navColor } as React.CSSProperties);
};

const SlideWrapper = () => (
  <div className="swiper-wrapper">
    <InnerBlocks
      allowedBlocks={ALLOWED_BLOCKS}
      template={SLIDES_TEMPLATE}
      renderAppender={() => null}
    />
  </div>
);

interface HeightPanelProps {
  minHeight: number;
  autoHeight: boolean | undefined;
  setAttributes: HeroCarouselEditProps["setAttributes"];
}

const HeightPanel = ({ minHeight, autoHeight, setAttributes }: HeightPanelProps) => (
  <PanelBody title={__("Height", "kotlinskidev")} initialOpen={false}>
    <RangeControl
      label={__("Min Height (vh)", "kotlinskidev")}
      help={
        autoHeight
          ? __(
              "Auto Height is on (in Carousel Settings above) — this is now just a floor so slides never collapse below it.",
              "kotlinskidev"
            )
          : undefined
      }
      value={minHeight}
      onChange={(value) => setAttributes({ minHeight: value ?? DEFAULT_MIN_HEIGHT_SVH })}
      min={0}
      max={100}
    />
  </PanelBody>
);

const resolveNavSettings = (carouselSettings: Partial<CarouselSettings>) => {
  const {
    showArrows = true,
    showPagination = true,
    arrowsPosition = "sides",
    navColor = "",
    navColorOnHover = false,
    navPlacement = "inside",
  } = carouselSettings;
  const effectivePlacement: "inside" | "outside" =
    arrowsPosition === "sides" ? "inside" : (navPlacement ?? "inside");
  return {
    showArrows,
    showPagination,
    arrowsPosition,
    effectivePlacement,
    navColorStyle: buildNavColorStyle(navColor, navColorOnHover),
  };
};

const AddSlideButton = ({ onAddSlide }: { onAddSlide: () => void }) => (
  <button
    className="hero-carousel-editor__add"
    onClick={onAddSlide}
    title={__("Add slide", "kotlinskidev")}
  >
    +
  </button>
);

type HeroSlidesState = ReturnType<typeof useHeroSlides>;

interface HeroPartProps {
  attributes: HeroCarouselEditProps["attributes"];
  slides: HeroSlidesState;
}

const HeroInspector = ({
  attributes,
  slides,
  setAttributes,
}: HeroPartProps & Pick<HeroCarouselEditProps, "setAttributes">) => {
  const { minHeight = DEFAULT_MIN_HEIGHT_SVH, ...carouselSettings } = attributes;
  return (
    <InspectorControls>
      <SlidesPanel
        innerBlocks={slides.innerBlocks}
        activeSlide={slides.activeSlide}
        slideCount={slides.slideCount}
        handleNavigate={slides.handleNavigate}
        handleAddSlide={slides.handleAddSlide}
        handleRemoveSlide={slides.handleRemoveSlide}
      />
      <CarouselPanel
        settings={carouselSettings}
        onChange={(partial) => setAttributes(partial)}
        features={CAROUSEL_PANEL_FEATURES}
      />
      <HeightPanel
        minHeight={minHeight}
        autoHeight={carouselSettings.autoHeight}
        setAttributes={setAttributes}
      />
    </InspectorControls>
  );
};

const HeroCanvas = ({ attributes, slides }: HeroPartProps) => {
  const { minHeight = DEFAULT_MIN_HEIGHT_SVH, ...carouselSettings } = attributes;
  const { showArrows, showPagination, arrowsPosition, effectivePlacement, navColorStyle } =
    resolveNavSettings(carouselSettings);
  const { activeSlide, slideCount, handleNavigate, handleAddSlide } = slides;
  const blockProps = useBlockProps({ className: "hero-carousel" });
  const cursor = { activeSlide, slideCount, handleNavigate };

  const editorNav = showArrows ? (
    <EditorNav
      arrowsPosition={arrowsPosition}
      effectivePlacement={effectivePlacement}
      {...cursor}
    />
  ) : null;
  const editorPagination = showPagination ? <EditorPagination {...cursor} /> : null;

  return (
    <div
      {...blockProps}
      data-active-slide={activeSlide}
      style={
        {
          ...blockProps.style,
          "--hero-min-height": `calc(${minHeight}svh - var(--admin-bar-offset, 0px))`,
          ...(navColorStyle ?? {}),
        } as React.CSSProperties
      }
    >
      <div className="swiper hero-carousel__swiper">
        <SlideWrapper />
        {showArrows && effectivePlacement === "inside" ? editorNav : null}
        {showPagination && effectivePlacement === "inside" && arrowsPosition === "sides"
          ? editorPagination
          : null}
      </div>
      {showArrows && effectivePlacement === "outside" ? editorNav : null}
      <AddSlideButton onAddSlide={handleAddSlide} />
    </div>
  );
};

export default function Edit({ attributes, setAttributes, clientId }: HeroCarouselEditProps) {
  const slides = useHeroSlides(clientId);

  return (
    <>
      <HeroInspector attributes={attributes} slides={slides} setAttributes={setAttributes} />
      <HeroCanvas attributes={attributes} slides={slides} />
    </>
  );
}

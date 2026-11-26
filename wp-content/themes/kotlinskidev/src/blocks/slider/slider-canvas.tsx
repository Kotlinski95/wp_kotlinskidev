import React from "react";
import { BlockControls, ButtonBlockAppender } from "@wordpress/block-editor";
import { memo } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { onActivationKey } from "@utils/keyboardActivation";
import { editorSlideLayoutVars } from "./editor-layout";
import type { SliderAttributes } from "./slider-attributes";
import { SliderToolbar } from "./slider-toolbar";
import { useActiveSlide } from "./use-active-slide";

interface SliderCanvasProps {
  clientId: string;
  innerBlocksProps: Record<string, unknown>;
  attributes: SliderAttributes;
}

interface SlideNavigationProps {
  activeSlide: number;
  slideCount: number;
  goToSlide: (index: number) => void;
}

const SlideArrows = ({ activeSlide, slideCount, goToSlide }: SlideNavigationProps) => {
  const goToPrevious = () => activeSlide > 0 && goToSlide(activeSlide - 1);
  const goToNext = () => activeSlide < slideCount - 1 && goToSlide(activeSlide + 1);
  return (
    <>
      <div
        className={`swiper-button-prev${activeSlide === 0 ? " swiper-button-disabled" : ""}`}
        onClick={goToPrevious}
        onKeyDown={onActivationKey(goToPrevious)}
        role="button"
        tabIndex={0}
        aria-label={__("Previous slide", "kotlinskidev")}
      />
      <div
        className={`swiper-button-next${activeSlide === slideCount - 1 ? " swiper-button-disabled" : ""}`}
        onClick={goToNext}
        onKeyDown={onActivationKey(goToNext)}
        role="button"
        tabIndex={0}
        aria-label={__("Next slide", "kotlinskidev")}
      />
    </>
  );
};

const SlideDots = ({
  slideOrder,
  activeSlide,
  goToSlide,
}: {
  slideOrder: string[];
  activeSlide: number;
  goToSlide: (index: number) => void;
}) => (
  <div className="swiper-pagination">
    {slideOrder.map((id, i) => (
      <span
        key={id}
        className={`swiper-pagination-bullet${i === activeSlide ? " swiper-pagination-bullet-active" : ""}`}
        onClick={() => goToSlide(i)}
        onKeyDown={onActivationKey(() => goToSlide(i))}
        role="button"
        tabIndex={0}
        aria-label={`${__("Go to slide", "kotlinskidev")} ${i + 1}`}
      />
    ))}
  </div>
);

export const SliderCanvas = memo(
  ({ clientId, innerBlocksProps, attributes }: SliderCanvasProps): React.ReactElement => {
    const { activeSlide, goToSlide, slideOrder, swiperRef } = useActiveSlide(clientId);
    const slideCount = slideOrder.length;
    const hasFrontendSwitcher =
      attributes.navigation || attributes.pagination || attributes.scrollbar;
    const showArrows = slideCount > 1 && (attributes.navigation || !hasFrontendSwitcher);
    const showDots = slideCount > 1 && (attributes.pagination || !hasFrontendSwitcher);
    const { className: swiperClassName, style: swiperStyle } = editorSlideLayoutVars(attributes);

    return (
      <>
        <BlockControls>
          <SliderToolbar clientId={clientId} />
        </BlockControls>

        <div ref={swiperRef} className={swiperClassName} style={swiperStyle}>
          <div {...innerBlocksProps} />
          {showArrows && (
            <SlideArrows activeSlide={activeSlide} slideCount={slideCount} goToSlide={goToSlide} />
          )}
          {showDots && (
            <SlideDots slideOrder={slideOrder} activeSlide={activeSlide} goToSlide={goToSlide} />
          )}
        </div>

        <ButtonBlockAppender className="slider-appender has-icon" rootClientId={clientId} />
      </>
    );
  }
);

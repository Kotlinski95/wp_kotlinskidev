import React from "react";
import { __ } from "@wordpress/i18n";
import { onActivationKey } from "@utils/keyboardActivation";
import type { HeroCarouselAttributes } from "./hero-carousel-attributes";

interface SlideCursor {
  activeSlide: number;
  slideCount: number;
  handleNavigate: (index: number) => void;
}

const formatSlideNumber = (value: number): string => String(value).padStart(2, "0");

const NavCounter = ({ activeSlide, slideCount }: Omit<SlideCursor, "handleNavigate">) => (
  <span className="carousel-nav__counter">
    <span className="carousel-nav__current">{formatSlideNumber(activeSlide + 1)}</span>
    {" / "}
    {formatSlideNumber(slideCount)}
  </span>
);

export const EditorNav = ({
  arrowsPosition,
  effectivePlacement,
  activeSlide,
  slideCount,
  handleNavigate,
}: SlideCursor & {
  arrowsPosition: NonNullable<HeroCarouselAttributes["arrowsPosition"]>;
  effectivePlacement: "inside" | "outside";
}) => {
  const goToPrevious = () => activeSlide > 0 && handleNavigate(activeSlide - 1);
  const goToNext = () => activeSlide < slideCount - 1 && handleNavigate(activeSlide + 1);
  return (
    <div
      className={`carousel-nav carousel-nav--${arrowsPosition}${effectivePlacement === "outside" ? " carousel-nav--outside" : ""}`}
    >
      <div
        className={`swiper-button-prev${activeSlide === 0 ? " swiper-button-disabled" : ""}`}
        onClick={goToPrevious}
        onKeyDown={onActivationKey(goToPrevious)}
        role="button"
        tabIndex={0}
        aria-label={__("Previous slide", "kotlinskidev")}
      />
      {arrowsPosition !== "sides" && (
        <NavCounter activeSlide={activeSlide} slideCount={slideCount} />
      )}
      <div
        className={`swiper-button-next${activeSlide === slideCount - 1 ? " swiper-button-disabled" : ""}`}
        onClick={goToNext}
        onKeyDown={onActivationKey(goToNext)}
        role="button"
        tabIndex={0}
        aria-label={__("Next slide", "kotlinskidev")}
      />
    </div>
  );
};

export const EditorPagination = ({ slideCount, activeSlide, handleNavigate }: SlideCursor) => (
  <div className="swiper-pagination">
    {Array.from({ length: slideCount }, (_, i) => (
      <span
        key={i}
        className={`swiper-pagination-bullet${i === activeSlide ? " swiper-pagination-bullet-active" : ""}`}
        onClick={() => handleNavigate(i)}
        onKeyDown={onActivationKey(() => handleNavigate(i))}
        role="button"
        tabIndex={0}
        aria-label={`${__("Go to slide", "kotlinskidev")} ${i + 1}`}
      />
    ))}
  </div>
);

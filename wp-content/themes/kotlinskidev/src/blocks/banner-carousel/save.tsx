import React from "react";
import { useBlockProps } from "@wordpress/block-editor";
import type { CarouselSettings } from "@utils/carousel/types";
import "./style.scss";

interface BannerCarouselAttributes extends Partial<CarouselSettings> {
  images: { url: string; alt?: string }[];
}

interface CustomNavProps {
  arrowsPosition: CarouselSettings["arrowsPosition"];
  navPlacement: CarouselSettings["navPlacement"];
  navColor: string;
}

const buildNavColorStyle = (navColor: string): React.CSSProperties | undefined =>
  navColor
    ? ({
        "--carousel-nav-color": navColor,
        "--carousel-nav-border-color": navColor,
      } as React.CSSProperties)
    : undefined;

const CustomNav = ({ arrowsPosition, navPlacement, navColor }: CustomNavProps) => (
  <div
    className={`carousel-nav${navPlacement === "outside" ? ` carousel-nav--outside carousel-nav--${arrowsPosition}` : ` carousel-nav--${arrowsPosition}`}`}
    style={buildNavColorStyle(navColor)}
  >
    <div className="swiper-button-prev"></div>
    <span className="carousel-nav__counter"></span>
    <div className="swiper-button-next"></div>
  </div>
);

const BannerSlides = ({
  images,
  lazyLoad,
}: {
  images: BannerCarouselAttributes["images"];
  lazyLoad: boolean | undefined;
}) => (
  <div className="swiper-wrapper">
    {images.map((img, i) => (
      <div className="swiper-slide" key={i}>
        <img
          src={img.url}
          alt={img.alt || ""}
          loading={i === 0 && !lazyLoad ? "eager" : "lazy"}
          decoding="async"
          style={{ width: "100%" }}
        />
      </div>
    ))}
  </div>
);

export default function save({ attributes }: { attributes: BannerCarouselAttributes }) {
  const { images = [], ...carouselSettings } = attributes;
  const {
    showArrows = true,
    arrowsPosition = "sides",
    navPlacement = "inside",
    navColor = "",
  } = carouselSettings;
  const settingsData = JSON.stringify(carouselSettings);

  const showCustomNav = showArrows && (arrowsPosition !== "sides" || navPlacement === "outside");
  const customNav = showCustomNav ? (
    <CustomNav arrowsPosition={arrowsPosition} navPlacement={navPlacement} navColor={navColor} />
  ) : null;

  return (
    <div {...useBlockProps.save({ className: "banner-carousel" })}>
      <div className="swiper" data-carousel-settings={settingsData}>
        <BannerSlides images={images} lazyLoad={carouselSettings.lazyLoad} />
        {showCustomNav && navPlacement === "inside" ? customNav : null}
        {showArrows && !showCustomNav ? (
          <>
            <div className="swiper-button-prev"></div>
            <div className="swiper-button-next"></div>
          </>
        ) : null}
        <div className="swiper-pagination"></div>
        <div className="swiper-scrollbar"></div>
      </div>
      {showCustomNav && navPlacement === "outside" ? customNav : null}
    </div>
  );
}

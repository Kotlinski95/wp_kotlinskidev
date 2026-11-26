import type { GalleryLightboxSettings, GalleryMedia } from "./gallery-data";

export const MODAL_ID = "gallery-lightbox-modal";

const escapeAttribute = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const buildSlidesHtml = (
  images: GalleryMedia[],
  startIndex: number,
  settings: GalleryLightboxSettings
): string => {
  const {
    videoControls = true,
    videoAutoplay = false,
    videoLoop = false,
    videoMuted = false,
  } = settings;

  return images
    .map(({ src, alt, type, poster }, i) => {
      const safeSrc = escapeAttribute(src);
      const safeAlt = escapeAttribute(alt);
      const safePoster = escapeAttribute(poster);

      return type === "video"
        ? `<div class="swiper-slide swiper-slide--video">
              <video
                src="${safeSrc}"
                ${poster ? `poster="${safePoster}"` : ""}
                ${videoControls ? "controls" : ""}
                ${videoLoop ? "loop" : ""}
                ${videoMuted || videoAutoplay ? "muted" : ""}
                playsinline
                preload="metadata"
              ></video>
            </div>`
        : `<div class="swiper-slide">
              <img
                src="${safeSrc}"
                alt="${safeAlt}"
                loading="${i === startIndex ? "eager" : "lazy"}"
                decoding="async"
              />
            </div>`;
    })
    .join("");
};

interface ModalNavigation {
  insideNav: string;
  outsideNav: string;
}

const buildNavigation = (settings: GalleryLightboxSettings): ModalNavigation => {
  const {
    showArrows = true,
    arrowsPosition = "sides",
    navColor = "",
    navPlacement = "inside",
  } = settings;
  const isOutside = navPlacement === "outside";
  const hasCustomNav = showArrows && (arrowsPosition !== "sides" || isOutside);
  const navClass = isOutside
    ? `carousel-nav carousel-nav--outside carousel-nav--${arrowsPosition}`
    : `carousel-nav carousel-nav--${arrowsPosition}`;
  const navStyle = navColor
    ? ` style="--carousel-nav-color: ${navColor}; --carousel-nav-border-color: ${navColor}"`
    : "";

  let arrowsHTML = "";
  if (showArrows && hasCustomNav) {
    arrowsHTML = `<div class="${navClass}"${navStyle}>
          <div class="swiper-button-prev"></div>
          <span class="carousel-nav__counter"></span>
          <div class="swiper-button-next"></div>
        </div>`;
  } else if (showArrows) {
    arrowsHTML = '<div class="swiper-button-prev"></div><div class="swiper-button-next"></div>';
  }

  return {
    insideNav: (hasCustomNav && !isOutside) || (showArrows && !hasCustomNav) ? arrowsHTML : "",
    outsideNav: hasCustomNav && isOutside ? arrowsHTML : "",
  };
};

export const buildModalHTML = (
  images: GalleryMedia[],
  startIndex: number,
  settings: GalleryLightboxSettings
): string => {
  const { showPagination = true } = settings;
  const { insideNav, outsideNav } = buildNavigation(settings);

  return `
    <div id="${MODAL_ID}" class="gallery-lightbox-modal" role="dialog" aria-modal="true" aria-label="Image gallery" tabindex="-1">
      <button class="gallery-lightbox-close" aria-label="Close gallery">&times;</button>
      <div class="gallery-lightbox-swiper swiper">
        <div class="swiper-wrapper">${buildSlidesHtml(images, startIndex, settings)}</div>
        ${insideNav}
        ${showPagination ? '<div class="swiper-pagination"></div>' : ""}
      </div>
      ${outsideNav}
    </div>`;
};

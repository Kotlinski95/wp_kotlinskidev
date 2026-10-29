import React from "react";
import { useBlockProps } from "@wordpress/block-editor";
import type { CarouselSettings } from "@utils/carousel/types";

interface GalleryMedia {
  id: number;
  url: string;
  alt: string;
  caption: string;
  type?: "image" | "video";
  poster?: string;
  width?: number;
  height?: number;
}

interface GalleryLightboxAttributes extends Partial<CarouselSettings> {
  images: GalleryMedia[];
  useMobileMedia?: boolean;
  mobileImages?: GalleryMedia[];
}

export default function Save({ attributes }: { attributes: GalleryLightboxAttributes }) {
  const {
    images = [],
    useMobileMedia = false,
    mobileImages = [],
    ...carouselSettings
  } = attributes;

  if (!images.length) {
    return null;
  }

  const [first, ...rest] = images;
  const totalCount = images.length;

  const imagesData = JSON.stringify(
    images.map(({ url, alt, type, poster, width, height }) => ({
      src: url,
      alt,
      type: type ?? "image",
      poster: poster ?? "",
      width: width ?? 0,
      height: height ?? 0,
    }))
  );
  const mobileImagesData =
    useMobileMedia && mobileImages.length
      ? JSON.stringify(
          mobileImages.map(({ url, alt, type, poster, width, height }) => ({
            src: url,
            alt,
            type: type ?? "image",
            poster: poster ?? "",
            width: width ?? 0,
            height: height ?? 0,
          }))
        )
      : null;
  const settingsData = JSON.stringify(carouselSettings);

  let triggerCountSuffix = "";
  if (totalCount > 1) {
    triggerCountSuffix = carouselSettings.trackActiveSlide
      ? ` 01 / ${String(totalCount).padStart(2, "0")}`
      : ` +${rest.length}`;
  }

  return (
    <div
      {...useBlockProps.save()}
      data-gallery-lightbox=""
      data-images={imagesData}
      {...(mobileImagesData ? { "data-mobile-images": mobileImagesData } : {})}
      data-settings={settingsData}
    >
      <button
        className="gallery-lightbox-trigger"
        type="button"
        aria-label={`${first.alt || "Open gallery"}${triggerCountSuffix}`}
        style={
          first.width && first.height
            ? { aspectRatio: `${first.width}/${first.height}` }
            : undefined
        }
      >
        <img
          src={first.type === "video" ? (first.poster ?? first.url) : first.url}
          alt={first.alt}
          width={first.width || undefined}
          height={first.height || undefined}
          loading={carouselSettings.lazyLoad ? "lazy" : "eager"}
          decoding="async"
        />
        {first.type === "video" && (
          <span className="gallery-lightbox-video-badge" aria-hidden="true">
            &#9654;
          </span>
        )}
        {totalCount > 1 && (
          <span className="gallery-lightbox-count" aria-hidden="true">
            {carouselSettings.trackActiveSlide ? (
              <>
                <span className="gallery-lightbox-count__current">01</span>
                {` / ${String(totalCount).padStart(2, "0")}`}
              </>
            ) : (
              `+${rest.length}`
            )}
          </span>
        )}
      </button>
    </div>
  );
}

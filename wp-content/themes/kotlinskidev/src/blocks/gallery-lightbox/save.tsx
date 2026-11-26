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

const toDataMedia = (items: GalleryMedia[]): string =>
  JSON.stringify(
    items.map(({ url, alt, type, poster, width, height }) => ({
      src: url,
      alt,
      type: type ?? "image",
      poster: poster ?? "",
      width: width ?? 0,
      height: height ?? 0,
    }))
  );

const formatTotalCount = (totalCount: number): string => String(totalCount).padStart(2, "0");

const buildTriggerCountSuffix = (
  totalCount: number,
  trackActiveSlide: boolean | undefined
): string => {
  if (totalCount <= 1) {
    return "";
  }
  return trackActiveSlide ? ` 01 / ${formatTotalCount(totalCount)}` : ` +${totalCount - 1}`;
};

const TriggerCount = ({
  totalCount,
  trackActiveSlide,
}: {
  totalCount: number;
  trackActiveSlide: boolean | undefined;
}) => (
  <span className="gallery-lightbox-count" aria-hidden="true">
    {trackActiveSlide ? (
      <>
        <span className="gallery-lightbox-count__current">01</span>
        {` / ${formatTotalCount(totalCount)}`}
      </>
    ) : (
      `+${totalCount - 1}`
    )}
  </span>
);

const FirstMediaTrigger = ({
  first,
  totalCount,
  carouselSettings,
}: {
  first: GalleryMedia;
  totalCount: number;
  carouselSettings: Partial<CarouselSettings>;
}) => (
  <button
    className="gallery-lightbox-trigger"
    type="button"
    aria-label={`${first.alt || "Open gallery"}${buildTriggerCountSuffix(totalCount, carouselSettings.trackActiveSlide)}`}
    style={
      first.width && first.height ? { aspectRatio: `${first.width}/${first.height}` } : undefined
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
      <TriggerCount totalCount={totalCount} trackActiveSlide={carouselSettings.trackActiveSlide} />
    )}
  </button>
);

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

  const mobileImagesData = useMobileMedia && mobileImages.length ? toDataMedia(mobileImages) : null;

  return (
    <div
      {...useBlockProps.save()}
      data-gallery-lightbox=""
      data-images={toDataMedia(images)}
      {...(mobileImagesData ? { "data-mobile-images": mobileImagesData } : {})}
      data-settings={JSON.stringify(carouselSettings)}
    >
      <FirstMediaTrigger
        first={images[0]}
        totalCount={images.length}
        carouselSettings={carouselSettings}
      />
    </div>
  );
}

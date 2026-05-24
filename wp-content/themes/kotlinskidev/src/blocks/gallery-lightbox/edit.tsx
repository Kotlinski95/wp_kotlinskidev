import React from "react";
import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
} from "@wordpress/block-editor";
import { Button, PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import CarouselPanel from "@utils/carousel/CarouselPanel";
import type { CarouselSettings } from "@utils/carousel/types";
import "./style.scss";

interface GalleryMedia {
  id: number;
  url: string;
  thumbnailUrl: string;
  alt: string;
  caption: string;
  type: "image" | "video";
  poster: string;
  width: number;
  height: number;
}

export interface GalleryLightboxAttributes extends Partial<CarouselSettings> {
  images: GalleryMedia[];
  videoControls: boolean;
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  useMobileMedia: boolean;
  mobileImages: GalleryMedia[];
}

interface WPMediaItem {
  id: number;
  url: string;
  mime?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  image?: { src: string };
  sizes?: {
    medium?: { url: string };
    large?: { url: string };
  };
}

const toGalleryMedia = (item: WPMediaItem): GalleryMedia => {
  const isVideo = item.mime?.startsWith("video/") ?? false;
  const poster = isVideo ? (item.image?.src ?? "") : "";
  return {
    id: item.id,
    url: item.url,
    thumbnailUrl: isVideo
      ? poster
      : (item.url ?? item.sizes?.large?.url ?? item.sizes?.medium?.url ?? ""),
    alt: item.alt ?? "",
    caption: item.caption ?? "",
    type: isVideo ? "video" : "image",
    poster,
    width: item.width ?? 0,
    height: item.height ?? 0,
  };
};

export default function Edit({
  attributes,
  setAttributes,
}: {
  attributes: GalleryLightboxAttributes;
  setAttributes: (attrs: Partial<GalleryLightboxAttributes>) => void;
}) {
  const { images = [], ...carouselSettings } = attributes;
  const {
    videoControls = true,
    videoAutoplay = false,
    videoLoop = false,
    videoMuted = false,
  } = attributes;
  const { useMobileMedia = false, mobileImages = [] } = attributes;
  const hasVideos = images.some((item) => item.type === "video");

  const onAdd = (selected: WPMediaItem | WPMediaItem[]) => {
    const items = Array.isArray(selected) ? selected : [selected];
    const newIds = new Set(items.map((i) => i.id));
    const existing = images.filter((img) => !newIds.has(img.id));
    setAttributes({ images: [...existing, ...items.map(toGalleryMedia)] });
  };

  const onAddMobile = (selected: WPMediaItem | WPMediaItem[]) => {
    const items = Array.isArray(selected) ? selected : [selected];
    const newIds = new Set(items.map((i) => i.id));
    const existing = mobileImages.filter((img) => !newIds.has(img.id));
    setAttributes({ mobileImages: [...existing, ...items.map(toGalleryMedia)] });
  };

  const removeItem = (id: number) =>
    setAttributes({ images: images.filter((img) => img.id !== id) });

  const removeMobileItem = (id: number) =>
    setAttributes({ mobileImages: mobileImages.filter((img) => img.id !== id) });

  const first = images[0] ?? null;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Media", "kotlinskidev")} initialOpen>
          <MediaUploadCheck>
            {images.length > 0 && (
              <div className="gallery-lightbox-sidebar-grid">
                {images.map((item) => (
                  <div key={item.id} className="gallery-lightbox-sidebar-item">
                    <img
                      src={
                        item.type === "video" ? item.poster || item.thumbnailUrl : item.thumbnailUrl
                      }
                      alt={item.alt}
                    />
                    {item.type === "video" && (
                      <span className="gallery-lightbox-sidebar-badge" aria-hidden="true">
                        &#9654;
                      </span>
                    )}
                    <button
                      className="gallery-lightbox-sidebar-remove"
                      onClick={() => removeItem(item.id)}
                      aria-label={__("Remove", "kotlinskidev")}
                      type="button"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <MediaUpload
              onSelect={onAdd as any}
              allowedTypes={["image", "video"]}
              multiple
              value={[]}
              render={({ open }) => (
                <Button
                  variant={images.length === 0 ? "primary" : "secondary"}
                  onClick={open}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginTop: images.length ? "0.5rem" : 0,
                  }}
                >
                  {images.length === 0
                    ? __("Add Images & Videos", "kotlinskidev")
                    : __("Add More Media", "kotlinskidev")}
                </Button>
              )}
            />

            <div className="gallery-lightbox-sidebar-divider">
              <ToggleControl
                label={__("Use different media on mobile", "kotlinskidev")}
                help={__("Show alternative images/videos on screens ≤768px.", "kotlinskidev")}
                checked={useMobileMedia}
                onChange={(value) => setAttributes({ useMobileMedia: value })}
              />
            </div>

            {useMobileMedia && (
              <>
                <p className="gallery-lightbox-sidebar-label">
                  {__("Mobile media (≤768px)", "kotlinskidev")}
                </p>
                {mobileImages.length > 0 && (
                  <div className="gallery-lightbox-sidebar-grid">
                    {mobileImages.map((item) => (
                      <div key={item.id} className="gallery-lightbox-sidebar-item">
                        <img
                          src={
                            item.type === "video"
                              ? item.poster || item.thumbnailUrl
                              : item.thumbnailUrl
                          }
                          alt={item.alt}
                        />
                        {item.type === "video" && (
                          <span className="gallery-lightbox-sidebar-badge" aria-hidden="true">
                            &#9654;
                          </span>
                        )}
                        <button
                          className="gallery-lightbox-sidebar-remove"
                          onClick={() => removeMobileItem(item.id)}
                          aria-label={__("Remove", "kotlinskidev")}
                          type="button"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <MediaUpload
                  onSelect={onAddMobile as any}
                  allowedTypes={["image", "video"]}
                  multiple
                  value={[]}
                  render={({ open }) => (
                    <Button
                      variant={mobileImages.length === 0 ? "primary" : "secondary"}
                      onClick={open}
                      style={{
                        width: "100%",
                        justifyContent: "center",
                        marginTop: mobileImages.length ? "0.5rem" : 0,
                      }}
                    >
                      {mobileImages.length === 0
                        ? __("Add Mobile Media", "kotlinskidev")
                        : __("Add More Mobile Media", "kotlinskidev")}
                    </Button>
                  )}
                />
              </>
            )}
          </MediaUploadCheck>
        </PanelBody>
        <CarouselPanel
          settings={carouselSettings}
          onChange={(partial) => setAttributes(partial)}
          title={__("Lightbox Settings", "kotlinskidev")}
          features={{
            arrowsPosition: true,
            navColor: true,
            navPlacement: true,
            trackActiveSlide: true,
          }}
        />
        {hasVideos && (
          <PanelBody title={__("Video Options", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Show controls", "kotlinskidev")}
              checked={videoControls}
              onChange={(value) => setAttributes({ videoControls: value })}
            />
            <ToggleControl
              label={__("Autoplay when slide opens", "kotlinskidev")}
              checked={videoAutoplay}
              onChange={(value) =>
                setAttributes({ videoAutoplay: value, videoMuted: value ? true : videoMuted })
              }
            />
            <ToggleControl
              label={__("Muted", "kotlinskidev")}
              help={__("Required for autoplay in most browsers.", "kotlinskidev")}
              checked={videoMuted || videoAutoplay}
              onChange={(value) => setAttributes({ videoMuted: value })}
            />
            <ToggleControl
              label={__("Loop", "kotlinskidev")}
              checked={videoLoop}
              onChange={(value) => setAttributes({ videoLoop: value })}
            />
          </PanelBody>
        )}
      </InspectorControls>

      <div {...useBlockProps()}>
        <MediaUploadCheck>
          {!first ? (
            <MediaUpload
              onSelect={onAdd as any}
              allowedTypes={["image", "video"]}
              multiple
              value={[]}
              render={({ open }) => (
                <div className="gallery-lightbox-editor gallery-lightbox-editor--empty">
                  <span className="dashicons dashicons-format-gallery" />
                  <Button variant="primary" onClick={open}>
                    {__("Add Images & Videos", "kotlinskidev")}
                  </Button>
                </div>
              )}
            />
          ) : (
            <div className="gallery-lightbox-editor">
              <div className="gallery-lightbox-trigger" style={{ pointerEvents: "none" }}>
                <img
                  src={first.type === "video" ? first.poster || first.url : first.url}
                  alt={first.alt}
                />
                {first.type === "video" && (
                  <span className="gallery-lightbox-video-badge" aria-hidden="true">
                    &#9654;
                  </span>
                )}
                {images.length > 1 && (
                  <span className="gallery-lightbox-count">+{images.length - 1}</span>
                )}
              </div>
            </div>
          )}
        </MediaUploadCheck>
      </div>
    </>
  );
}

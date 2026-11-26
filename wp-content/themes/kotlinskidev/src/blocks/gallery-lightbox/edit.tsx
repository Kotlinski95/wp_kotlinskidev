import React from "react";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import CarouselPanel from "@utils/carousel/CarouselPanel";
import { EditorPreview } from "./editor-preview";
import { mergeSelectedMedia, type GalleryEditProps } from "./gallery-media";
import { MediaPanel } from "./media-panel";
import { VideoOptionsPanel } from "./video-options-panel";
import "./style.scss";

export type { GalleryLightboxAttributes } from "./gallery-media";

const LIGHTBOX_CAROUSEL_FEATURES = {
  arrowsPosition: true,
  navColor: true,
  navPlacement: true,
  trackActiveSlide: true,
};

export default function Edit({ attributes, setAttributes }: GalleryEditProps) {
  const { images = [], ...carouselSettings } = attributes;
  const hasVideos = images.some((item) => item.type === "video");

  return (
    <>
      <InspectorControls>
        <MediaPanel attributes={attributes} setAttributes={setAttributes} />
        <CarouselPanel
          settings={carouselSettings}
          onChange={(partial) => setAttributes(partial)}
          title={__("Lightbox Settings", "kotlinskidev")}
          features={LIGHTBOX_CAROUSEL_FEATURES}
        />
        {hasVideos && <VideoOptionsPanel attributes={attributes} setAttributes={setAttributes} />}
      </InspectorControls>

      <div {...useBlockProps()}>
        <EditorPreview
          images={images}
          onSelect={(selected) => setAttributes({ images: mergeSelectedMedia(images, selected) })}
        />
      </div>
    </>
  );
}

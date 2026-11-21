import React from "react";
import { InspectorControls, MediaUploadCheck } from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { MediaPickerButton, RemoveMediaButton } from "./media-controls";
import type { HeroSlideEditProps } from "./slide-attributes";

export const DEFAULT_OVERLAY_OPACITY = 0.4;
const SECTION_LABEL_SPACING = { marginTop: "0.75rem" };

const BackgroundImageControls = ({ attributes, setAttributes }: HeroSlideEditProps) => (
  <>
    <p className="hero-carousel-sidebar-label">{__("Background Image", "kotlinskidev")}</p>
    <MediaPickerButton
      allowedType="image"
      mediaId={attributes.bgImageId}
      hasMedia={Boolean(attributes.bgImageUrl)}
      unsetVariant="primary"
      setLabel={__("Set Image", "kotlinskidev")}
      changeLabel={__("Change Image", "kotlinskidev")}
      onSelect={(media) => setAttributes({ bgImageUrl: media.url, bgImageId: media.id })}
    />
    {attributes.bgImageUrl && (
      <RemoveMediaButton
        label={__("Remove Image", "kotlinskidev")}
        onRemove={() => setAttributes({ bgImageUrl: "", bgImageId: 0 })}
      />
    )}
  </>
);

const AlphaVideoControls = ({ attributes, setAttributes }: HeroSlideEditProps) => (
  <>
    <p className="hero-carousel-sidebar-label" style={SECTION_LABEL_SPACING}>
      {__("Video for Safari/iOS (HEVC with alpha)", "kotlinskidev")}
    </p>
    <MediaPickerButton
      allowedType="video"
      mediaId={attributes.bgVideoAlphaId}
      hasMedia={Boolean(attributes.bgVideoAlphaUrl)}
      unsetVariant="tertiary"
      setLabel={__("Set Safari/iOS Video", "kotlinskidev")}
      changeLabel={__("Change Safari/iOS Video", "kotlinskidev")}
      onSelect={(media) => setAttributes({ bgVideoAlphaUrl: media.url, bgVideoAlphaId: media.id })}
    />
    <p className="components-base-control__help">
      {__(
        "Optional. Safari and iOS ignore the transparency of WebM videos. Upload an HEVC .mov/.mp4 with an alpha channel to use there instead.",
        "kotlinskidev"
      )}
    </p>
    {attributes.bgVideoAlphaUrl && (
      <RemoveMediaButton
        label={__("Remove Safari/iOS Video", "kotlinskidev")}
        onRemove={() => setAttributes({ bgVideoAlphaUrl: "", bgVideoAlphaId: 0 })}
      />
    )}
  </>
);

const BackgroundVideoControls = ({ attributes, setAttributes }: HeroSlideEditProps) => (
  <>
    <p className="hero-carousel-sidebar-label" style={SECTION_LABEL_SPACING}>
      {__("Background Video (optional)", "kotlinskidev")}
    </p>
    <MediaPickerButton
      allowedType="video"
      mediaId={attributes.bgVideoId}
      hasMedia={Boolean(attributes.bgVideoUrl)}
      unsetVariant="tertiary"
      setLabel={__("Set Video", "kotlinskidev")}
      changeLabel={__("Change Video", "kotlinskidev")}
      onSelect={(media) => setAttributes({ bgVideoUrl: media.url, bgVideoId: media.id })}
    />
    {attributes.bgVideoUrl && (
      <RemoveMediaButton
        label={__("Remove Video", "kotlinskidev")}
        onRemove={() => setAttributes({ bgVideoUrl: "", bgVideoId: 0 })}
      />
    )}
    {attributes.bgVideoUrl && (
      <AlphaVideoControls attributes={attributes} setAttributes={setAttributes} />
    )}
  </>
);

export const BackgroundPanel = ({ attributes, setAttributes }: HeroSlideEditProps) => (
  <InspectorControls>
    <PanelBody title={__("Background", "kotlinskidev")} initialOpen>
      <MediaUploadCheck>
        <BackgroundImageControls attributes={attributes} setAttributes={setAttributes} />
        <BackgroundVideoControls attributes={attributes} setAttributes={setAttributes} />
      </MediaUploadCheck>

      <RangeControl
        label={__("Overlay Opacity", "kotlinskidev")}
        value={attributes.bgOverlay ?? DEFAULT_OVERLAY_OPACITY}
        onChange={(value) => setAttributes({ bgOverlay: value ?? DEFAULT_OVERLAY_OPACITY })}
        min={0}
        max={1}
        step={0.05}
        style={SECTION_LABEL_SPACING}
      />
    </PanelBody>
  </InspectorControls>
);

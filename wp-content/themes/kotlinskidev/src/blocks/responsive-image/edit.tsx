import React from "react";
import { __ } from "@wordpress/i18n";
import { useBlockProps, MediaUpload, MediaUploadCheck, InspectorControls } from "@wordpress/block-editor";
import { Button, PanelBody, TextControl, RangeControl, SelectControl } from "@wordpress/components";

type LoadingStrategy = "lazy" | "eager" | "auto";

interface ResponsiveImageAttributes {
  desktopImageUrl?: string;
  desktopImageId?: number;
  mobileImageUrl?: string;
  mobileImageId?: number;
  alt?: string;
  breakpoint?: number;
  loading?: LoadingStrategy;
}

interface MediaObject {
  url: string;
  id: number;
}

interface EditProps {
  attributes: ResponsiveImageAttributes;
  setAttributes: (attrs: Partial<ResponsiveImageAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps): React.ReactElement {
  const {
    desktopImageUrl = "",
    desktopImageId,
    mobileImageUrl = "",
    mobileImageId,
    alt = "",
    breakpoint = 767,
    loading = "lazy",
  } = attributes;

  return (
    <div {...useBlockProps()}>
      <InspectorControls>
        <PanelBody title={__("Image Settings", "kotlinskidev")}>
          <TextControl
            label={__("Alt Text", "kotlinskidev")}
            value={alt}
            onChange={(value) => setAttributes({ alt: value })}
          />
          <RangeControl
            label={__("Mobile Breakpoint (px)", "kotlinskidev")}
            value={breakpoint}
            onChange={(value) => setAttributes({ breakpoint: value })}
            min={320}
            max={1920}
            help={__("Switch to mobile image at this screen width or below.", "kotlinskidev")}
          />
          <SelectControl
            label={__("Image Loading", "kotlinskidev")}
            value={loading}
            options={[
              { label: __("Lazy", "kotlinskidev"), value: "lazy" },
              { label: __("Eager", "kotlinskidev"), value: "eager" },
              { label: __("Auto", "kotlinskidev"), value: "auto" },
            ]}
            onChange={(value) => setAttributes({ loading: value as LoadingStrategy })}
            help={__("Choose how the image should be loaded by the browser.", "kotlinskidev")}
          />
        </PanelBody>
      </InspectorControls>
      <div style={{ marginBottom: 16 }}>
        <strong>{__("Desktop Image", "kotlinskidev")}</strong>
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media: MediaObject) => setAttributes({ desktopImageUrl: media.url, desktopImageId: media.id })}
            allowedTypes={["image"]}
            value={desktopImageId}
            render={({ open }: { open: () => void }) => (
              <Button onClick={open} isSecondary>
                {desktopImageUrl ? __("Replace Image", "kotlinskidev") : __("Select Image", "kotlinskidev")}
              </Button>
            )}
          />
        </MediaUploadCheck>
        {desktopImageUrl && <img src={desktopImageUrl} alt={alt} style={{ maxWidth: "100%", marginTop: 8 }} />}
      </div>
      <div>
        <strong>{__("Mobile Image (optional)", "kotlinskidev")}</strong>
        <MediaUploadCheck>
          <MediaUpload
            onSelect={(media: MediaObject) => setAttributes({ mobileImageUrl: media.url, mobileImageId: media.id })}
            allowedTypes={["image"]}
            value={mobileImageId}
            render={({ open }: { open: () => void }) => (
              <Button onClick={open} isSecondary>
                {mobileImageUrl ? __("Replace Image", "kotlinskidev") : __("Select Image", "kotlinskidev")}
              </Button>
            )}
          />
        </MediaUploadCheck>
        {mobileImageUrl && <img src={mobileImageUrl} alt={alt} style={{ maxWidth: "100%", marginTop: 8 }} />}
      </div>
    </div>
  );
}

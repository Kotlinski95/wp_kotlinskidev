import React from "react";
import { __ } from "@wordpress/i18n";
import {
  useBlockProps,
  MediaUpload,
  MediaUploadCheck,
  InspectorControls,
} from "@wordpress/block-editor";
import { Button, PanelBody, TextControl, RangeControl, SelectControl } from "@wordpress/components";

type LoadingStrategy = "lazy" | "eager" | "auto";

export interface ResponsiveImageAttributes {
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

function ImageSettingsPanel({ attributes, setAttributes }: EditProps) {
  const { alt = "", breakpoint = 767, loading = "lazy" } = attributes;

  return (
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
  );
}

interface ImagePickerProps {
  heading: string;
  imageUrl: string;
  imageId: number | undefined;
  alt: string;
  onSelect: (media: MediaObject) => void;
  style?: React.CSSProperties;
}

function ImagePicker({ heading, imageUrl, imageId, alt, onSelect, style }: ImagePickerProps) {
  return (
    <div style={style}>
      <strong>{heading}</strong>
      <MediaUploadCheck>
        <MediaUpload
          onSelect={onSelect}
          allowedTypes={["image"]}
          value={imageId}
          render={({ open }: { open: () => void }) => (
            <Button onClick={open} isSecondary>
              {imageUrl ? __("Replace Image", "kotlinskidev") : __("Select Image", "kotlinskidev")}
            </Button>
          )}
        />
      </MediaUploadCheck>
      {imageUrl && <img src={imageUrl} alt={alt} style={{ maxWidth: "100%", marginTop: 8 }} />}
    </div>
  );
}

export default function Edit({ attributes, setAttributes }: EditProps): React.ReactElement {
  const {
    desktopImageUrl = "",
    desktopImageId,
    mobileImageUrl = "",
    mobileImageId,
    alt = "",
  } = attributes;
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <ImageSettingsPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <ImagePicker
        heading={__("Desktop Image", "kotlinskidev")}
        imageUrl={desktopImageUrl}
        imageId={desktopImageId}
        alt={alt}
        onSelect={(media) =>
          setAttributes({ desktopImageUrl: media.url, desktopImageId: media.id })
        }
        style={{ marginBottom: 16 }}
      />
      <ImagePicker
        heading={__("Mobile Image (optional)", "kotlinskidev")}
        imageUrl={mobileImageUrl}
        imageId={mobileImageId}
        alt={alt}
        onSelect={(media) => setAttributes({ mobileImageUrl: media.url, mobileImageId: media.id })}
      />
    </div>
  );
}

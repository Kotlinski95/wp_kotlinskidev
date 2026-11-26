import React from "react";
import type { ComponentType, CSSProperties } from "react";
import * as blockEditor from "@wordpress/block-editor";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { Button, PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { MediaObject } from "./types";

interface LinkControlLink {
  url?: string;
  title?: string;
  opensInNewTab?: boolean;
}

interface LinkControlProps {
  value: LinkControlLink;
  onChange: (value: LinkControlLink) => void;
  onRemove?: () => void;
  settings?: { id: string; title: string }[];
  forceIsEditingLink?: boolean;
}

interface ColorGradientControlProps {
  label?: string;
  colorValue?: string;
  gradientValue?: string;
  onColorChange: (value?: string) => void;
  onGradientChange: (value?: string) => void;
  clearable?: boolean;
  __nextHasNoMarginBottom?: boolean;
}

export const {
  __experimentalLinkControl: LinkControl,
  __experimentalColorGradientControl: ColorGradientControl,
} = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
  __experimentalColorGradientControl: ComponentType<ColorGradientControlProps>;
};

export const previewStyle: CSSProperties = {
  minHeight: "3em",
  padding: "0.75em 1em",
  border: "1px dashed #b5bfc9",
  borderRadius: "2px",
  boxSizing: "border-box",
};

export const placeholderStyle: CSSProperties = {
  color: "#b5bfc9",
  fontStyle: "italic",
  margin: 0,
};

export const buildGradientTextStyle = (textGradient: string, textColor: string): CSSProperties => {
  if (textGradient) {
    return {
      backgroundImage: textGradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  }
  return textColor ? { color: textColor } : {};
};

interface ImagePickerProps {
  mediaId: number;
  mediaUrl: string;
  onSelectMedia: (media: MediaObject) => void;
}

export const ImagePicker = ({
  mediaId,
  mediaUrl,
  onSelectMedia,
}: ImagePickerProps): JSX.Element => (
  <MediaUploadCheck>
    <MediaUpload
      onSelect={onSelectMedia}
      allowedTypes={["image"]}
      value={mediaId}
      render={({ open }) => (
        <Button
          variant={mediaUrl ? "secondary" : "primary"}
          onClick={open}
          style={{ width: "100%", marginBottom: "0.75rem", justifyContent: "center" }}
        >
          {mediaUrl ? __("Replace image", "kotlinskidev") : __("Select image", "kotlinskidev")}
        </Button>
      )}
    />
  </MediaUploadCheck>
);

interface TextColorPanelProps {
  controlLabel: string;
  textColor: string;
  textGradient: string;
  setAttributes: (attrs: { textColor?: string; textGradient?: string }) => void;
}

export const TextColorPanel = ({
  controlLabel,
  textColor,
  textGradient,
  setAttributes,
}: TextColorPanelProps): JSX.Element => (
  <PanelBody title={__("Text color", "kotlinskidev")} initialOpen={false}>
    <ColorGradientControl
      label={controlLabel}
      colorValue={textColor || undefined}
      gradientValue={textGradient || undefined}
      onColorChange={(value) => setAttributes({ textColor: value ?? "" })}
      onGradientChange={(value) => setAttributes({ textGradient: value ?? "" })}
      clearable
      __nextHasNoMarginBottom
    />
  </PanelBody>
);

import React from "react";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  TextControl,
  ToggleControl,
  Button,
  FocalPointPicker,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { POSITION_STYLE_OPTIONS, type DeviceType, type PositionStyle } from "./devices";
import { formatObjectPosition, parseObjectPosition } from "./focal-point";
import type { DeviceFramePanelProps } from "./attributes";

interface WPMediaItem {
  id: number;
  url: string;
}

const MediaPicker = ({ attributes, setAttributes }: DeviceFramePanelProps): JSX.Element => {
  const { imageId, imageUrl } = attributes;

  return (
    <MediaUploadCheck>
      <MediaUpload
        onSelect={(item) => {
          const media = item as WPMediaItem;
          setAttributes({ imageId: media.id, imageUrl: media.url });
        }}
        allowedTypes={["image", "video"]}
        value={imageId || undefined}
        render={({ open }) => (
          <Button
            variant={imageUrl ? "secondary" : "primary"}
            onClick={open}
            style={{ width: "100%", justifyContent: "center", marginTop: "0.75rem" }}
          >
            {imageUrl ? __("Change Media", "kotlinskidev") : __("Set Media", "kotlinskidev")}
          </Button>
        )}
      />
      <p className="components-base-control__help">
        {__("Accepts an image (incl. GIF/SVG) or a video file.", "kotlinskidev")}
      </p>
      {imageUrl && (
        <Button
          variant="tertiary"
          isDestructive
          onClick={() => setAttributes({ imageId: 0, imageUrl: "" })}
          style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
        >
          {__("Remove Media", "kotlinskidev")}
        </Button>
      )}
    </MediaUploadCheck>
  );
};

const DeviceBasicFields = ({ attributes, setAttributes }: DeviceFramePanelProps): JSX.Element => {
  const { device, aspectRatio, alt } = attributes;

  return (
    <>
      <SelectControl
        label={__("Device", "kotlinskidev")}
        value={device}
        options={[
          { label: __("Desktop", "kotlinskidev"), value: "desktop" },
          { label: __("Tablet", "kotlinskidev"), value: "tablet" },
          { label: __("Phone", "kotlinskidev"), value: "phone" },
        ]}
        onChange={(value) => setAttributes({ device: value as DeviceType })}
      />
      <TextControl
        label={__("Aspect ratio", "kotlinskidev")}
        help={__(
          "Any CSS aspect-ratio value, e.g. 16/10. Leave empty for the device default.",
          "kotlinskidev"
        )}
        value={aspectRatio}
        onChange={(value) => setAttributes({ aspectRatio: value })}
      />
      <TextControl
        label={__("Alt text", "kotlinskidev")}
        value={alt}
        onChange={(value) => setAttributes({ alt: value })}
      />
    </>
  );
};

const FocalPointField = ({
  attributes,
  setAttributes,
}: DeviceFramePanelProps): JSX.Element | null => {
  const { imageUrl, objectPosition } = attributes;
  if (!imageUrl) {
    return null;
  }
  const focalPoint = parseObjectPosition(objectPosition);

  return (
    <FocalPointPicker
      label={__("Focal point", "kotlinskidev")}
      help={__(
        "Drag to pick which part of the image stays visible when it's cropped by the frame.",
        "kotlinskidev"
      )}
      url={imageUrl}
      value={focalPoint}
      onChange={(value) => setAttributes({ objectPosition: formatObjectPosition(value) })}
    />
  );
};

const PositionFields = ({ attributes, setAttributes }: DeviceFramePanelProps): JSX.Element => {
  const { positionStyle, keepEffectOnMobile } = attributes;
  const resolvedPositionStyle = positionStyle ?? "";

  return (
    <>
      <SelectControl
        label={__("Position style", "kotlinskidev")}
        help={__(
          "How the frame sits in its showcase section. None keeps normal in-flow sizing.",
          "kotlinskidev"
        )}
        value={resolvedPositionStyle}
        options={POSITION_STYLE_OPTIONS}
        onChange={(value) => setAttributes({ positionStyle: value as PositionStyle })}
      />
      {(resolvedPositionStyle === "angled" || resolvedPositionStyle === "overlap") && (
        <ToggleControl
          label={__("Keep effect on mobile", "kotlinskidev")}
          help={__(
            "Off (default) flattens the frame to normal in-flow stacking on narrow screens to avoid overlapping text. On keeps the angled/overlap effect at every width.",
            "kotlinskidev"
          )}
          checked={keepEffectOnMobile}
          onChange={(value) => setAttributes({ keepEffectOnMobile: value })}
        />
      )}
    </>
  );
};

export const DeviceFramePanel = (props: DeviceFramePanelProps): JSX.Element => (
  <PanelBody title={__("Device Frame", "kotlinskidev")} initialOpen>
    <DeviceBasicFields {...props} />
    <FocalPointField {...props} />
    <PositionFields {...props} />
    <MediaPicker {...props} />
  </PanelBody>
);

export const MediaBehaviorPanel = ({
  attributes,
  setAttributes,
}: DeviceFramePanelProps): JSX.Element => (
  <PanelBody title={__("Media Behavior", "kotlinskidev")} initialOpen={false}>
    <ToggleControl
      label={__("Expand on click", "kotlinskidev")}
      help={__(
        "Opens the image or video full-size in a modal when clicked, like the native Image block's Expand on click option.",
        "kotlinskidev"
      )}
      checked={attributes.enableLightbox}
      onChange={(value) => setAttributes({ enableLightbox: value })}
    />
  </PanelBody>
);

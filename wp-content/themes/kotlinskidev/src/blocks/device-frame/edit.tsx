import React from "react";
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import {
  PanelBody,
  SelectControl,
  TextControl,
  ToggleControl,
  Button,
  FocalPointPicker,
  type FocalPoint,
} from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import {
  DEVICE_ASPECT_RATIOS,
  DEVICE_PLACEHOLDERS,
  POSITION_STYLE_OPTIONS,
  type DeviceType,
  type PositionStyle,
  type LoadingStrategy,
  type FetchPriority,
} from "./devices";

export interface DeviceFrameAttributes {
  device: DeviceType;
  aspectRatio: string;
  imageId: number;
  imageUrl: string;
  alt: string;
  positionStyle: PositionStyle;
  keepEffectOnMobile: boolean;
  objectPosition: string;
  loading: LoadingStrategy;
  fetchPriority: FetchPriority;
  enableLightbox: boolean;
}

const DEFAULT_FOCAL_POINT: FocalPoint = { x: 0.5, y: 0.5 };

function parseObjectPosition(value: string): FocalPoint {
  const match = value.match(/^(-?\d{1,3})% (-?\d{1,3})%$/);
  if (!match) {
    return DEFAULT_FOCAL_POINT;
  }
  return { x: Number(match[1]) / 100, y: Number(match[2]) / 100 };
}

function formatObjectPosition(point: FocalPoint): string {
  return `${Math.round(point.x * 100)}% ${Math.round(point.y * 100)}%`;
}

interface WPMediaItem {
  id: number;
  url: string;
}

interface WPMediaRecord {
  mime_type: string;
}

interface EditProps {
  attributes: DeviceFrameAttributes;
  setAttributes: (attrs: Partial<DeviceFrameAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const {
    device,
    aspectRatio,
    imageId,
    imageUrl,
    alt,
    positionStyle,
    keepEffectOnMobile,
    objectPosition,
    loading,
    fetchPriority,
    enableLightbox,
  } = attributes;
  const resolvedAspectRatio = aspectRatio || DEVICE_ASPECT_RATIOS[device];
  const resolvedPositionStyle = positionStyle ?? "";
  const focalPoint = parseObjectPosition(objectPosition);

  const mimeType = useSelect<string>(
    (select) =>
      imageId
        ? ((
            select("core") as {
              getMedia: (id: number) => WPMediaRecord | null;
            }
          ).getMedia(imageId)?.mime_type ?? "")
        : "",
    [imageId]
  );
  const isVideo = mimeType.startsWith("video/");

  const previewStyle: React.CSSProperties = objectPosition ? { objectPosition } : {};

  let mediaPreview = null;
  if (imageUrl) {
    mediaPreview = isVideo ? (
      <video
        className="kt-device-frame__image"
        src={imageUrl}
        style={previewStyle}
        preload={loading === "eager" ? "auto" : "metadata"}
        muted
        loop
        autoPlay
        playsInline
      />
    ) : (
      <img
        className="kt-device-frame__image"
        src={imageUrl}
        alt={alt}
        style={previewStyle}
        loading={loading}
        {...{ fetchpriority: fetchPriority }}
      />
    );
  }

  const positionStyleClass = resolvedPositionStyle
    ? ` kt-device-frame--${resolvedPositionStyle}`
    : "";
  const mobilePreserveClass = keepEffectOnMobile ? " kt-device-frame--mobile-preserve" : "";
  const lightboxClass = enableLightbox ? " kt-device-frame--lightbox-enabled" : "";

  const blockProps = useBlockProps({
    className: `kt-device-frame kt-device-frame--${device}${positionStyleClass}${mobilePreserveClass}${lightboxClass}`,
  });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Device Frame", "kotlinskidev")} initialOpen>
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
          {imageUrl && (
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
          )}
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
        </PanelBody>
        <PanelBody title={__("Media Behavior", "kotlinskidev")} initialOpen={false}>
          <ToggleControl
            label={__("Expand on click", "kotlinskidev")}
            help={__(
              "Opens the image or video full-size in a modal when clicked, like the native Image block's Expand on click option.",
              "kotlinskidev"
            )}
            checked={enableLightbox}
            onChange={(value) => setAttributes({ enableLightbox: value })}
          />
        </PanelBody>
      </InspectorControls>

      <div
        {...blockProps}
        style={{ "--kt-device-frame-aspect-ratio": resolvedAspectRatio } as React.CSSProperties}
      >
        <div className="kt-device-frame__bezel">
          <div className="kt-device-frame__screen">
            {mediaPreview}
            {enableLightbox && imageUrl && (
              <span className="kt-device-frame__lightbox-indicator" aria-hidden="true" />
            )}
            {!imageUrl && (
              <span className="kt-device-frame__placeholder">{DEVICE_PLACEHOLDERS[device]}</span>
            )}
          </div>
          {device === "phone" && <div className="kt-device-frame__notch" />}
        </div>
      </div>
    </>
  );
}

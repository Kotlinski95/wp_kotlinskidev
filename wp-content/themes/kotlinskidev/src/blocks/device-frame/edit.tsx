import React from "react";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { DEVICE_ASPECT_RATIOS, DEVICE_PLACEHOLDERS } from "./devices";
import { DeviceFramePanel, MediaBehaviorPanel } from "./edit-panels";
import { MediaPreview, useIsVideoMedia } from "./media-preview";
import type { DeviceFrameAttributes, DeviceFramePanelProps } from "./attributes";

export type { DeviceFrameAttributes } from "./attributes";

const buildFrameClassName = (attributes: DeviceFrameAttributes): string => {
  const { device, positionStyle, keepEffectOnMobile, enableLightbox } = attributes;
  const positionStyleClass = (positionStyle ?? "") ? ` kt-device-frame--${positionStyle}` : "";
  const mobilePreserveClass = keepEffectOnMobile ? " kt-device-frame--mobile-preserve" : "";
  const lightboxClass = enableLightbox ? " kt-device-frame--lightbox-enabled" : "";
  return `kt-device-frame kt-device-frame--${device}${positionStyleClass}${mobilePreserveClass}${lightboxClass}`;
};

export default function Edit({ attributes, setAttributes }: DeviceFramePanelProps) {
  const { device, aspectRatio, imageId, imageUrl, enableLightbox } = attributes;
  const resolvedAspectRatio = aspectRatio || DEVICE_ASPECT_RATIOS[device];
  const isVideo = useIsVideoMedia(imageId);
  const blockProps = useBlockProps({ className: buildFrameClassName(attributes) });
  const panelProps = { attributes, setAttributes };

  return (
    <>
      <InspectorControls>
        <DeviceFramePanel {...panelProps} />
        <MediaBehaviorPanel {...panelProps} />
      </InspectorControls>

      <div
        {...blockProps}
        style={{ "--kt-device-frame-aspect-ratio": resolvedAspectRatio } as React.CSSProperties}
      >
        <div className="kt-device-frame__bezel">
          <div className="kt-device-frame__screen">
            <MediaPreview attributes={attributes} isVideo={isVideo} />
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

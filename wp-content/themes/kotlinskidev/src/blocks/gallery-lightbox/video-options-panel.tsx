import React from "react";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { GalleryEditProps } from "./gallery-media";

export const VideoOptionsPanel = ({ attributes, setAttributes }: GalleryEditProps) => {
  const {
    videoControls = true,
    videoAutoplay = false,
    videoLoop = false,
    videoMuted = false,
  } = attributes;
  return (
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
  );
};

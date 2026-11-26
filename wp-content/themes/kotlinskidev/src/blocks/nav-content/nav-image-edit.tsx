import React from "react";
import type { BlockEditProps } from "@wordpress/blocks";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ImagePicker, placeholderStyle, previewStyle } from "./editor-controls";
import type { MediaObject, NavImageAttributes } from "./types";

export function NavImageEdit({ attributes, setAttributes }: BlockEditProps<NavImageAttributes>) {
  const blockProps = useBlockProps();
  const { mediaId, mediaUrl, altText, linkUrl } = attributes;

  const onSelectMedia = (media: MediaObject) =>
    setAttributes({ mediaId: media.id, mediaUrl: media.url, altText: media.alt ?? "" });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Image", "kotlinskidev")} initialOpen>
          <ImagePicker mediaId={mediaId} mediaUrl={mediaUrl} onSelectMedia={onSelectMedia} />
          <TextControl
            label={__("Alt text", "kotlinskidev")}
            value={altText}
            onChange={(value) => setAttributes({ altText: value })}
          />
          <TextControl
            label={__("Link URL", "kotlinskidev")}
            value={linkUrl}
            onChange={(value) => setAttributes({ linkUrl: value })}
          />
        </PanelBody>
      </InspectorControls>
      {mediaUrl ? (
        <img
          src={mediaUrl}
          alt={altText}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      ) : (
        <div style={previewStyle}>
          <p style={placeholderStyle}>
            {__("Nav image — select an image in the panel →", "kotlinskidev")}
          </p>
        </div>
      )}
    </div>
  );
}

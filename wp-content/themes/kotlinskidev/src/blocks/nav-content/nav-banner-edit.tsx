import React from "react";
import type { BlockEditProps } from "@wordpress/blocks";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { PanelBody, TextControl, TextareaControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ImagePicker, placeholderStyle, previewStyle } from "./editor-controls";
import type { MediaObject, NavBannerAttributes } from "./types";

type BannerPanelProps = BlockEditProps<NavBannerAttributes>;

const BannerImagePanel = ({ attributes, setAttributes }: BannerPanelProps): JSX.Element => {
  const { mediaId, mediaUrl, altText, followLinkedCover } = attributes;

  const onSelectMedia = (media: MediaObject) =>
    setAttributes({ mediaId: media.id, mediaUrl: media.url, altText: media.alt ?? "" });

  return (
    <PanelBody title={__("Image", "kotlinskidev")} initialOpen>
      <ToggleControl
        label={__("Use the linked page cover", "kotlinskidev")}
        help={__(
          "Show the featured image of the page this card links to. Falls back to the image below.",
          "kotlinskidev"
        )}
        checked={!!followLinkedCover}
        onChange={(value) => setAttributes({ followLinkedCover: value })}
      />
      <ImagePicker mediaId={mediaId} mediaUrl={mediaUrl} onSelectMedia={onSelectMedia} />
      <TextControl
        label={__("Alt text", "kotlinskidev")}
        value={altText}
        onChange={(value) => setAttributes({ altText: value })}
      />
    </PanelBody>
  );
};

const HoverHighlightPanel = ({ attributes, setAttributes }: BannerPanelProps): JSX.Element => (
  <PanelBody title={__("Hover highlight", "kotlinskidev")} initialOpen={false}>
    <TextControl
      label={__("Padding", "kotlinskidev")}
      value={attributes.hoverPadding}
      onChange={(value) => setAttributes({ hoverPadding: value })}
      placeholder={__("1.25rem", "kotlinskidev")}
      help={__(
        "Space around the banner the frosted hover background fills. Any CSS length, e.g. 1.5rem or 20px.",
        "kotlinskidev"
      )}
    />
  </PanelBody>
);

const BannerTextPanels = ({ attributes, setAttributes }: BannerPanelProps): JSX.Element => {
  const { heading, description, linkUrl, linkLabel } = attributes;

  return (
    <>
      <PanelBody title={__("Content", "kotlinskidev")}>
        <TextControl
          label={__("Heading", "kotlinskidev")}
          value={heading}
          onChange={(value) => setAttributes({ heading: value })}
        />
        <TextareaControl
          label={__("Description", "kotlinskidev")}
          value={description}
          onChange={(value) => setAttributes({ description: value })}
          rows={3}
        />
      </PanelBody>
      <PanelBody title={__("Link", "kotlinskidev")}>
        <TextControl
          label={__("URL", "kotlinskidev")}
          value={linkUrl}
          onChange={(value) => setAttributes({ linkUrl: value })}
        />
        <TextControl
          label={__("Label", "kotlinskidev")}
          value={linkLabel}
          onChange={(value) => setAttributes({ linkLabel: value })}
          placeholder={__("Leave empty to link the image only", "kotlinskidev")}
        />
      </PanelBody>
      <HoverHighlightPanel {...{ attributes, setAttributes }} />
    </>
  );
};

const BannerTextPreview = ({
  heading,
  description,
  linkUrl,
  linkLabel,
}: Pick<NavBannerAttributes, "heading" | "description" | "linkUrl" | "linkLabel">): JSX.Element => (
  <div style={previewStyle}>
    {heading ? (
      <strong style={{ display: "block", marginBottom: "0.25rem" }}>{heading}</strong>
    ) : (
      <strong style={{ display: "block", marginBottom: "0.25rem", ...placeholderStyle }}>
        {__("Heading…", "kotlinskidev")}
      </strong>
    )}
    {description ? (
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>{description}</p>
    ) : (
      <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem", ...placeholderStyle }}>
        {__("Description…", "kotlinskidev")}
      </p>
    )}
    {linkUrl && linkLabel && (
      <span style={{ fontSize: "0.8125rem", fontWeight: 500 }}>{linkLabel} →</span>
    )}
  </div>
);

export function NavBannerEdit(props: BannerPanelProps) {
  const blockProps = useBlockProps();
  const { mediaUrl, altText } = props.attributes;

  return (
    <div {...blockProps}>
      <InspectorControls>
        <BannerImagePanel {...props} />
        <BannerTextPanels {...props} />
      </InspectorControls>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={altText}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        ) : (
          <div style={previewStyle}>
            <p style={placeholderStyle}>
              {__("Nav banner — select an image in the panel →", "kotlinskidev")}
            </p>
          </div>
        )}
        <BannerTextPreview {...props.attributes} />
      </div>
    </div>
  );
}

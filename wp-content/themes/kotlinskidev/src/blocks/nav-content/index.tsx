import type { CSSProperties } from "react";
import { registerBlockType, type BlockConfiguration, type BlockEditProps } from "@wordpress/blocks";
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  MediaPlaceholder,
} from "@wordpress/block-editor";
import {
  PanelBody,
  Button,
  TextControl,
  TextareaControl,
  RangeControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import paragraphMetadata from "../nav-paragraph/block.json";
import imageMetadata from "../nav-image/block.json";
import bannerMetadata from "../nav-banner/block.json";

interface MediaObject {
  id: number;
  url: string;
  alt: string;
}

interface NavParagraphAttributes {
  content: string;
}

interface NavImageAttributes {
  mediaId: number;
  mediaUrl: string;
  altText: string;
  linkUrl: string;
}

interface NavBannerAttributes {
  mediaId: number;
  mediaUrl: string;
  heading: string;
  description: string;
  linkUrl: string;
  linkLabel: string;
  overlayOpacity: number;
}

const previewStyle: CSSProperties = {
  minHeight: "3em",
  padding: "0.75em 1em",
  border: "1px dashed #b5bfc9",
  borderRadius: "2px",
  boxSizing: "border-box",
};

const placeholderStyle: CSSProperties = {
  color: "#b5bfc9",
  fontStyle: "italic",
  margin: 0,
};

function NavParagraphEdit({ attributes, setAttributes }: BlockEditProps<NavParagraphAttributes>) {
  const blockProps = useBlockProps();
  const { content } = attributes;

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Content", "kotlinskidev")} initialOpen>
          <TextareaControl
            label={__("Paragraph text", "kotlinskidev")}
            value={content}
            onChange={(value) => setAttributes({ content: value })}
            rows={5}
          />
        </PanelBody>
      </InspectorControls>
      <div style={previewStyle}>
        {content ? (
          <p style={{ margin: 0 }}>{content}</p>
        ) : (
          <p style={placeholderStyle}>
            {__("Nav paragraph — add text in the panel →", "kotlinskidev")}
          </p>
        )}
      </div>
    </div>
  );
}

function NavImageEdit({ attributes, setAttributes }: BlockEditProps<NavImageAttributes>) {
  const blockProps = useBlockProps();
  const { mediaId, mediaUrl, altText, linkUrl } = attributes;

  const onSelectMedia = (media: MediaObject) =>
    setAttributes({ mediaId: media.id, mediaUrl: media.url, altText: media.alt ?? "" });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Image", "kotlinskidev")} initialOpen>
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
                  {mediaUrl
                    ? __("Replace image", "kotlinskidev")
                    : __("Select image", "kotlinskidev")}
                </Button>
              )}
            />
          </MediaUploadCheck>
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

function NavBannerEdit({ attributes, setAttributes }: BlockEditProps<NavBannerAttributes>) {
  const blockProps = useBlockProps();
  const { mediaId, mediaUrl, heading, description, linkUrl, linkLabel, overlayOpacity } =
    attributes;

  const onSelectMedia = (media: MediaObject) =>
    setAttributes({ mediaId: media.id, mediaUrl: media.url });

  const overlayAlpha = overlayOpacity / 100;

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Content", "kotlinskidev")} initialOpen>
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
        <PanelBody title={__("Background image", "kotlinskidev")}>
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
                  {mediaUrl
                    ? __("Replace image", "kotlinskidev")
                    : __("Select image", "kotlinskidev")}
                </Button>
              )}
            />
          </MediaUploadCheck>
          <RangeControl
            label={__("Overlay opacity", "kotlinskidev")}
            value={overlayOpacity}
            onChange={(value) => setAttributes({ overlayOpacity: value ?? 40 })}
            min={0}
            max={100}
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
            placeholder={__("Learn more", "kotlinskidev")}
          />
        </PanelBody>
      </InspectorControls>

      <div
        style={{
          position: "relative",
          minHeight: 200,
          backgroundImage: mediaUrl ? `url(${mediaUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: mediaUrl ? undefined : "#555",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(0,0,0,${overlayAlpha})`,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", color: "#fff" }}>
          {heading ? (
            <h3 style={{ margin: "0 0 0.5rem", color: "#fff" }}>{heading}</h3>
          ) : (
            <h3
              style={{ margin: "0 0 0.5rem", color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}
            >
              {__("Heading…", "kotlinskidev")}
            </h3>
          )}
          {description ? (
            <p style={{ margin: "0 0 1rem", color: "rgba(255,255,255,0.85)" }}>{description}</p>
          ) : (
            <p style={{ margin: "0 0 1rem", color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>
              {__("Description…", "kotlinskidev")}
            </p>
          )}
          {(linkUrl || linkLabel) && (
            <span
              style={{
                display: "inline-block",
                padding: "0.375rem 0.75rem",
                background: "rgba(255,255,255,0.2)",
                borderRadius: "0.25rem",
                color: "#fff",
                fontSize: "0.875rem",
              }}
            >
              {linkLabel || __("Learn more", "kotlinskidev")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(paragraphMetadata as unknown as BlockConfiguration<NavParagraphAttributes>, {
  edit: NavParagraphEdit,
  save: Save,
});

registerBlockType(imageMetadata as unknown as BlockConfiguration<NavImageAttributes>, {
  edit: NavImageEdit,
  save: Save,
});

registerBlockType(bannerMetadata as unknown as BlockConfiguration<NavBannerAttributes>, {
  edit: NavBannerEdit,
  save: Save,
});

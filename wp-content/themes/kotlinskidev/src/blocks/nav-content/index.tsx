import type { ComponentType, CSSProperties } from "react";
import { registerBlockType, type BlockConfiguration, type BlockEditProps } from "@wordpress/blocks";
import {
  useBlockProps,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  RichText,
} from "@wordpress/block-editor";
import * as blockEditor from "@wordpress/block-editor";
import { PanelBody, Button, TextControl, TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import paragraphMetadata from "../nav-paragraph/block.json";
import imageMetadata from "../nav-image/block.json";
import bannerMetadata from "../nav-banner/block.json";
import linkMetadata from "../nav-link/block.json";

interface MediaObject {
  id: number;
  url: string;
  alt: string;
}

interface NavParagraphAttributes {
  content: string;
  textColor: string;
  textGradient: string;
}

interface NavImageAttributes {
  mediaId: number;
  mediaUrl: string;
  altText: string;
  linkUrl: string;
}

interface NavLinkAttributes {
  label: string;
  url: string;
  opensInNewTab: boolean;
  description: string;
  rel: string;
  textColor: string;
  textGradient: string;
}

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

const {
  __experimentalLinkControl: LinkControl,
  __experimentalColorGradientControl: ColorGradientControl,
} = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
  __experimentalColorGradientControl: ComponentType<ColorGradientControlProps>;
};

interface NavBannerAttributes {
  mediaId: number;
  mediaUrl: string;
  altText: string;
  heading: string;
  description: string;
  linkUrl: string;
  linkLabel: string;
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
  const { content, textColor, textGradient } = attributes;

  let textStyle: CSSProperties = {};
  if (textGradient) {
    textStyle = {
      backgroundImage: textGradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  } else if (textColor) {
    textStyle = { color: textColor };
  }

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
        <PanelBody title={__("Text color", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Text", "kotlinskidev")}
            colorValue={textColor || undefined}
            gradientValue={textGradient || undefined}
            onColorChange={(value) => setAttributes({ textColor: value ?? "" })}
            onGradientChange={(value) => setAttributes({ textGradient: value ?? "" })}
            clearable
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <div style={previewStyle}>
        {content ? (
          <p style={{ margin: 0, ...textStyle }}>{content}</p>
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
  const { mediaId, mediaUrl, altText, heading, description, linkUrl, linkLabel } = attributes;

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
        </PanelBody>
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
      </div>
    </div>
  );
}

function NavLinkEdit({ attributes, setAttributes }: BlockEditProps<NavLinkAttributes>) {
  const blockProps = useBlockProps({ className: "kt-nav-link" });
  const { label, url, opensInNewTab, description, rel, textColor, textGradient } = attributes;

  let labelStyle: CSSProperties = {};
  if (textGradient) {
    labelStyle = {
      backgroundImage: textGradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "transparent",
    };
  } else if (textColor) {
    labelStyle = { color: textColor };
  }

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Link settings", "kotlinskidev")} initialOpen>
          <LinkControl
            value={{ url, opensInNewTab }}
            settings={[{ id: "opensInNewTab", title: __("Open in new tab", "kotlinskidev") }]}
            onChange={(next) =>
              setAttributes({
                url: next.url ?? "",
                opensInNewTab: Boolean(next.opensInNewTab),
                ...(label === "" && next.title ? { label: next.title } : {}),
              })
            }
            onRemove={() => setAttributes({ url: "" })}
          />
          <TextareaControl
            label={__("Description", "kotlinskidev")}
            help={__(
              "The description will be displayed in the menu if the current theme supports it.",
              "kotlinskidev"
            )}
            value={description}
            onChange={(value) => setAttributes({ description: value })}
          />
          <TextControl
            label={__("Rel attribute", "kotlinskidev")}
            help={__(
              "The relationship of the linked URL as space-separated link types.",
              "kotlinskidev"
            )}
            value={rel}
            onChange={(value) => setAttributes({ rel: value })}
          />
        </PanelBody>
        <PanelBody title={__("Text color", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Gradient Colors", "kotlinskidev")}
            colorValue={textColor || undefined}
            gradientValue={textGradient || undefined}
            onColorChange={(value) => setAttributes({ textColor: value ?? "" })}
            onGradientChange={(value) => setAttributes({ textGradient: value ?? "" })}
            clearable
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <RichText
        tagName="span"
        style={labelStyle}
        value={label}
        onChange={(value) => setAttributes({ label: value })}
        placeholder={__("Nav link label…", "kotlinskidev")}
      />
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

registerBlockType(linkMetadata as unknown as BlockConfiguration<NavLinkAttributes>, {
  edit: NavLinkEdit,
  save: Save,
});

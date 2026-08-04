import React, { type ComponentType, type CSSProperties } from "react";
import { InspectorControls, RichText, useBlockProps } from "@wordpress/block-editor";
import * as blockEditor from "@wordpress/block-editor";
import { PanelBody, RangeControl, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { BlockEditProps } from "@wordpress/blocks";
import { ButtonColorPanel } from "./ButtonColorControls";

export interface ButtonAttributes {
  text: string;
  url: string;
  opensInNewTab: boolean;
  rel: string;
  borderWidth: number;
  textColor: string;
  textGradient: string;
  backgroundColor: string;
  backgroundGradient: string;
  borderColor: string;
  borderGradient: string;
  hoverTextColor: string;
  hoverTextGradient: string;
  hoverBackgroundColor: string;
  hoverBackgroundGradient: string;
  hoverBorderColor: string;
  hoverBorderGradient: string;
}

interface LinkControlValue {
  url?: string;
  opensInNewTab?: boolean;
}

interface LinkControlProps {
  value: LinkControlValue;
  settings: { id: string; title: string }[];
  onChange: (value: LinkControlValue) => void;
  onRemove: () => void;
}

const { __experimentalLinkControl: LinkControl } = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
};

function pickValue(color: string, gradient: string): string {
  return gradient || color || "";
}

export default function ButtonEdit({
  attributes,
  setAttributes,
}: BlockEditProps<ButtonAttributes>) {
  const blockProps = useBlockProps({ className: "kt-button" });
  const {
    text,
    url,
    opensInNewTab,
    rel,
    borderWidth,
    textColor,
    textGradient,
    backgroundColor,
    backgroundGradient,
    borderColor,
    borderGradient,
    hoverTextColor,
    hoverTextGradient,
    hoverBackgroundColor,
    hoverBackgroundGradient,
    hoverBorderColor,
    hoverBorderGradient,
  } = attributes;

  const linkStyle = {
    "--kt-btn-bg": pickValue(backgroundColor, backgroundGradient) || undefined,
    "--kt-btn-hover-bg": pickValue(hoverBackgroundColor, hoverBackgroundGradient) || undefined,
    "--kt-btn-border": pickValue(borderColor, borderGradient) || undefined,
    "--kt-btn-hover-border": pickValue(hoverBorderColor, hoverBorderGradient) || undefined,
    "--kt-btn-border-width": `${borderWidth}px`,
  } as CSSProperties;

  const labelStyle = {
    "--kt-btn-color": pickValue(textColor, textGradient) || undefined,
    "--kt-btn-hover-color": pickValue(hoverTextColor, hoverTextGradient) || undefined,
  } as CSSProperties;

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
              })
            }
            onRemove={() => setAttributes({ url: "" })}
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
        <PanelBody title={__("Border width", "kotlinskidev")} initialOpen={false}>
          <RangeControl
            label={__("Border width (px)", "kotlinskidev")}
            value={borderWidth}
            onChange={(value) => setAttributes({ borderWidth: value ?? 0 })}
            min={0}
            max={10}
            help={__(
              "Applies to Border color/gradient set below. Native corner radius is available in the Border panel.",
              "kotlinskidev"
            )}
          />
        </PanelBody>
        <ButtonColorPanel
          title={__("Normal state", "kotlinskidev")}
          initialOpen
          text={{
            color: textColor,
            gradient: textGradient,
            onColorChange: (color) => setAttributes({ textColor: color }),
            onGradientChange: (gradient) => setAttributes({ textGradient: gradient }),
          }}
          background={{
            color: backgroundColor,
            gradient: backgroundGradient,
            onColorChange: (color) => setAttributes({ backgroundColor: color }),
            onGradientChange: (gradient) => setAttributes({ backgroundGradient: gradient }),
          }}
          border={{
            color: borderColor,
            gradient: borderGradient,
            onColorChange: (color) => setAttributes({ borderColor: color }),
            onGradientChange: (gradient) => setAttributes({ borderGradient: gradient }),
          }}
        />
        <ButtonColorPanel
          title={__("Hover state", "kotlinskidev")}
          text={{
            color: hoverTextColor,
            gradient: hoverTextGradient,
            onColorChange: (color) => setAttributes({ hoverTextColor: color }),
            onGradientChange: (gradient) => setAttributes({ hoverTextGradient: gradient }),
          }}
          background={{
            color: hoverBackgroundColor,
            gradient: hoverBackgroundGradient,
            onColorChange: (color) => setAttributes({ hoverBackgroundColor: color }),
            onGradientChange: (gradient) => setAttributes({ hoverBackgroundGradient: gradient }),
          }}
          border={{
            color: hoverBorderColor,
            gradient: hoverBorderGradient,
            onColorChange: (color) => setAttributes({ hoverBorderColor: color }),
            onGradientChange: (gradient) => setAttributes({ hoverBorderGradient: gradient }),
          }}
        />
      </InspectorControls>
      <a className="kt-button__link" style={linkStyle} href={url || undefined}>
        <RichText
          tagName="span"
          className="kt-button__label"
          style={labelStyle}
          value={text}
          onChange={(value) => setAttributes({ text: value })}
          placeholder={__("Add text…", "kotlinskidev")}
        />
      </a>
    </div>
  );
}

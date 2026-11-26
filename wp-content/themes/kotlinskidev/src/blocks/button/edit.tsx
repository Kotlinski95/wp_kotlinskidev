import React, { type CSSProperties } from "react";
import { InnerBlocks, InspectorControls, RichText, useBlockProps } from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import type { BlockEditProps } from "@wordpress/blocks";
import {
  BorderWidthPanel,
  ContentPanel,
  EnhancedHoverPanel,
  HoverStatePanel,
  LinkSettingsPanel,
  NormalStatePanel,
  type SetButtonAttributes,
} from "./ButtonSettingsPanels";

export const BUTTON_ALLOWED_BLOCKS = [
  "core/paragraph",
  "kotlinskidev/protected-content",
  "kotlinskidev/icon",
];

const BUTTON_CONTENT_TEMPLATE: [string, Record<string, unknown>][] = [
  ["core/paragraph", { placeholder: __("Add text…", "kotlinskidev") }],
];

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
  hoverEnhancedGlow: boolean;
  useInnerBlocks: boolean;
}

function pickValue(color: string, gradient: string): string {
  return gradient || color || "";
}

function buildLinkStyle(attributes: ButtonAttributes): CSSProperties {
  return {
    "--kt-btn-bg":
      pickValue(attributes.backgroundColor, attributes.backgroundGradient) || undefined,
    "--kt-btn-hover-bg":
      pickValue(attributes.hoverBackgroundColor, attributes.hoverBackgroundGradient) || undefined,
    "--kt-btn-border": pickValue(attributes.borderColor, attributes.borderGradient) || undefined,
    "--kt-btn-hover-border":
      pickValue(attributes.hoverBorderColor, attributes.hoverBorderGradient) || undefined,
    "--kt-btn-border-width": `${attributes.borderWidth}px`,
  } as CSSProperties;
}

function buildLabelStyle(attributes: ButtonAttributes): CSSProperties {
  return {
    "--kt-btn-color": pickValue(attributes.textColor, attributes.textGradient) || undefined,
    "--kt-btn-hover-color":
      pickValue(attributes.hoverTextColor, attributes.hoverTextGradient) || undefined,
  } as CSSProperties;
}

function ButtonLabel({
  attributes,
  setAttributes,
}: {
  attributes: ButtonAttributes;
  setAttributes: SetButtonAttributes;
}) {
  const labelStyle = buildLabelStyle(attributes);
  if (attributes.useInnerBlocks) {
    return (
      <span className="kt-button__label" style={labelStyle}>
        <InnerBlocks
          allowedBlocks={BUTTON_ALLOWED_BLOCKS}
          template={BUTTON_CONTENT_TEMPLATE}
          templateLock={false}
        />
      </span>
    );
  }
  return (
    <RichText
      tagName="span"
      className="kt-button__label"
      style={labelStyle}
      value={attributes.text}
      onChange={(value) => setAttributes({ text: value })}
      placeholder={__("Add text…", "kotlinskidev")}
    />
  );
}

export default function ButtonEdit({
  attributes,
  setAttributes,
}: BlockEditProps<ButtonAttributes>) {
  const blockProps = useBlockProps({ className: "kt-button" });
  const panelProps = { attributes, setAttributes };

  return (
    <div {...blockProps}>
      <InspectorControls>
        <LinkSettingsPanel {...panelProps} />
        <ContentPanel {...panelProps} />
        <BorderWidthPanel {...panelProps} />
        <NormalStatePanel {...panelProps} />
        <HoverStatePanel {...panelProps} />
        <EnhancedHoverPanel {...panelProps} />
      </InspectorControls>
      <a
        className={`kt-button__link${attributes.hoverEnhancedGlow ? " has-enhanced-hover-glow" : ""}`}
        style={buildLinkStyle(attributes)}
        href={attributes.url || undefined}
      >
        <ButtonLabel attributes={attributes} setAttributes={setAttributes} />
      </a>
    </div>
  );
}

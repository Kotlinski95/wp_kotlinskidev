import React from "react";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { Notice, PanelBody, TextControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../shared/nav-icon-picker";

export interface IconAttributes {
  mediaId: number;
  mediaUrl: string;
  size: string;
  color: string;
  ariaLabel: string;
  showTooltip: boolean;
}

interface EditProps {
  attributes: IconAttributes;
  setAttributes: (attrs: Partial<IconAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { mediaId, mediaUrl, size, color, ariaLabel, showTooltip } = attributes;

  const blockProps = useBlockProps({ className: "kt-icon-editor" });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Icon", "kotlinskidev")} initialOpen>
          <NavIconPicker
            iconId={mediaId}
            iconUrl={mediaUrl}
            onChange={(id, url) => setAttributes({ mediaId: id, mediaUrl: url })}
          />
        </PanelBody>

        <PanelBody title={__("Appearance & Accessibility", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Size", "kotlinskidev")}
            help={__(
              "Any CSS value, e.g. 1.5rem or 24px. Leave empty for the default size.",
              "kotlinskidev"
            )}
            value={size}
            onChange={(value) => setAttributes({ size: value })}
          />
          <TextControl
            label={__("Color", "kotlinskidev")}
            help={__(
              "Any CSS color value. Leave empty to inherit the surrounding text color.",
              "kotlinskidev"
            )}
            value={color}
            onChange={(value) => setAttributes({ color: value })}
          />
          <TextControl
            label={__("Accessible label", "kotlinskidev")}
            help={__(
              "Only set this if the icon conveys meaning on its own (e.g. a standalone social link). Leave empty for a purely decorative icon.",
              "kotlinskidev"
            )}
            value={ariaLabel}
            onChange={(value) => setAttributes({ ariaLabel: value })}
          />
          {!ariaLabel && (
            <Notice status="info" isDismissible={false}>
              {__("This icon will be hidden from screen readers as decorative.", "kotlinskidev")}
            </Notice>
          )}
          {ariaLabel && (
            <ToggleControl
              label={__("Show tooltip on hover", "kotlinskidev")}
              help={__("Shows the accessible label above the icon on hover/focus.", "kotlinskidev")}
              checked={showTooltip}
              onChange={(value) => setAttributes({ showTooltip: value })}
            />
          )}
        </PanelBody>
      </InspectorControls>

      <div {...blockProps}>
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt=""
            style={{ width: size || "1.5rem", height: size || "1.5rem", color: color || undefined }}
          />
        ) : (
          <div className="kt-icon-editor__placeholder dashicons dashicons-star-filled" />
        )}
      </div>
    </>
  );
}

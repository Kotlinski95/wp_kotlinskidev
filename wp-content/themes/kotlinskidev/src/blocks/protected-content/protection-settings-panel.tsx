import React from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { ProtectedContentAttributes, ProtectionType } from "./protected-content-types";

const tagNameOptions = [
  { label: __("Paragraph", "kotlinskidev"), value: "p" },
  { label: __("Heading 1", "kotlinskidev"), value: "h1" },
  { label: __("Heading 2", "kotlinskidev"), value: "h2" },
  { label: __("Heading 3", "kotlinskidev"), value: "h3" },
  { label: __("Heading 4", "kotlinskidev"), value: "h4" },
  { label: __("Heading 5", "kotlinskidev"), value: "h5" },
  { label: __("Heading 6", "kotlinskidev"), value: "h6" },
  { label: __("Span", "kotlinskidev"), value: "span" },
  { label: __("Div", "kotlinskidev"), value: "div" },
];

const protectionTypeOptions = [
  { label: __("Email", "kotlinskidev"), value: "email" },
  { label: __("Phone", "kotlinskidev"), value: "phone" },
  { label: __("Address", "kotlinskidev"), value: "address" },
  { label: __("Other", "kotlinskidev"), value: "other" },
  { label: __("General Text (preserves HTML)", "kotlinskidev"), value: "text" },
];

interface ProtectionSettingsPanelProps {
  attributes: ProtectedContentAttributes;
  setAttributes: (attributes: Partial<ProtectedContentAttributes>) => void;
}

const ProtectionTypeSelect = ({ attributes, setAttributes }: ProtectionSettingsPanelProps) => (
  <SelectControl
    label={__("Protection Type", "kotlinskidev")}
    value={attributes.protectionType}
    options={protectionTypeOptions}
    onChange={(value) => setAttributes({ protectionType: value as ProtectionType })}
  />
);

export const ProtectionSettingsPanel = ({
  attributes,
  setAttributes,
}: ProtectionSettingsPanelProps) => {
  const { useProtection, tagName, isHtmlMode } = attributes;

  return (
    <InspectorControls>
      <PanelBody title={__("Protection Settings", "kotlinskidev")} initialOpen={true}>
        <ToggleControl
          label={__("Use Protection", "kotlinskidev")}
          help={__(
            "Encrypt this content server-side; only revealed after a click.",
            "kotlinskidev"
          )}
          checked={useProtection}
          onChange={(value) => setAttributes({ useProtection: value })}
        />

        {useProtection && (
          <ProtectionTypeSelect attributes={attributes} setAttributes={setAttributes} />
        )}

        <ToggleControl
          label={__("HTML Mode", "kotlinskidev")}
          help={__("Enable to preserve HTML structure (links, formatting, etc.)", "kotlinskidev")}
          checked={isHtmlMode}
          onChange={(value) => setAttributes({ isHtmlMode: value })}
        />

        <SelectControl
          label={__("HTML Tag", "kotlinskidev")}
          value={tagName}
          options={tagNameOptions}
          onChange={(value) => setAttributes({ tagName: value })}
        />
      </PanelBody>
    </InspectorControls>
  );
};

import React from "react";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export type ContactDetailField = "address" | "phone" | "email" | "hours";

export interface ContactDetailAttributes {
  field: ContactDetailField;
  showLabel: boolean;
}

interface EditProps {
  attributes: ContactDetailAttributes;
  setAttributes: (attrs: Partial<ContactDetailAttributes>) => void;
}

const FIELD_OPTIONS: { label: string; value: ContactDetailField }[] = [
  { label: __("Address", "kotlinskidev"), value: "address" },
  { label: __("Phone", "kotlinskidev"), value: "phone" },
  { label: __("Email", "kotlinskidev"), value: "email" },
  { label: __("Hours", "kotlinskidev"), value: "hours" },
];

const FIELD_PLACEHOLDERS: Record<ContactDetailField, string> = {
  address: __("123 Example Street", "kotlinskidev"),
  phone: __("+1 555 123 4567", "kotlinskidev"),
  email: __("hello@example.com", "kotlinskidev"),
  hours: __("Mon–Fri, 9:00–17:00", "kotlinskidev"),
};

export default function Edit({ attributes, setAttributes }: EditProps) {
  const { field, showLabel } = attributes;

  const blockProps = useBlockProps();

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Contact Detail", "kotlinskidev")} initialOpen>
          <SelectControl
            label={__("Field", "kotlinskidev")}
            value={field}
            options={FIELD_OPTIONS}
            onChange={(value) => setAttributes({ field: value as ContactDetailField })}
            help={__("Value comes from Settings → Contact Card.", "kotlinskidev")}
          />
          <ToggleControl
            label={__("Show field label", "kotlinskidev")}
            checked={showLabel}
            onChange={(value) => setAttributes({ showLabel: value })}
          />
        </PanelBody>
      </InspectorControls>

      <span {...blockProps}>{FIELD_PLACEHOLDERS[field]}</span>
    </>
  );
}

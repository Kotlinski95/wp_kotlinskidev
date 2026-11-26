import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import { useBlockProps, InspectorControls } from "@wordpress/block-editor";
import { AttachmentsPanel, CaptchaPanel, FormSettingsPanel, RedirectPanel } from "./edit-panels";
import { FormPreview } from "./edit-preview";
import type { ContactFormAttributes, ContactFormPanelProps } from "./attributes";
import metadata from "./block.json";
import "./style.scss";

export type { ContactFormAttributes } from "./attributes";

export function Edit({ attributes, setAttributes }: ContactFormPanelProps) {
  const blockProps = useBlockProps({ className: "contact-form-block" });
  const panelProps = { attributes, setAttributes };

  return (
    <div>
      <InspectorControls>
        <FormSettingsPanel {...panelProps} />
        <AttachmentsPanel {...panelProps} />
        <CaptchaPanel {...panelProps} />
        <RedirectPanel {...panelProps} />
      </InspectorControls>
      <FormPreview attributes={attributes} blockProps={blockProps} />
    </div>
  );
}

registerBlockType(metadata as unknown as BlockConfiguration<ContactFormAttributes>, {
  edit: Edit,
  save() {
    return null;
  },
});

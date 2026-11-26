import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { BlurOtherCardsFields } from "../shared/blur-amount-control";

interface CertificatesGridAttributes {
  layout: "badge-grid" | "feature-cards" | "compact-strip";
  viewAllUrl: string;
  blurOtherCards: boolean;
  blurAmount: string;
}

interface CertificatesGridEditProps {
  attributes: CertificatesGridAttributes;
  setAttributes: (attrs: Partial<CertificatesGridAttributes>) => void;
}

function CertificatesGridPanel({ attributes, setAttributes }: CertificatesGridEditProps) {
  const { layout, viewAllUrl } = attributes;

  return (
    <PanelBody title={__("Certificates Grid", "kotlinskidev")} initialOpen={true}>
      <SelectControl
        label={__("Layout", "kotlinskidev")}
        value={layout}
        options={[
          { label: __("Badge grid", "kotlinskidev"), value: "badge-grid" },
          { label: __("Feature cards", "kotlinskidev"), value: "feature-cards" },
          { label: __("Compact strip", "kotlinskidev"), value: "compact-strip" },
        ]}
        onChange={(value) =>
          setAttributes({ layout: value as CertificatesGridAttributes["layout"] })
        }
      />
      {"compact-strip" === layout && (
        <TextControl
          label={__('"All credentials" link', "kotlinskidev")}
          type="url"
          value={viewAllUrl}
          help={__(
            "Where the trailing link points to. Leave empty to hide the link.",
            "kotlinskidev"
          )}
          onChange={(value) => setAttributes({ viewAllUrl: value })}
        />
      )}
      <BlurOtherCardsFields attributes={attributes} setAttributes={setAttributes} />
      <p className="components-base-control__help">
        {__(
          "Manage certificates (name, issuer, badge image, verify link) from Certificates in the admin menu. Every published certificate appears here automatically.",
          "kotlinskidev"
        )}
      </p>
    </PanelBody>
  );
}

function CertificatesGridEdit({ attributes, setAttributes }: CertificatesGridEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <CertificatesGridPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/certificates-grid-dynamic" attributes={attributes} />
    </div>
  );
}

registerBlockType("kotlinskidev/certificates-grid-dynamic", {
  title: "Certificates Grid (Dynamic)",
  category: "kotlinskidev",
  attributes: {
    layout: { type: "string", default: "badge-grid" },
    viewAllUrl: { type: "string", default: "" },
    blurOtherCards: { type: "boolean", default: false },
    blurAmount: { type: "string", default: "" },
  },
  edit: CertificatesGridEdit,
  save() {
    return null;
  },
});

import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, ComboboxControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { SolidColorControl } from "../shared/solid-color-control";
import { usePublishedPostOptions } from "../shared/use-post-options";

export type CertificateLayout = "badge-grid" | "feature-cards" | "compact-strip";

export interface CertificateAttributes {
  certificateId?: number;
  layout?: CertificateLayout;
  secondaryTextColor?: string;
  accentColor?: string;
}

export interface CertificateEditProps {
  attributes: CertificateAttributes;
  setAttributes: (attrs: Partial<CertificateAttributes>) => void;
}

interface CertificateControlsProps {
  attributes: CertificateAttributes;
  setAttributes: CertificateEditProps["setAttributes"];
}

function CertificateSelectionPanel({ attributes, setAttributes }: CertificateControlsProps) {
  const certificateId = attributes.certificateId ?? 0;
  const layout = attributes.layout ?? "badge-grid";
  const options = usePublishedPostOptions("kt_certificate");

  return (
    <PanelBody title={__("Certificate", "kotlinskidev")} initialOpen={true}>
      <ComboboxControl
        key={`${certificateId}-${options.length}`}
        label={__("Certificate", "kotlinskidev")}
        value={certificateId ? String(certificateId) : ""}
        options={options}
        onChange={(value) => setAttributes({ certificateId: value ? Number(value) : 0 })}
        allowReset={true}
        help={__(
          "Manage the certificate's badge, issuer, and verify link from Certificates in the admin menu. Editing it there updates every pattern it's embedded in.",
          "kotlinskidev"
        )}
      />
      <SelectControl
        label={__("Layout", "kotlinskidev")}
        value={layout}
        options={[
          { label: __("Badge grid", "kotlinskidev"), value: "badge-grid" },
          { label: __("Feature cards", "kotlinskidev"), value: "feature-cards" },
          { label: __("Compact strip", "kotlinskidev"), value: "compact-strip" },
        ]}
        onChange={(value) => setAttributes({ layout: value as CertificateAttributes["layout"] })}
      />
    </PanelBody>
  );
}

function CardColorsPanel({ attributes, setAttributes }: CertificateControlsProps) {
  return (
    <PanelBody title={__("Card Colors", "kotlinskidev")} initialOpen={false}>
      <SolidColorControl
        label={__("Secondary text color", "kotlinskidev")}
        value={attributes.secondaryTextColor ?? ""}
        onChange={(value) => setAttributes({ secondaryTextColor: value })}
      />
      <SolidColorControl
        label={__("Accent color", "kotlinskidev")}
        value={attributes.accentColor ?? ""}
        onChange={(value) => setAttributes({ accentColor: value })}
      />
      <p className="components-base-control__help">
        {__(
          "Secondary text color applies to the issuer and issued-date text. Accent color applies to the verify link (and the date pill in the Feature cards layout). Leave empty to keep the theme's default.",
          "kotlinskidev"
        )}
      </p>
    </PanelBody>
  );
}

export default function CertificateEdit({ attributes, setAttributes }: CertificateEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <CertificateSelectionPanel attributes={attributes} setAttributes={setAttributes} />
        <CardColorsPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/certificate" attributes={attributes} />
    </div>
  );
}

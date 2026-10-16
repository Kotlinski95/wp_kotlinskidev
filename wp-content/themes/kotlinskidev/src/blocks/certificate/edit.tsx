import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import {
  InspectorControls,
  useBlockProps,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, ComboboxControl, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

interface CertificateRecord {
  id: number;
  title: { rendered: string };
}

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

export default function CertificateEdit(props: CertificateEditProps) {
  const { attributes, setAttributes } = props;
  const certificateId = attributes.certificateId ?? 0;
  const layout = attributes.layout ?? "badge-grid";
  const secondaryTextColor = attributes.secondaryTextColor ?? "";
  const accentColor = attributes.accentColor ?? "";

  const certificates = useSelect<CertificateRecord[]>(
    (select) =>
      (
        select("core") as {
          getEntityRecords: (
            kind: string,
            type: string,
            query: Record<string, unknown>
          ) => CertificateRecord[] | null;
        }
      ).getEntityRecords("postType", "kt_certificate", {
        per_page: -1,
        status: "publish",
        orderby: "title",
        order: "asc",
        _fields: ["id", "title"],
      }) ?? [],
    []
  );

  const options = certificates.map((certificate) => ({
    value: String(certificate.id),
    label: certificate.title.rendered || __("(no title)", "kotlinskidev"),
  }));

  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
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
            onChange={(value) =>
              setAttributes({ layout: value as CertificateAttributes["layout"] })
            }
          />
        </PanelBody>
        <PanelBody title={__("Card Colors", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Secondary text color", "kotlinskidev")}
            colorValue={secondaryTextColor || undefined}
            onColorChange={(value: string | undefined) =>
              setAttributes({ secondaryTextColor: value || "" })
            }
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Accent color", "kotlinskidev")}
            colorValue={accentColor || undefined}
            onColorChange={(value: string | undefined) =>
              setAttributes({ accentColor: value || "" })
            }
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <p className="components-base-control__help">
            {__(
              "Secondary text color applies to the issuer and issued-date text. Accent color applies to the verify link (and the date pill in the Feature cards layout). Leave empty to keep the theme's default.",
              "kotlinskidev"
            )}
          </p>
        </PanelBody>
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/certificate" attributes={attributes} />
    </div>
  );
}

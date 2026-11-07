import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import "./style.scss";

type CityLocalSection = "intro" | "faq" | "nearby";

interface CityLocalContentAttributes {
  section: CityLocalSection;
}

interface CityLocalContentEditProps {
  attributes: CityLocalContentAttributes;
  setAttributes: (attrs: Partial<CityLocalContentAttributes>) => void;
}

export function sectionLabel(section: CityLocalSection): string {
  switch (section) {
    case "faq":
      return __("Local FAQ", "kotlinskidev");
    case "nearby":
      return __("Nearby cities", "kotlinskidev");
    default:
      return __("Local intro, audience and distance", "kotlinskidev");
  }
}

function CityLocalContentEdit({ attributes, setAttributes }: CityLocalContentEditProps) {
  const blockProps = useBlockProps({ className: "kt-city-local-placeholder" });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("City Local Content", "kotlinskidev")} initialOpen={true}>
          <SelectControl
            label={__("Section", "kotlinskidev")}
            value={attributes.section}
            options={[
              { value: "intro", label: sectionLabel("intro") },
              { value: "faq", label: sectionLabel("faq") },
              { value: "nearby", label: sectionLabel("nearby") },
            ]}
            onChange={(value) => setAttributes({ section: value as CityLocalSection })}
            __nextHasNoMarginBottom
          />
        </PanelBody>
      </InspectorControls>
      <p>
        {sectionLabel(attributes.section)}
        {" — "}
        {__("filled per city in the City Details sidebar; hidden when empty.", "kotlinskidev")}
      </p>
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<CityLocalContentAttributes>, {
  edit: CityLocalContentEdit,
  save: Save,
});

import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import {
  PanelBody,
  RangeControl,
  __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { ColorAttributeFields, type ColorAttributeField } from "../shared/color-attribute-fields";

const DIMENSION_UNITS = [
  { value: "rem", label: "rem", default: 0 },
  { value: "px", label: "px", default: 0 },
  { value: "em", label: "em", default: 0 },
];

interface CityGridAttributes {
  columnsDesktop: number;
  columnsTablet: number;
  columnsMobile: number;
  gridGap: string;
  linkTextColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  cardBorderWidth: string;
  cardBorderRadius: string;
  cardPadding: string;
}

interface CityGridEditProps {
  attributes: CityGridAttributes;
  setAttributes: (attrs: Partial<CityGridAttributes>) => void;
}

function cardColorFields(): ColorAttributeField<CityGridAttributes>[] {
  return [
    { field: "linkTextColor", label: __("Link text color", "kotlinskidev") },
    { field: "cardBackgroundColor", label: __("Card background color", "kotlinskidev") },
    { field: "cardBorderColor", label: __("Card border color", "kotlinskidev") },
  ];
}

function ColumnRangeControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value?: number) => void;
}) {
  return <RangeControl label={label} value={value} min={1} max={6} onChange={onChange} />;
}

function CityGridLayoutPanel({ attributes, setAttributes }: CityGridEditProps) {
  return (
    <PanelBody title={__("City Grid Layout", "kotlinskidev")} initialOpen={true}>
      <ColumnRangeControl
        label={__("Columns (desktop)", "kotlinskidev")}
        value={attributes.columnsDesktop}
        onChange={(value) => setAttributes({ columnsDesktop: value ?? 3 })}
      />
      <ColumnRangeControl
        label={__("Columns (tablet)", "kotlinskidev")}
        value={attributes.columnsTablet}
        onChange={(value) => setAttributes({ columnsTablet: value ?? 2 })}
      />
      <ColumnRangeControl
        label={__("Columns (mobile)", "kotlinskidev")}
        value={attributes.columnsMobile}
        onChange={(value) => setAttributes({ columnsMobile: value ?? 1 })}
      />
      <UnitControl
        label={__("Gap between cards", "kotlinskidev")}
        value={attributes.gridGap}
        units={DIMENSION_UNITS}
        onChange={(value?: string) => setAttributes({ gridGap: value || "0.9375rem" })}
      />
    </PanelBody>
  );
}

function CityCardStylePanel({ attributes, setAttributes }: CityGridEditProps) {
  return (
    <PanelBody title={__("City Card Style", "kotlinskidev")} initialOpen={false}>
      <ColorAttributeFields
        fields={cardColorFields()}
        attributes={attributes}
        setAttributes={setAttributes}
      />
      <UnitControl
        label={__("Card border width", "kotlinskidev")}
        value={attributes.cardBorderWidth}
        units={DIMENSION_UNITS}
        onChange={(value?: string) => setAttributes({ cardBorderWidth: value || "0.125rem" })}
      />
      <UnitControl
        label={__("Card border radius", "kotlinskidev")}
        value={attributes.cardBorderRadius}
        units={DIMENSION_UNITS}
        onChange={(value?: string) => setAttributes({ cardBorderRadius: value || "1.125rem" })}
      />
      <UnitControl
        label={__("Card padding", "kotlinskidev")}
        value={attributes.cardPadding}
        units={DIMENSION_UNITS}
        onChange={(value?: string) => setAttributes({ cardPadding: value || "1.25rem" })}
      />
    </PanelBody>
  );
}

function CityGridEdit({ attributes, setAttributes }: CityGridEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <CityGridLayoutPanel attributes={attributes} setAttributes={setAttributes} />
        <CityCardStylePanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/city-grid" attributes={attributes} />
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<CityGridAttributes>, {
  edit: CityGridEdit,
  save: Save,
});

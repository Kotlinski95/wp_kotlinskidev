import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import {
  InspectorControls,
  useBlockProps,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import {
  PanelBody,
  RangeControl,
  __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";

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

function CityGridEdit({ attributes, setAttributes }: CityGridEditProps) {
  const {
    columnsDesktop,
    columnsTablet,
    columnsMobile,
    gridGap,
    linkTextColor,
    cardBackgroundColor,
    cardBorderColor,
    cardBorderWidth,
    cardBorderRadius,
    cardPadding,
  } = attributes;
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("City Grid Layout", "kotlinskidev")} initialOpen={true}>
          <RangeControl
            label={__("Columns (desktop)", "kotlinskidev")}
            value={columnsDesktop}
            min={1}
            max={6}
            onChange={(value) => setAttributes({ columnsDesktop: value ?? 3 })}
          />
          <RangeControl
            label={__("Columns (tablet)", "kotlinskidev")}
            value={columnsTablet}
            min={1}
            max={6}
            onChange={(value) => setAttributes({ columnsTablet: value ?? 2 })}
          />
          <RangeControl
            label={__("Columns (mobile)", "kotlinskidev")}
            value={columnsMobile}
            min={1}
            max={6}
            onChange={(value) => setAttributes({ columnsMobile: value ?? 1 })}
          />
          <UnitControl
            label={__("Gap between cards", "kotlinskidev")}
            value={gridGap}
            units={DIMENSION_UNITS}
            onChange={(value?: string) => setAttributes({ gridGap: value || "0.9375rem" })}
          />
        </PanelBody>
        <PanelBody title={__("City Card Style", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Link text color", "kotlinskidev")}
            colorValue={linkTextColor || undefined}
            onColorChange={(value?: string) => setAttributes({ linkTextColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Card background color", "kotlinskidev")}
            colorValue={cardBackgroundColor || undefined}
            onColorChange={(value?: string) => setAttributes({ cardBackgroundColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Card border color", "kotlinskidev")}
            colorValue={cardBorderColor || undefined}
            onColorChange={(value?: string) => setAttributes({ cardBorderColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <UnitControl
            label={__("Card border width", "kotlinskidev")}
            value={cardBorderWidth}
            units={DIMENSION_UNITS}
            onChange={(value?: string) => setAttributes({ cardBorderWidth: value || "0.125rem" })}
          />
          <UnitControl
            label={__("Card border radius", "kotlinskidev")}
            value={cardBorderRadius}
            units={DIMENSION_UNITS}
            onChange={(value?: string) => setAttributes({ cardBorderRadius: value || "1.125rem" })}
          />
          <UnitControl
            label={__("Card padding", "kotlinskidev")}
            value={cardPadding}
            units={DIMENSION_UNITS}
            onChange={(value?: string) => setAttributes({ cardPadding: value || "1.25rem" })}
          />
        </PanelBody>
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

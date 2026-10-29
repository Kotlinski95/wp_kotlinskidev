import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import {
  InspectorControls,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const CITY_GRID_BLOCK = "kotlinskidev/city-grid";

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addCityGridAttributes = (settings: BlockSettings): BlockSettings => {
  if (settings.name !== CITY_GRID_BLOCK) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      columnsDesktop: { type: "number", default: 3 },
      columnsTablet: { type: "number", default: 2 },
      columnsMobile: { type: "number", default: 1 },
      linkTextColor: { type: "string", default: "" },
    },
  };
};

interface CityGridAttributes {
  columnsDesktop?: number;
  columnsTablet?: number;
  columnsMobile?: number;
  linkTextColor?: string;
}

interface BlockEditProps {
  name?: string;
  attributes: CityGridAttributes;
  setAttributes: (attrs: Partial<CityGridAttributes>) => void;
}

const withCityGridControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (props.name !== CITY_GRID_BLOCK) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const columnsDesktop = attributes.columnsDesktop ?? 3;
    const columnsTablet = attributes.columnsTablet ?? 2;
    const columnsMobile = attributes.columnsMobile ?? 1;
    const linkTextColor = attributes.linkTextColor ?? "";

    return (
      <Fragment>
        <BlockEdit {...props} />
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
          </PanelBody>
          <PanelBody title={__("City Link Color", "kotlinskidev")} initialOpen={false}>
            <ColorGradientControl
              label={__("Link text color", "kotlinskidev")}
              colorValue={linkTextColor || undefined}
              onColorChange={(value?: string) => setAttributes({ linkTextColor: value || "" })}
              enableAlpha={true}
              clearable={true}
              __experimentalIsRenderedInSidebar={true}
              __nextHasNoMarginBottom
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withCityGridControls");

addFilter("blocks.registerBlockType", "kotlinskidev/city-grid-attributes", addCityGridAttributes);
addFilter("editor.BlockEdit", "kotlinskidev/city-grid-controls", withCityGridControls);

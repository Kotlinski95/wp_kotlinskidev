import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, __experimentalNumberControl as NumberControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import type { BlockSettings } from "@utils/block-filter-types";

const RESPONSIVE_GRID_COLUMNS_BLOCKS = ["core/group"];
const MIN_COLUMNS = 1;
const MAX_COLUMNS = 12;

interface GridColumnsAttribute {
  desktop?: number;
  tablet?: number;
  mobile?: number;
}

type GridColumnsDevice = keyof GridColumnsAttribute;

const DEFAULT_GRID_COLUMNS: GridColumnsAttribute = {};

const supportsResponsiveGridColumns = (name?: string): boolean =>
  Boolean(name && RESPONSIVE_GRID_COLUMNS_BLOCKS.includes(name));

const addResponsiveGridColumnsAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsResponsiveGridColumns(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevGridColumns: { type: "object", default: DEFAULT_GRID_COLUMNS },
    },
  };
};

interface LayoutAttribute {
  type?: string;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    layout?: LayoutAttribute;
    kotlinskidevGridColumns?: GridColumnsAttribute;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const GridColumnField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: string | undefined) => void;
}) => (
  <NumberControl
    label={label}
    value={value ?? ""}
    min={MIN_COLUMNS}
    max={MAX_COLUMNS}
    onChange={onChange}
  />
);

const parseColumnCount = (value: string | undefined): number | undefined => {
  const parsed = value === undefined || value === "" ? undefined : Number(value);
  if (parsed === undefined || Number.isNaN(parsed)) {
    return undefined;
  }
  return Math.min(MAX_COLUMNS, Math.max(MIN_COLUMNS, Math.round(parsed)));
};

const GridColumnFields = ({
  gridColumns,
  onChangeDevice,
}: {
  gridColumns: GridColumnsAttribute;
  onChangeDevice: (device: GridColumnsDevice, value: string | undefined) => void;
}) => (
  <>
    <GridColumnField
      label={__("Desktop columns", "kotlinskidev")}
      value={gridColumns.desktop}
      onChange={(value) => onChangeDevice("desktop", value)}
    />
    <GridColumnField
      label={__("Tablet columns", "kotlinskidev")}
      value={gridColumns.tablet}
      onChange={(value) => onChangeDevice("tablet", value)}
    />
    <GridColumnField
      label={__("Mobile columns", "kotlinskidev")}
      value={gridColumns.mobile}
      onChange={(value) => onChangeDevice("mobile", value)}
    />
  </>
);

const GridColumnsPanel = ({
  gridColumns,
  setAttributes,
}: {
  gridColumns: GridColumnsAttribute;
  setAttributes: BlockEditProps["setAttributes"];
}) => {
  const updateDevice = (device: GridColumnsDevice, value: string | undefined) => {
    const columnCount = parseColumnCount(value);
    const next = { ...gridColumns };
    if (columnCount === undefined) {
      delete next[device];
    } else {
      next[device] = columnCount;
    }
    setAttributes({ kotlinskidevGridColumns: next });
  };

  return (
    <InspectorControls>
      <PanelBody title={__("Responsive Grid Columns", "kotlinskidev")} initialOpen={false}>
        <GridColumnFields gridColumns={gridColumns} onChangeDevice={updateDevice} />
        <p className="components-base-control__help">
          {__(
            "Leave a field empty to inherit from the next larger breakpoint (Mobile falls back to Tablet, Tablet falls back to Desktop). Leave all three empty to use this block's own Min. column width wrapping instead.",
            "kotlinskidev"
          )}
        </p>
      </PanelBody>
    </InspectorControls>
  );
};

const withResponsiveGridColumnsControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsResponsiveGridColumns(props.name) || props.attributes.layout?.type !== "grid") {
      return <BlockEdit {...props} />;
    }

    const gridColumns = props.attributes.kotlinskidevGridColumns || DEFAULT_GRID_COLUMNS;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <GridColumnsPanel gridColumns={gridColumns} setAttributes={props.setAttributes} />
      </Fragment>
    );
  };
}, "withResponsiveGridColumnsControls");

const buildResponsiveGridColumnsStyle = (
  gridColumns: GridColumnsAttribute | undefined
): Record<string, string> => {
  const style: Record<string, string> = {};

  if (!gridColumns) {
    return style;
  }

  (["desktop", "tablet", "mobile"] as GridColumnsDevice[]).forEach((device) => {
    const value = gridColumns[device];
    if (typeof value === "number" && Number.isInteger(value)) {
      style[`--kt-grid-columns-${device}`] = String(value);
    }
  });

  return style;
};

interface BlockListBlockProps {
  attributes?: {
    layout?: LayoutAttribute;
    kotlinskidevGridColumns?: GridColumnsAttribute;
  };
  className?: string;
  wrapperProps?: Record<string, unknown>;
  [key: string]: unknown;
}

const withResponsiveGridColumnsPreview = createHigherOrderComponent((BlockListBlock) => {
  return (props: BlockListBlockProps) => {
    if (props.attributes?.layout?.type !== "grid") {
      return <BlockListBlock {...props} />;
    }

    const style = buildResponsiveGridColumnsStyle(props.attributes?.kotlinskidevGridColumns);

    if (Object.keys(style).length === 0) {
      return <BlockListBlock {...props} />;
    }

    return (
      <BlockListBlock
        {...props}
        className={`${props.className || ""} kt-has-responsive-grid-columns`.trim()}
        wrapperProps={{
          ...props.wrapperProps,
          style: { ...((props.wrapperProps?.style as Record<string, string>) || {}), ...style },
        }}
      />
    );
  };
}, "withResponsiveGridColumnsPreview");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-grid-columns-attributes",
  addResponsiveGridColumnsAttributes
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-grid-columns-controls",
  withResponsiveGridColumnsControls
);

addFilter(
  "editor.BlockListBlock",
  "kotlinskidev/responsive-grid-columns-preview",
  withResponsiveGridColumnsPreview
);

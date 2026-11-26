import { __ } from "@wordpress/i18n";

export const FLEX_FAMILY_DISPLAYS = ["flex", "inline-flex"];

export const FLEX_OR_GRID_FAMILY_DISPLAYS = ["flex", "inline-flex", "grid", "inline-grid"];

export const displayOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Block", "kotlinskidev"), value: "block" },
  { label: __("Inline", "kotlinskidev"), value: "inline" },
  { label: __("Inline Block", "kotlinskidev"), value: "inline-block" },
  { label: __("Flex", "kotlinskidev"), value: "flex" },
  { label: __("Inline Flex", "kotlinskidev"), value: "inline-flex" },
  { label: __("Grid", "kotlinskidev"), value: "grid" },
  { label: __("Inline Grid", "kotlinskidev"), value: "inline-grid" },
  { label: __("Flow Root", "kotlinskidev"), value: "flow-root" },
  { label: __("Contents", "kotlinskidev"), value: "contents" },
  { label: __("Table", "kotlinskidev"), value: "table" },
  { label: __("Table Row", "kotlinskidev"), value: "table-row" },
  { label: __("Table Cell", "kotlinskidev"), value: "table-cell" },
  { label: __("List Item", "kotlinskidev"), value: "list-item" },
  { label: __("None (hidden)", "kotlinskidev"), value: "none" },
];

export const flexDirectionOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Row", "kotlinskidev"), value: "flex-row" },
  { label: __("Column", "kotlinskidev"), value: "flex-column" },
];

export const justifyContentOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "justify-content-center" },
  { label: __("Start", "kotlinskidev"), value: "justify-content-start" },
  { label: __("End", "kotlinskidev"), value: "justify-content-end" },
  { label: __("Space Between", "kotlinskidev"), value: "justify-content-space-between" },
  { label: __("Space Around", "kotlinskidev"), value: "justify-content-space-around" },
  { label: __("Space Evenly", "kotlinskidev"), value: "justify-content-space-evenly" },
];

export const alignItemsOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "align-items-center" },
  { label: __("Start", "kotlinskidev"), value: "align-items-start" },
  { label: __("End", "kotlinskidev"), value: "align-items-end" },
];

export const justifySelfOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "justify-self-center" },
  { label: __("Start", "kotlinskidev"), value: "justify-self-start" },
  { label: __("End", "kotlinskidev"), value: "justify-self-end" },
  { label: __("Stretch", "kotlinskidev"), value: "justify-self-stretch" },
  { label: __("Baseline", "kotlinskidev"), value: "justify-self-baseline" },
];

export const alignSelfOptions = [
  { label: __("Default", "kotlinskidev"), value: "" },
  { label: __("Center", "kotlinskidev"), value: "align-self-center" },
  { label: __("Start", "kotlinskidev"), value: "align-self-start" },
  { label: __("End", "kotlinskidev"), value: "align-self-end" },
  { label: __("Stretch", "kotlinskidev"), value: "align-self-stretch" },
];

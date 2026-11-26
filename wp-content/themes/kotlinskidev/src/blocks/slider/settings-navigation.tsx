import React from "react";
import { PanelRow, SelectControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { SliderAttributes, SliderSettingsProps } from "./slider-attributes";

const PaginationStyleSetting = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <PanelRow>
    <SelectControl
      label={__("Pagination style", "kotlinskidev")}
      value={attributes.paginationStyle ?? "dots"}
      options={[
        { label: __("Dots", "kotlinskidev"), value: "dots" },
        { label: __("Pill", "kotlinskidev"), value: "pill" },
      ]}
      onChange={(value) =>
        setAttributes({ paginationStyle: value as SliderAttributes["paginationStyle"] })
      }
      __nextHasNoMarginBottom
    />
  </PanelRow>
);

export const NavigationSettings = ({ attributes, setAttributes }: SliderSettingsProps) => (
  <>
    <PanelRow>
      <ToggleControl
        label={__("Navigation", "kotlinskidev")}
        checked={attributes.navigation}
        onChange={(value) => setAttributes({ navigation: value })}
        help={__(
          "“Navigation” will display arrows so user can navigate forward/backward.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
    <PanelRow>
      <ToggleControl
        label={__("Pagination", "kotlinskidev")}
        checked={attributes.pagination}
        onChange={(value) => setAttributes({ pagination: value })}
        help={__(
          "“Pagination” will display dots along the bottom for user to click through slides.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
    {attributes.pagination && (
      <PaginationStyleSetting attributes={attributes} setAttributes={setAttributes} />
    )}
  </>
);

export const PaginationPlacementSetting = ({ attributes, setAttributes }: SliderSettingsProps) =>
  attributes.pagination ? (
    <PanelRow>
      <ToggleControl
        label={__("Show pagination outside carousel", "kotlinskidev")}
        checked={attributes.paginationPlacement === "outside"}
        onChange={(value) => setAttributes({ paginationPlacement: value ? "outside" : "inside" })}
        help={__(
          "Renders the pagination dots below the slides instead of overlaying them.",
          "kotlinskidev"
        )}
      />
    </PanelRow>
  ) : null;

import React from "react";
import {
  BlockControls,
  InnerBlocks,
  InspectorControls,
  useBlockProps,
} from "@wordpress/block-editor";
import {
  Notice,
  PanelBody,
  SelectControl,
  TextControl,
  ToolbarDropdownMenu,
  ToolbarGroup,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../../shared/nav-icon-picker";
import { ColorSettings } from "../color-settings";
import { IconSelect, SpeedDialIcon } from "../icon-select";
import type { SpeedDialAction, SpeedDialItemAttributes } from "../types";
import { labelContainsVisibleText } from "../validation";
import { ACTION_DEFAULTS, ACTION_ORDER } from "./action-defaults";
import { ActionFields } from "./action-fields";

export type { SpeedDialItemAttributes };

interface EditProps {
  attributes: SpeedDialItemAttributes;
  setAttributes: (attrs: Partial<SpeedDialItemAttributes>) => void;
}

const FALLBACK_ALLOWED_BLOCKS = ["core/html", "core/shortcode"];

const resolveAllowedBlocks = (): string[] =>
  window.kotlinskidevSpeedDial?.customAllowedBlocks ?? FALLBACK_ALLOWED_BLOCKS;

const COLOR_ROWS = [
  { attribute: "backgroundColor" as const, label: __("Item background", "kotlinskidev") },
  { attribute: "textColor" as const, label: __("Item icon", "kotlinskidev") },
];

const hasLabelMismatch = (attributes: SpeedDialItemAttributes): boolean => {
  const visible = attributes.label || ACTION_DEFAULTS[attributes.action].label;
  return (
    "" !== attributes.ariaLabel &&
    "" !== visible &&
    !labelContainsVisibleText(attributes.ariaLabel, visible)
  );
};

export default function Edit({ attributes, setAttributes }: Readonly<EditProps>) {
  const defaults = ACTION_DEFAULTS[attributes.action];
  const isCustom = "custom" === attributes.action;
  const iconSlug = attributes.icon || defaults.icon;
  const style = {
    ...(attributes.backgroundColor ? { background: attributes.backgroundColor } : {}),
    ...(attributes.textColor ? { color: attributes.textColor } : {}),
  };
  const blockProps = useBlockProps({ className: "kt-speed-dial__item", style });

  return (
    <>
      <BlockControls>
        <ToolbarGroup>
          <ToolbarDropdownMenu
            icon="admin-generic"
            label={__("Action", "kotlinskidev")}
            controls={ACTION_ORDER.map((action: SpeedDialAction) => ({
              title: ACTION_DEFAULTS[action].title,
              isActive: attributes.action === action,
              onClick: () => setAttributes({ action }),
            }))}
          />
        </ToolbarGroup>
      </BlockControls>
      <InspectorControls>
        <PanelBody title={__("Action", "kotlinskidev")}>
          <SelectControl
            __nextHasNoMarginBottom
            label={__("Action type", "kotlinskidev")}
            value={attributes.action}
            options={ACTION_ORDER.map((action) => ({
              label: ACTION_DEFAULTS[action].title,
              value: action,
            }))}
            onChange={(action: string) => setAttributes({ action: action as SpeedDialAction })}
          />
          <ActionFields attributes={attributes} setAttributes={setAttributes} />
        </PanelBody>
        {!isCustom && (
          <PanelBody title={__("Label and icon", "kotlinskidev")} initialOpen={false}>
            <TextControl
              __nextHasNoMarginBottom
              label={__("Label and tooltip", "kotlinskidev")}
              value={attributes.label}
              placeholder={defaults.label}
              onChange={(label: string) => setAttributes({ label })}
            />
            <TextControl
              __nextHasNoMarginBottom
              label={__("Accessible name (aria-label)", "kotlinskidev")}
              value={attributes.ariaLabel}
              onChange={(ariaLabel: string) => setAttributes({ ariaLabel })}
              help={__(
                "Leave empty unless needed. If you set one, it must contain the visible label.",
                "kotlinskidev"
              )}
            />
            {hasLabelMismatch(attributes) && (
              <Notice status="warning" isDismissible={false}>
                {__(
                  "The accessible name does not contain the visible label. Speech-control users may not be able to activate this item by its visible name (WCAG 2.5.3).",
                  "kotlinskidev"
                )}
              </Notice>
            )}
            <IconSelect
              value={attributes.icon}
              allowDefault
              onChange={(icon: string) => setAttributes({ icon })}
            />
            <NavIconPicker
              iconId={attributes.iconId}
              iconUrl={attributes.iconUrl}
              onChange={(iconId, iconUrl) => setAttributes({ iconId, iconUrl })}
            />
          </PanelBody>
        )}
      </InspectorControls>
      <ColorSettings
        rows={COLOR_ROWS}
        values={{
          backgroundColor: attributes.backgroundColor,
          textColor: attributes.textColor,
        }}
        onChange={(next) => setAttributes(next)}
      />
      <div {...blockProps}>
        {isCustom ? (
          <InnerBlocks allowedBlocks={resolveAllowedBlocks()} />
        ) : (
          <>
            {attributes.iconUrl ? (
              <img src={attributes.iconUrl} alt="" width={24} height={24} />
            ) : (
              <SpeedDialIcon slug={iconSlug} />
            )}
            <span className="kt-speed-dial__label">{attributes.label || defaults.label}</span>
          </>
        )}
      </div>
    </>
  );
}

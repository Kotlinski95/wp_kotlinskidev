import React from "react";
import {
  ButtonBlockAppender,
  InspectorControls,
  useBlockProps,
  useInnerBlocksProps,
} from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import {
  __experimentalNumberControl as NumberControl,
  Notice,
  PanelBody,
  RangeControl,
  SelectControl,
  TextControl,
  ToggleControl,
} from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../shared/nav-icon-picker";
import { ColorSettings } from "./color-settings";
import { IconSelect } from "./icon-select";
import {
  MAX_Z_INDEX,
  SPEED_DIAL_ITEM_BLOCK,
  type Corner,
  type Device,
  type SpeedDialAttributes,
} from "./types";

export type { SpeedDialAttributes };

interface EditProps {
  attributes: SpeedDialAttributes;
  setAttributes: (attrs: Partial<SpeedDialAttributes>) => void;
  clientId: string;
}

interface InnerBlockSummary {
  attributes?: { action?: string };
}

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: InnerBlockSummary[] } | undefined;
}

const ALLOWED_BLOCKS = [SPEED_DIAL_ITEM_BLOCK];

const TEMPLATE: [string, { action: string }][] = [
  [SPEED_DIAL_ITEM_BLOCK, { action: "phone" }],
  [SPEED_DIAL_ITEM_BLOCK, { action: "email" }],
  [SPEED_DIAL_ITEM_BLOCK, { action: "accessibility" }],
];

const DEVICES: Device[] = ["desktop", "tablet", "mobile"];

const DEVICE_LABELS: Record<Device, string> = {
  desktop: __("Desktop", "kotlinskidev"),
  tablet: __("Tablet", "kotlinskidev"),
  mobile: __("Mobile", "kotlinskidev"),
};

const CORNER_OPTIONS: { label: string; value: Corner }[] = [
  { label: __("Bottom right", "kotlinskidev"), value: "bottom-right" },
  { label: __("Bottom left", "kotlinskidev"), value: "bottom-left" },
  { label: __("Top right", "kotlinskidev"), value: "top-right" },
  { label: __("Top left", "kotlinskidev"), value: "top-left" },
];

const DIRECTION_OPTIONS = [
  { label: __("Automatic", "kotlinskidev"), value: "auto" },
  { label: __("Up", "kotlinskidev"), value: "up" },
  { label: __("Down", "kotlinskidev"), value: "down" },
  { label: __("Left", "kotlinskidev"), value: "left" },
  { label: __("Right", "kotlinskidev"), value: "right" },
];

const LABEL_OPTIONS = [
  { label: __("Automatic (tooltip on hover, visible on touch)", "kotlinskidev"), value: "auto" },
  { label: __("Tooltip only", "kotlinskidev"), value: "tooltip" },
  { label: __("Always visible", "kotlinskidev"), value: "always" },
  { label: __("Hidden", "kotlinskidev"), value: "hidden" },
];

const MOTION_OPTIONS = [
  { label: __("Scale", "kotlinskidev"), value: "scale" },
  { label: __("Fade", "kotlinskidev"), value: "fade" },
  { label: __("None", "kotlinskidev"), value: "none" },
];

const COLOR_ROWS = [
  { attribute: "toggleBackgroundColor" as const, label: __("Toggle background", "kotlinskidev") },
  { attribute: "toggleTextColor" as const, label: __("Toggle icon", "kotlinskidev") },
  { attribute: "itemBackgroundColor" as const, label: __("Items background", "kotlinskidev") },
  { attribute: "itemTextColor" as const, label: __("Items icon", "kotlinskidev") },
];

const clampZIndex = (value: number): number =>
  Math.min(MAX_Z_INDEX, Math.max(1, Number.isFinite(value) ? Math.round(value) : 1));

const hasAccessibilityItem = (items: InnerBlockSummary[]): boolean =>
  items.some(
    ({ attributes }) => "accessibility" === attributes?.action || "trigger" === attributes?.action
  );

export default function Edit({ attributes, setAttributes, clientId }: Readonly<EditProps>) {
  const items = useSelect(
    (select) =>
      (select("core/block-editor") as unknown as BlockEditorSelectors).getBlock(clientId)
        ?.innerBlocks ?? [],
    [clientId]
  );
  const blockProps = useBlockProps({ className: "kt-speed-dial" });
  const innerBlocksProps = useInnerBlocksProps(blockProps, {
    allowedBlocks: ALLOWED_BLOCKS,
    template: TEMPLATE,
    orientation: "vertical",
    renderAppender: ButtonBlockAppender,
  });

  const updatePosition = (device: Device, corner: Corner) =>
    setAttributes({ position: { ...attributes.position, [device]: corner } });

  const updateOffset = (device: Device, axis: "x" | "y", value: number | undefined) =>
    setAttributes({
      offset: {
        ...attributes.offset,
        [device]: { ...attributes.offset[device], [axis]: value ?? 0 },
      },
    });

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Layout", "kotlinskidev")}>
          {DEVICES.map((device) => (
            <div key={device}>
              <p>
                <strong>{DEVICE_LABELS[device]}</strong>
              </p>
              <SelectControl
                __nextHasNoMarginBottom
                label={__("Position", "kotlinskidev")}
                value={attributes.position[device]}
                options={CORNER_OPTIONS}
                onChange={(corner: string) => updatePosition(device, corner as Corner)}
              />
              <RangeControl
                __nextHasNoMarginBottom
                label={__("Horizontal offset (rem)", "kotlinskidev")}
                value={attributes.offset[device].x}
                min={0}
                max={10}
                step={0.25}
                onChange={(value?: number) => updateOffset(device, "x", value)}
              />
              <RangeControl
                __nextHasNoMarginBottom
                label={__("Vertical offset (rem)", "kotlinskidev")}
                value={attributes.offset[device].y}
                min={0}
                max={10}
                step={0.25}
                onChange={(value?: number) => updateOffset(device, "y", value)}
              />
            </div>
          ))}
        </PanelBody>
        <PanelBody title={__("Behaviour", "kotlinskidev")} initialOpen={false}>
          <SelectControl
            __nextHasNoMarginBottom
            label={__("Open direction", "kotlinskidev")}
            value={attributes.direction}
            options={DIRECTION_OPTIONS}
            onChange={(direction: string) =>
              setAttributes({ direction: direction as SpeedDialAttributes["direction"] })
            }
          />
          <SelectControl
            __nextHasNoMarginBottom
            label={__("Label visibility", "kotlinskidev")}
            value={attributes.labels}
            options={LABEL_OPTIONS}
            onChange={(labels: string) =>
              setAttributes({ labels: labels as SpeedDialAttributes["labels"] })
            }
          />
          <SelectControl
            __nextHasNoMarginBottom
            label={__("Motion", "kotlinskidev")}
            value={attributes.motion}
            options={MOTION_OPTIONS}
            onChange={(motion: string) =>
              setAttributes({ motion: motion as SpeedDialAttributes["motion"] })
            }
          />
          <ToggleControl
            __nextHasNoMarginBottom
            label={__("Close after an action is chosen", "kotlinskidev")}
            checked={attributes.closeOnAction}
            onChange={(closeOnAction: boolean) => setAttributes({ closeOnAction })}
          />
          <ToggleControl
            __nextHasNoMarginBottom
            label={__("Stay above the mobile footer menu", "kotlinskidev")}
            checked={attributes.avoidMobileNav}
            onChange={(avoidMobileNav: boolean) => setAttributes({ avoidMobileNav })}
          />
          <NumberControl
            label={__("Z-index", "kotlinskidev")}
            value={attributes.zIndex}
            min={1}
            max={MAX_Z_INDEX}
            onChange={(value?: string) => setAttributes({ zIndex: clampZIndex(Number(value)) })}
          />
        </PanelBody>
        <PanelBody title={__("Toggle button", "kotlinskidev")} initialOpen={false}>
          <TextControl
            __nextHasNoMarginBottom
            label={__("Toggle label", "kotlinskidev")}
            value={attributes.label}
            placeholder={__("Quick actions", "kotlinskidev")}
            onChange={(label: string) => setAttributes({ label })}
          />
          <IconSelect
            value={attributes.toggleIcon}
            allowDefault={false}
            onChange={(toggleIcon: string) => setAttributes({ toggleIcon })}
          />
          <NavIconPicker
            iconId={attributes.toggleIconId}
            iconUrl={attributes.toggleIconUrl}
            onChange={(toggleIconId, toggleIconUrl) =>
              setAttributes({ toggleIconId, toggleIconUrl })
            }
          />
        </PanelBody>
        {hasAccessibilityItem(items) && (
          <PanelBody title={__("Accessibility plugin", "kotlinskidev")} initialOpen={false}>
            <Notice status="info" isDismissible={false}>
              {__(
                "This speed dial has an accessibility item. Set the accessibility plugin launcher mode to hidden so there is only one floating button. The Alt+Shift+A shortcut keeps working.",
                "kotlinskidev"
              )}
            </Notice>
          </PanelBody>
        )}
      </InspectorControls>
      <ColorSettings
        rows={COLOR_ROWS}
        values={{
          toggleBackgroundColor: attributes.toggleBackgroundColor,
          toggleTextColor: attributes.toggleTextColor,
          itemBackgroundColor: attributes.itemBackgroundColor,
          itemTextColor: attributes.itemTextColor,
        }}
        onChange={(next) => setAttributes(next)}
      />
      <div {...innerBlocksProps} />
    </>
  );
}

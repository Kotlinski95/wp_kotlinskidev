import { addFilter } from "@wordpress/hooks";
import { InspectorControls } from "@wordpress/block-editor";
import {
  PanelBody,
  RangeControl,
  __experimentalUnitControl as UnitControl,
  Button,
} from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import * as React from "react";
import './style.scss';

const spacingPresets = [
  { label: "None", value: "0px" },
  { label: "2x Small", value: "0.125rem" },
  { label: "X Small", value: "0.25rem" },
  { label: "Small", value: "0.5rem" },
  { label: "Medium", value: "1rem" },
  { label: "Large", value: "2rem" },
  { label: "X Large", value: "4rem" },
  { label: "2x Large", value: "8rem" },
];
const presetValues = spacingPresets.map((p) => p.value);

type Side = "top" | "right" | "bottom" | "left";
type SideValues = Record<Side, string>;

function MobileSpacingControl({
  label,
  value,
  onChange,
  enabled,
  onToggleEnabled
}: {
  label: string;
  value?: Partial<SideValues>;
  onChange: (v: SideValues) => void;
  enabled: boolean;
  onToggleEnabled: (v: boolean) => void;
}) {
  const [isLinked, setIsLinked] = React.useState(true);
  const [sideValues, setSideValues] = React.useState<SideValues>({
    top: value?.top || "0px",
    right: value?.right || "0px",
    bottom: value?.bottom || "0px",
    left: value?.left || "0px",
  });

  React.useEffect(() => {
    onChange(sideValues);
    // eslint-disable-next-line
  }, [sideValues]);

  // Handler for top-bottom
  const handleTBChange = (i?: number) => {
    if (typeof i === "number" && presetValues[i] !== undefined) {
      const v = presetValues[i];
      setSideValues((prev) => ({ ...prev, top: v, bottom: v }));
    }
  };
  // Handler for left-right
  const handleLRChange = (i?: number) => {
    if (typeof i === "number" && presetValues[i] !== undefined) {
      const v = presetValues[i];
      setSideValues((prev) => ({ ...prev, left: v, right: v }));
    }
  };
  // Handler for custom (unlinked) values
  const handleCustomChange = (side: Side, v: string) => {
    setSideValues((prev) => ({ ...prev, [side]: v }));
  };

  return (
    <div style={{ gridColumn: "1 / -1", marginBottom: 12 }}>
      <div style={{ fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ marginBottom: 8 }}>
        <input
          type="checkbox"
          id={`enable-${label.replace(/\s+/g, '').toLowerCase()}`}
          checked={enabled}
          onChange={e => onToggleEnabled(e.target.checked)}
        />
        <label htmlFor={`enable-${label.replace(/\s+/g, '').toLowerCase()}`} style={{ marginLeft: 6, fontSize: 13 }}>
          Enable mobile {label.toLowerCase()}
        </label>
      </div>
      <div style={{ display: enabled ? "grid" : "none", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ gridColumn: "1 / -1", marginBottom: 3 }} >
          <span style={{ fontSize: 12 }}>Top/Bottom</span>
          <RangeControl
            min={0}
            max={presetValues.length - 1}
            step={1}
            value={presetValues.indexOf(sideValues.top)}
            marks={[{ value: presetValues.indexOf(sideValues.top), label: spacingPresets[presetValues.indexOf(sideValues.top)]?.label || '' }]}
            onChange={handleTBChange}
          />
        </div>
        <div style={{ gridColumn: "1 / -1", marginBottom: 3 }}>
          <span style={{ fontSize: 12 }}>Left/Right</span>
          <RangeControl
            min={0}
            max={presetValues.length - 1}
            step={1}
            value={presetValues.indexOf(sideValues.left)}
            marks={[{ value: presetValues.indexOf(sideValues.left), label: spacingPresets[presetValues.indexOf(sideValues.left)]?.label || '' }]}
            onChange={handleLRChange}
          />
        </div>
        <UnitControl
          label="Top (Custom)"
          value={sideValues.top}
          onChange={(v) => handleCustomChange("top", v ?? "0px")}
          units={[
            { value: "px", label: "px" },
            { value: "em", label: "em" },
            { value: "rem", label: "rem" },
          ]}
        />
        <UnitControl
          label="Bottom (Custom)"
          value={sideValues.bottom}
          onChange={(v) => handleCustomChange("bottom", v ?? "0px")}
          units={[
            { value: "px", label: "px" },
            { value: "em", label: "em" },
            { value: "rem", label: "rem" },
          ]}
        />
        <UnitControl
          label="Left (Custom)"
          value={sideValues.left}
          onChange={(v) => handleCustomChange("left", v ?? "0px")}
          units={[
            { value: "px", label: "px" },
            { value: "em", label: "em" },
            { value: "rem", label: "rem" },
          ]}
        />
        <UnitControl
          label="Right (Custom)"
          value={sideValues.right}
          onChange={(v) => handleCustomChange("right", v ?? "0px")}
          units={[
            { value: "px", label: "px" },
            { value: "em", label: "em" },
            { value: "rem", label: "rem" },
          ]}
        />
      </div>
    </div>
  );
}

function addMobileSpacingControls(BlockEdit: any) {
  return (props: any) => {
    if (!props.isSelected) return <BlockEdit {...props} />;
    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls group="dimensions">
          <PanelBody title="Mobile Spacing" initialOpen={false}>
            <div style={{ gridColumn: "1 / -1" }}>
              <MobileSpacingControl
                label="Mobile Padding"
                value={props.attributes.mobilePadding}
                onChange={(v) => props.setAttributes({ mobilePadding: v })}
                enabled={props.attributes.mobilePaddingEnabled}
                onToggleEnabled={(v) => props.setAttributes({ mobilePaddingEnabled: v })}
              />
              <MobileSpacingControl
                label="Mobile Margin"
                value={props.attributes.mobileMargin}
                onChange={(v) => props.setAttributes({ mobileMargin: v })}
                enabled={props.attributes.mobileMarginEnabled}
                onToggleEnabled={(v) => props.setAttributes({ mobileMarginEnabled: v })}
              />
            </div>
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}

addFilter(
  "editor.BlockEdit",
  "responsive-spacing-controls/add-mobile-spacing-controls",
  addMobileSpacingControls
);

addFilter(
  "blocks.getSaveContent.extraProps",
  "responsive-spacing-controls/add-mobile-spacing-classes",
  (extraProps: any, blockType: any, attributes: any) => {
    let classNames = extraProps.className || "";
    // Remove all existing mobile-pt-*, mobile-mg-*, mobile-pa-*, mobile-ma-* classes
    classNames = (classNames as string)
      .split(" ")
      .filter(
      (cls: string) =>
        !/^mobile-(pt|mg|pa|ma)-(top|right|bottom|left)-/.test(cls)
      )
      .join(" ");
    [
      ["Padding", "pt", "mobilePaddingEnabled"],
      ["Margin", "mg", "mobileMarginEnabled"]
    ].forEach(([type, prefix, enabledKey]) => {
      const val = attributes[`mobile${type}`];
      const enabled = attributes[enabledKey];
      if (val && typeof val === "object" && enabled) {
        ["top", "right", "bottom", "left"].forEach((side) => {
          if (val[side]) {
            const className = `mobile-${prefix}-${side}-${val[side].replace(/[^a-zA-Z0-9]/g, "")}`;
            if (!classNames.includes(className)) {
              classNames += ` ${className}`;
            }
          }
        });
      }
    });
    extraProps.className = classNames.trim();
    return extraProps;
  }
);

// Register custom attributes for all blocks
addFilter(
  'blocks.registerBlockType',
  'responsive-spacing-controls/add-mobile-spacing-attributes',
  (settings) => {
    return {
      ...settings,
      attributes: {
        ...settings.attributes,
        mobilePadding: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        mobileMargin: {
          type: 'object',
          default: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
        },
        mobilePaddingEnabled: {
          type: 'boolean',
          default: false
        },
        mobileMarginEnabled: {
          type: 'boolean',
          default: false
        }
      }
    };
  }
);

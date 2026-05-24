import React from "react";
import { addFilter } from "@wordpress/hooks";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, CheckboxControl } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";
import { hasBlockSupport } from "@wordpress/blocks";
import { __ } from "@wordpress/i18n";
import type { ComponentType } from "react";

interface BlockEditProps {
  name: string;
  attributes: { className?: string; [key: string]: unknown };
  setAttributes: (attrs: { className?: string }) => void;
  [key: string]: unknown;
}

interface UtilityClass {
  label: string;
  value: string;
  help?: string;
}

interface UtilityGroup {
  label: string;
  classes: UtilityClass[];
}

const UTILITY_GROUPS: UtilityGroup[] = [
  {
    label: __("Layout", "kotlinskidev"),
    classes: [
      {
        label: __("Full Width", "kotlinskidev"),
        value: "full-width",
        help: __("Breaks out to full viewport width", "kotlinskidev"),
      },
      {
        label: __("Full Height", "kotlinskidev"),
        value: "full-height",
        help: __("Sets min-height to 100dvh", "kotlinskidev"),
      },
      {
        label: __("Above Fold", "kotlinskidev"),
        value: "above-fold",
        help: __("Fills viewport below the header — ideal for hero sections", "kotlinskidev"),
      },
      {
        label: __("Full Container", "kotlinskidev"),
        value: "full-container",
        help: __("Sets width to 100%", "kotlinskidev"),
      },
      {
        label: __("Center Block", "kotlinskidev"),
        value: "mx-auto",
        help: __("Centers the block with margin: auto", "kotlinskidev"),
      },
      {
        label: __("Container", "kotlinskidev"),
        value: "container",
        help: __("Responsive centered container with max-width", "kotlinskidev"),
      },
    ],
  },
  {
    label: __("Flex", "kotlinskidev"),
    classes: [
      {
        label: __("No Wrap", "kotlinskidev"),
        value: "no-wrap",
        help: __("Keeps flex children on a single row", "kotlinskidev"),
      },
      {
        label: __("Wrap", "kotlinskidev"),
        value: "wrap",
        help: __("Allows flex children to wrap to next line", "kotlinskidev"),
      },
    ],
  },
  {
    label: __("Visibility", "kotlinskidev"),
    classes: [
      { label: __("Mobile Only", "kotlinskidev"), value: "mobile-only" },
      { label: __("Tablet Only", "kotlinskidev"), value: "tablet-only" },
      { label: __("Desktop Only", "kotlinskidev"), value: "desktop-only" },
      { label: __("Hide on Mobile", "kotlinskidev"), value: "hide-mobile" },
      { label: __("Hide on Tablet", "kotlinskidev"), value: "hide-tablet" },
    ],
  },
  {
    label: __("Effects", "kotlinskidev"),
    classes: [
      {
        label: __("Invert Colors", "kotlinskidev"),
        value: "invert",
        help: __("Applies CSS invert(100%) filter", "kotlinskidev"),
      },
      {
        label: __("Inherit Color", "kotlinskidev"),
        value: "color-inherit",
        help: __("Forces color: inherit on element and all children", "kotlinskidev"),
      },
    ],
  },
];

const withUtilityClassPicker = createHigherOrderComponent(
  (BlockEdit: ComponentType<BlockEditProps>) => (props: BlockEditProps) => {
    const { name, attributes, setAttributes } = props;

    if (!hasBlockSupport(name, "customClassName", true)) {
      return <BlockEdit {...props} />;
    }

    const currentClasses = new Set((attributes.className ?? "").split(/\s+/).filter(Boolean));

    const toggleClass = (cls: string, checked: boolean) => {
      const updated = new Set(currentClasses);
      if (checked) {
        updated.add(cls);
      } else {
        updated.delete(cls);
      }
      setAttributes({ className: Array.from(updated).join(" ") || undefined });
    };

    return (
      <>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody
            title={__("Utility Classes", "kotlinskidev")}
            initialOpen={false}
            className="kt-utility-panel"
          >
            {UTILITY_GROUPS.map((group) => (
              <div key={group.label} className="kt-utility-panel__group">
                <span className="kt-utility-panel__group-label">{group.label}</span>
                {group.classes.map(({ label, value, help }) => (
                  <CheckboxControl
                    key={value}
                    label={label}
                    help={help}
                    checked={currentClasses.has(value)}
                    onChange={(checked) => toggleClass(value, checked)}
                    __nextHasNoMarginBottom
                  />
                ))}
              </div>
            ))}
          </PanelBody>
        </InspectorControls>
      </>
    );
  },
  "withUtilityClassPicker"
);

addFilter("editor.BlockEdit", "kotlinskidev/utility-class-picker", withUtilityClassPicker);

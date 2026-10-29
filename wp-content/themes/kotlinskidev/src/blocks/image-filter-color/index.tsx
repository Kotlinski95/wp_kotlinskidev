import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls, useSettings } from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const FILTER_COLOR_BLOCKS = ["core/image"];
const DEFAULT_VALUE = "";

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsFilterColor = (name?: string): boolean =>
  Boolean(name && FILTER_COLOR_BLOCKS.includes(name));

const addFilterColorAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsFilterColor(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevFilterColor: { type: "string", default: DEFAULT_VALUE },
      kotlinskidevRevealOnHover: { type: "boolean", default: false },
    },
  };
};

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface FilterColorAttributes {
  kotlinskidevFilterColor?: string;
  kotlinskidevRevealOnHover?: boolean;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & FilterColorAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withFilterColorControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsFilterColor(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const filterColor = attributes.kotlinskidevFilterColor || DEFAULT_VALUE;
    const revealOnHover = Boolean(attributes.kotlinskidevRevealOnHover);
    const [presets] = useSettings("custom.imageFilterColors") as [
      Record<string, { light?: string; dark?: string }> | undefined,
    ];
    const presetSlugs = Object.keys(presets ?? {});

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Filter Color", "kotlinskidev")} initialOpen={false}>
            <SelectControl
              label={__("Filter", "kotlinskidev")}
              value={filterColor}
              options={[
                { label: __("None", "kotlinskidev"), value: DEFAULT_VALUE },
                ...presetSlugs.map((slug) => ({ label: slugToLabel(slug), value: slug })),
              ]}
              onChange={(value: string) =>
                setAttributes({
                  kotlinskidevFilterColor: value,
                  ...(!value && { kotlinskidevRevealOnHover: false }),
                })
              }
              help={__(
                "Presets come from theme.json's settings.custom.imageFilterColors — add more there to offer them here.",
                "kotlinskidev"
              )}
              __nextHasNoMarginBottom
            />
            {filterColor && (
              <ToggleControl
                label={__("Reveal original color on hover", "kotlinskidev")}
                checked={revealOnHover}
                onChange={(next) => setAttributes({ kotlinskidevRevealOnHover: next })}
                help={__(
                  "On: the filter lifts on hover/focus. Off: the filter is permanent.",
                  "kotlinskidev"
                )}
                __nextHasNoMarginBottom
              />
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withFilterColorControls");

interface SaveContentExtraProps {
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SaveBlockType {
  name?: string;
}

function applyFilterColorProps(
  extraProps: SaveContentExtraProps,
  blockType: SaveBlockType,
  attributes: FilterColorAttributes
): SaveContentExtraProps {
  if (!supportsFilterColor(blockType.name) || !attributes.kotlinskidevFilterColor) {
    return extraProps;
  }

  const classes = ["has-filter-color"];
  if (attributes.kotlinskidevRevealOnHover) {
    classes.push("has-reveal-color-on-hover");
  }

  extraProps.className = extraProps.className
    ? `${extraProps.className} ${classes.join(" ")}`
    : classes.join(" ");

  const slug = attributes.kotlinskidevFilterColor;
  extraProps.style = {
    ...extraProps.style,
    "--kt-filter-color-light": `var(--wp--custom--image-filter-colors--${slug}--light)`,
    "--kt-filter-color-dark": `var(--wp--custom--image-filter-colors--${slug}--dark)`,
  };

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/filter-color-attributes",
  addFilterColorAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/filter-color-controls", withFilterColorControls);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/filter-color-props",
  applyFilterColorProps
);

import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls, useSettings } from "@wordpress/block-editor";
import { PanelBody, ToggleControl, SelectControl, TextControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const BLUR_SIBLINGS_BLOCKS = ["core/group", "core/columns"];
const CUSTOM_VALUE = "custom";
const DEFAULT_VALUE = "";
const DEFAULT_CUSTOM_BLUR = "0.25rem";

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsBlurSiblings = (name?: string): boolean =>
  Boolean(name && BLUR_SIBLINGS_BLOCKS.includes(name));

const addBlurSiblingsAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsBlurSiblings(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevBlurSiblings: { type: "boolean", default: false },
      kotlinskidevBlurAmount: { type: "string", default: DEFAULT_VALUE },
    },
  };
};

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function presetVar(slug: string): string {
  return `var(--wp--custom--grid-hover-blur--${slug})`;
}

interface BlurSiblingsAttributes {
  kotlinskidevBlurSiblings?: boolean;
  kotlinskidevBlurAmount?: string;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & BlurSiblingsAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

function BlurAmountControl({ attributes, setAttributes }: BlockEditProps) {
  const [presets] = useSettings("custom.gridHoverBlur") as [Record<string, string> | undefined];
  const presetSlugs = Object.keys(presets ?? {});
  const value = attributes.kotlinskidevBlurAmount || DEFAULT_VALUE;
  const matchedSlug = presetSlugs.find((slug) => value === presetVar(slug));
  const isCustom = value !== DEFAULT_VALUE && !matchedSlug;

  return (
    <Fragment>
      <SelectControl
        label={__("Blur intensity", "kotlinskidev")}
        value={matchedSlug ?? (isCustom ? CUSTOM_VALUE : DEFAULT_VALUE)}
        options={[
          { label: __("Default (0.25rem)", "kotlinskidev"), value: DEFAULT_VALUE },
          ...presetSlugs.map((slug) => ({ label: slugToLabel(slug), value: slug })),
          { label: __("Custom", "kotlinskidev"), value: CUSTOM_VALUE },
        ]}
        onChange={(next: string) => {
          if (next === DEFAULT_VALUE) {
            setAttributes({ kotlinskidevBlurAmount: DEFAULT_VALUE });
          } else if (next === CUSTOM_VALUE) {
            setAttributes({
              kotlinskidevBlurAmount: isCustom ? value : DEFAULT_CUSTOM_BLUR,
            });
          } else {
            setAttributes({ kotlinskidevBlurAmount: presetVar(next) });
          }
        }}
        help={__(
          "Presets come from theme.json's settings.custom.gridHoverBlur — add more there to offer them here.",
          "kotlinskidev"
        )}
        __nextHasNoMarginBottom
      />
      {isCustom && (
        <TextControl
          label={__("Custom blur amount", "kotlinskidev")}
          value={value}
          onChange={(next) => setAttributes({ kotlinskidevBlurAmount: next })}
          placeholder={DEFAULT_CUSTOM_BLUR}
          help={__("Any CSS length, e.g. 0.5rem or 8px.", "kotlinskidev")}
          __next40pxDefaultSize
          __nextHasNoMarginBottom
        />
      )}
    </Fragment>
  );
}

const withBlurSiblingsControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsBlurSiblings(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const blurSiblings = Boolean(attributes.kotlinskidevBlurSiblings);

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Blur Siblings on Hover", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Blur inactive items on hover", "kotlinskidev")}
              checked={blurSiblings}
              onChange={(next) => setAttributes({ kotlinskidevBlurSiblings: next })}
              help={__(
                "Hovering or focusing one direct child dims and blurs the rest.",
                "kotlinskidev"
              )}
              __nextHasNoMarginBottom
            />
            {blurSiblings && (
              <BlurAmountControl attributes={attributes} setAttributes={setAttributes} />
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withBlurSiblingsControls");

interface SaveContentExtraProps {
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SaveBlockType {
  name?: string;
}

function applyBlurSiblingsProps(
  extraProps: SaveContentExtraProps,
  blockType: SaveBlockType,
  attributes: BlurSiblingsAttributes
): SaveContentExtraProps {
  if (!supportsBlurSiblings(blockType.name) || !attributes.kotlinskidevBlurSiblings) {
    return extraProps;
  }

  extraProps.className = extraProps.className
    ? `${extraProps.className} has-blur-siblings`
    : "has-blur-siblings";

  if (attributes.kotlinskidevBlurAmount) {
    extraProps.style = {
      ...extraProps.style,
      "--kt-blur-amount": attributes.kotlinskidevBlurAmount,
    };
  }

  return extraProps;
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/blur-siblings-attributes",
  addBlurSiblingsAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/blur-siblings-controls", withBlurSiblingsControls);

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/blur-siblings-props",
  applyBlurSiblingsProps
);

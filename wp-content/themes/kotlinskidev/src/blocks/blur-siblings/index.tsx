import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { BlurAmountControl, BLUR_AMOUNT_DEFAULT_VALUE } from "../shared/blur-amount-control";

const BLUR_SIBLINGS_BLOCKS = ["core/group", "core/columns", "core/column"];
const NESTED_TOGGLE_BLOCKS = ["core/columns", "core/column"];

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
      kotlinskidevBlurAmount: { type: "string", default: BLUR_AMOUNT_DEFAULT_VALUE },
      kotlinskidevBlurSiblingsNested: { type: "boolean", default: false },
    },
  };
};

interface BlurSiblingsAttributes {
  kotlinskidevBlurSiblings?: boolean;
  kotlinskidevBlurAmount?: string;
  kotlinskidevBlurSiblingsNested?: boolean;
}

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & BlurSiblingsAttributes;
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withBlurSiblingsControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsBlurSiblings(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const blurSiblings = Boolean(attributes.kotlinskidevBlurSiblings);
    const blurSiblingsNested = Boolean(attributes.kotlinskidevBlurSiblingsNested);

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
            {blurSiblings && NESTED_TOGGLE_BLOCKS.includes(props.name ?? "") && (
              <ToggleControl
                label={__("Include nested columns", "kotlinskidev")}
                checked={blurSiblingsNested}
                onChange={(next) => setAttributes({ kotlinskidevBlurSiblingsNested: next })}
                help={__(
                  "Also blur columns inside Columns blocks nested further down, not just this row's own columns.",
                  "kotlinskidev"
                )}
                __nextHasNoMarginBottom
              />
            )}
            {blurSiblings && (
              <BlurAmountControl
                value={attributes.kotlinskidevBlurAmount || BLUR_AMOUNT_DEFAULT_VALUE}
                onChange={(next) => setAttributes({ kotlinskidevBlurAmount: next })}
              />
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

  if (attributes.kotlinskidevBlurSiblingsNested) {
    extraProps.className = `${extraProps.className} has-blur-siblings-nested`;
  }

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

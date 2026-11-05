import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorAdvancedControls } from "@wordpress/block-editor";
import { ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const getDeferrableBlockDefaults = (): Record<string, boolean> =>
  (window as any).kotlinskidevDeferrableBlocks?.blocks || {};

const isDeferrableBlock = (name?: string): boolean =>
  !!name && name in getDeferrableBlockDefaults();

const addAboveFoldAttribute = (settings: BlockSettings): BlockSettings => {
  if (!isDeferrableBlock(settings.name)) {
    return settings;
  }

  const defaultValue = getDeferrableBlockDefaults()[settings.name as string] ?? false;

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevAboveFold: {
        type: "boolean",
        default: defaultValue,
      },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    kotlinskidevAboveFold?: boolean;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withAboveFoldControl = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!isDeferrableBlock(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorAdvancedControls>
          <ToggleControl
            label={__("Load above the fold", "kotlinskidev")}
            help={__(
              "Enable only if this specific instance is visible without scrolling on this page. Its styles load render-blocking instead of deferred — use sparingly, since every enabled instance costs initial render time.",
              "kotlinskidev"
            )}
            checked={!!attributes.kotlinskidevAboveFold}
            onChange={(value) => setAttributes({ kotlinskidevAboveFold: value })}
          />
        </InspectorAdvancedControls>
      </Fragment>
    );
  };
}, "withAboveFoldControl");

addFilter("blocks.registerBlockType", "kotlinskidev/above-fold-attribute", addAboveFoldAttribute);

addFilter("editor.BlockEdit", "kotlinskidev/above-fold-controls", withAboveFoldControl);

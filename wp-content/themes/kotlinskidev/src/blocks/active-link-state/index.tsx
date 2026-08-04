import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorAdvancedControls } from "@wordpress/block-editor";
import { ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";

interface ActiveLinkState {
  disableActiveState?: boolean;
}

interface BlockAttributes {
  activeLinkState?: ActiveLinkState;
}

interface BlockEditProps {
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

interface BlockSettings {
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addActiveLinkStateAttribute = (settings: BlockSettings): BlockSettings => ({
  ...settings,
  attributes: {
    ...settings.attributes,
    activeLinkState: {
      type: "object",
      default: {},
    },
  },
});

const withActiveLinkStateControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    const { attributes, setAttributes } = props;
    const activeLinkState = attributes.activeLinkState || {};

    const update = (key: keyof ActiveLinkState, value: boolean) => {
      setAttributes({
        activeLinkState: { ...activeLinkState, [key]: value },
      });
    };

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorAdvancedControls>
          <ToggleControl
            label={__("Disable active-page highlight", "kotlinskidev")}
            help={__(
              "Excludes links in this block from the sitewide active-page gradient-text/underline treatment shown when a link points at the page currently being viewed. Enabled by default sitewide.",
              "kotlinskidev"
            )}
            checked={!!activeLinkState.disableActiveState}
            onChange={(value) => update("disableActiveState", value)}
          />
        </InspectorAdvancedControls>
      </Fragment>
    );
  };
}, "withActiveLinkStateControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/active-link-state-attributes",
  addActiveLinkStateAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/active-link-state-controls",
  withActiveLinkStateControls
);

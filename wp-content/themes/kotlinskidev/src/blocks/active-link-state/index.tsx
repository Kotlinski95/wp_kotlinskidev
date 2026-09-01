import React from "react";
import { __ } from "@wordpress/i18n";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorAdvancedControls } from "@wordpress/block-editor";
import { ToggleControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";

interface ActiveLinkState {
  disableActiveState?: boolean;
}

interface BlockAttributes {
  activeLinkState?: ActiveLinkState;
}

interface BlockEditProps {
  name?: string;
  attributes: BlockAttributes;
  setAttributes: (attrs: Partial<BlockAttributes>) => void;
}

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addActiveLinkStateAttribute = (settings: BlockSettings): BlockSettings => {
  if (DYNAMIC_PREVIEW_BLOCKS.includes(settings.name ?? "")) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      activeLinkState: {
        type: "object",
        default: {},
      },
    },
  };
};

const withActiveLinkStateControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (DYNAMIC_PREVIEW_BLOCKS.includes(props.name ?? "")) {
      return <BlockEdit {...props} />;
    }

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

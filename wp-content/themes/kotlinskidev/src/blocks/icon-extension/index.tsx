import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../shared/nav-icon-picker";

const ICON_TRIGGER_BLOCKS = [
  "kotlinskidev/button",
  "kotlinskidev/nav-link",
  "core/button",
  "core/navigation-link",
  "core/navigation-submenu",
];

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const supportsIconExtension = (name?: string): boolean =>
  Boolean(name && ICON_TRIGGER_BLOCKS.includes(name));

const addIconExtensionAttributes = (settings: BlockSettings): BlockSettings => {
  if (!supportsIconExtension(settings.name)) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      iconId: { type: "number", default: 0 },
      iconUrl: { type: "string", default: "" },
    },
  };
};

interface BlockEditProps {
  name?: string;
  attributes: Record<string, unknown> & {
    iconId?: number;
    iconUrl?: string;
  };
  setAttributes: (attrs: Record<string, unknown>) => void;
}

const withIconExtensionControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (!supportsIconExtension(props.name)) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const iconId = attributes.iconId ?? 0;
    const iconUrl = attributes.iconUrl ?? "";

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Icon", "kotlinskidev")}>
            <NavIconPicker
              iconId={iconId}
              iconUrl={iconUrl}
              onChange={(id, url) => setAttributes({ iconId: id, iconUrl: url })}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withIconExtensionControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/icon-extension-attributes",
  addIconExtensionAttributes
);

addFilter("editor.BlockEdit", "kotlinskidev/icon-extension-controls", withIconExtensionControls);

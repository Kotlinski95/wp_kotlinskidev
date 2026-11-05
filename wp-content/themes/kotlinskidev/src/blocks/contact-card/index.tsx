import React from "react";
import { addFilter } from "@wordpress/hooks";
import { createHigherOrderComponent } from "@wordpress/compose";
import { InspectorControls } from "@wordpress/block-editor";
import { PanelBody, RangeControl } from "@wordpress/components";
import { Fragment } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

const CONTACT_CARD_BLOCK = "kotlinskidev/contact-card";

interface BlockSettings {
  name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

const addContactCardAttributes = (settings: BlockSettings): BlockSettings => {
  if (settings.name !== CONTACT_CARD_BLOCK) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      gridGap: { type: "number", default: 1.5 },
    },
  };
};

interface ContactCardAttributes {
  gridGap?: number;
}

interface BlockEditProps {
  name?: string;
  attributes: ContactCardAttributes;
  setAttributes: (attrs: Partial<ContactCardAttributes>) => void;
}

const withContactCardControls = createHigherOrderComponent((BlockEdit) => {
  return (props: BlockEditProps) => {
    if (props.name !== CONTACT_CARD_BLOCK) {
      return <BlockEdit {...props} />;
    }

    const { attributes, setAttributes } = props;
    const gridGap = attributes.gridGap ?? 1.5;

    return (
      <Fragment>
        <BlockEdit {...props} />
        <InspectorControls>
          <PanelBody title={__("Contact Card Layout", "kotlinskidev")} initialOpen={true}>
            <RangeControl
              label={__("Gap between fields (rem)", "kotlinskidev")}
              value={gridGap}
              min={0}
              max={3}
              step={0.25}
              onChange={(value) => setAttributes({ gridGap: value ?? 1.5 })}
              help={__(
                "Lower this if long values (e.g. an email address) wrap to a second line.",
                "kotlinskidev"
              )}
            />
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  };
}, "withContactCardControls");

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/contact-card-attributes",
  addContactCardAttributes
);
addFilter("editor.BlockEdit", "kotlinskidev/contact-card-controls", withContactCardControls);

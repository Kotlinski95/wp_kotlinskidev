import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, Notice } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { ColorAttributeFields } from "../shared/color-attribute-fields";
import { BlurOtherCardsFields } from "../shared/blur-amount-control";

interface RecentlyViewedAttributes {
  cardHoverBackgroundColor: string;
  blurOtherCards: boolean;
  blurAmount: string;
}

interface RecentlyViewedEditProps {
  attributes: RecentlyViewedAttributes;
  setAttributes: (attrs: Partial<RecentlyViewedAttributes>) => void;
}

function RecentlyViewedEdit({ attributes, setAttributes }: RecentlyViewedEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Card Hover Effects", "kotlinskidev")} initialOpen={false}>
          <ColorAttributeFields
            fields={[
              {
                field: "cardHoverBackgroundColor",
                label: __("Card background on hover", "kotlinskidev"),
              },
            ]}
            attributes={attributes}
            setAttributes={setAttributes}
          />
          <BlurOtherCardsFields attributes={attributes} setAttributes={setAttributes} />
        </PanelBody>
      </InspectorControls>
      <Notice status="info" isDismissible={false}>
        {__(
          "Empty here by design — the cards themselves are populated client-side from the visitor's own browsing history, which this editor has none of.",
          "kotlinskidev"
        )}
      </Notice>
      <ServerSideRender block="kotlinskidev/recently-viewed-dynamic" attributes={attributes} />
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<RecentlyViewedAttributes>, {
  edit: RecentlyViewedEdit,
  save: Save,
});

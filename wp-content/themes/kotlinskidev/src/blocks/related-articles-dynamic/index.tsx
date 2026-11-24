import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { ColorAttributeFields } from "../shared/color-attribute-fields";
import { BlurOtherCardsFields } from "../shared/blur-amount-control";

interface RelatedArticlesAttributes {
  cardHoverBackgroundColor: string;
  blurOtherCards: boolean;
  blurAmount: string;
}

interface RelatedArticlesEditProps {
  attributes: RelatedArticlesAttributes;
  setAttributes: (attrs: Partial<RelatedArticlesAttributes>) => void;
}

function RelatedArticlesEdit({ attributes, setAttributes }: RelatedArticlesEditProps) {
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
      <ServerSideRender block="kotlinskidev/related-articles-dynamic" attributes={attributes} />
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<RelatedArticlesAttributes>, {
  edit: RelatedArticlesEdit,
  save: Save,
});

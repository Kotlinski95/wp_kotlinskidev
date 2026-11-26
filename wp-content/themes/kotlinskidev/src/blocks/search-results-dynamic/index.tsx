import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { ColorAttributeFields, type ColorAttributeField } from "../shared/color-attribute-fields";
import { BlurOtherCardsFields } from "../shared/blur-amount-control";

interface SearchResultsAttributes {
  cardTextColor: string;
  cardBorderColor: string;
  cardBackgroundColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  buttonHoverBackgroundColor: string;
  buttonHoverTextColor: string;
  cardHoverBackgroundColor: string;
  blurOtherCards: boolean;
  blurAmount: string;
}

interface SearchResultsEditProps {
  attributes: SearchResultsAttributes;
  setAttributes: (attrs: Partial<SearchResultsAttributes>) => void;
}

function cardStyleFields(): ColorAttributeField<SearchResultsAttributes>[] {
  return [
    { field: "cardTextColor", label: __("Card text color", "kotlinskidev") },
    { field: "cardBackgroundColor", label: __("Card background color", "kotlinskidev") },
    { field: "cardBorderColor", label: __("Card border color", "kotlinskidev") },
    { field: "buttonBackgroundColor", label: __("Button background color", "kotlinskidev") },
    { field: "buttonTextColor", label: __("Button text color", "kotlinskidev") },
    {
      field: "buttonHoverBackgroundColor",
      label: __("Button hover background color", "kotlinskidev"),
    },
    { field: "buttonHoverTextColor", label: __("Button hover text color", "kotlinskidev") },
  ];
}

function CardHoverEffectsPanel({ attributes, setAttributes }: SearchResultsEditProps) {
  return (
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
  );
}

function SearchResultsEdit({ attributes, setAttributes }: SearchResultsEditProps) {
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Search Result Card Style", "kotlinskidev")} initialOpen={false}>
          <ColorAttributeFields
            fields={cardStyleFields()}
            attributes={attributes}
            setAttributes={setAttributes}
          />
        </PanelBody>
        <CardHoverEffectsPanel attributes={attributes} setAttributes={setAttributes} />
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/search-results-dynamic" attributes={attributes} />
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<SearchResultsAttributes>, {
  edit: SearchResultsEdit,
  save: Save,
});

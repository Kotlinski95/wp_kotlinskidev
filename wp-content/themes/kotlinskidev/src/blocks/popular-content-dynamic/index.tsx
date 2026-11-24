import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import {
  InspectorControls,
  useBlockProps,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { BlurOtherCardsFields } from "../shared/blur-amount-control";

interface PopularContentAttributes {
  cardHoverBackgroundColor: string;
  blurOtherCards: boolean;
  blurAmount: string;
}

interface PopularContentEditProps {
  attributes: PopularContentAttributes;
  setAttributes: (attrs: Partial<PopularContentAttributes>) => void;
}

function PopularContentEdit({ attributes, setAttributes }: PopularContentEditProps) {
  const { cardHoverBackgroundColor } = attributes;
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Card Hover Effects", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Card background on hover", "kotlinskidev")}
            colorValue={cardHoverBackgroundColor || undefined}
            onColorChange={(value?: string) =>
              setAttributes({ cardHoverBackgroundColor: value || "" })
            }
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <BlurOtherCardsFields attributes={attributes} setAttributes={setAttributes} />
        </PanelBody>
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/popular-content-dynamic" attributes={attributes} />
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<PopularContentAttributes>, {
  edit: PopularContentEdit,
  save: Save,
});

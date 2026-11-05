import React from "react";
import { registerBlockType, type BlockConfiguration } from "@wordpress/blocks";
import ServerSideRender from "@wordpress/server-side-render";
import {
  InspectorControls,
  useBlockProps,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import metadata from "./block.json";
import { BlurAmountControl, BLUR_AMOUNT_DEFAULT_VALUE } from "../shared/blur-amount-control";

interface TagPostsGridAttributes {
  cardHoverBackgroundColor: string;
  blurOtherCards: boolean;
  blurAmount: string;
}

interface TagPostsGridEditProps {
  attributes: TagPostsGridAttributes;
  setAttributes: (attrs: Partial<TagPostsGridAttributes>) => void;
}

function TagPostsGridEdit({ attributes, setAttributes }: TagPostsGridEditProps) {
  const { cardHoverBackgroundColor, blurOtherCards, blurAmount } = attributes;
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
          <ToggleControl
            label={__("Blur other cards on hover", "kotlinskidev")}
            help={__(
              "Hovering or focusing one card dims and blurs the rest of the grid.",
              "kotlinskidev"
            )}
            checked={blurOtherCards}
            onChange={(value) => setAttributes({ blurOtherCards: value })}
            __nextHasNoMarginBottom
          />
          {blurOtherCards && (
            <BlurAmountControl
              value={blurAmount || BLUR_AMOUNT_DEFAULT_VALUE}
              onChange={(value) => setAttributes({ blurAmount: value })}
            />
          )}
        </PanelBody>
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/tag-posts-grid-dynamic" attributes={attributes} />
    </div>
  );
}

function Save() {
  return null;
}

registerBlockType(metadata as unknown as BlockConfiguration<TagPostsGridAttributes>, {
  edit: TagPostsGridEdit,
  save: Save,
});

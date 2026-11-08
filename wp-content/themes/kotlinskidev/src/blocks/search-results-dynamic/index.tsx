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

function SearchResultsEdit({ attributes, setAttributes }: SearchResultsEditProps) {
  const {
    cardTextColor,
    cardBorderColor,
    cardBackgroundColor,
    buttonBackgroundColor,
    buttonTextColor,
    buttonHoverBackgroundColor,
    buttonHoverTextColor,
    cardHoverBackgroundColor,
    blurOtherCards,
    blurAmount,
  } = attributes;
  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Search Result Card Style", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Card text color", "kotlinskidev")}
            colorValue={cardTextColor || undefined}
            onColorChange={(value?: string) => setAttributes({ cardTextColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Card background color", "kotlinskidev")}
            colorValue={cardBackgroundColor || undefined}
            onColorChange={(value?: string) => setAttributes({ cardBackgroundColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Card border color", "kotlinskidev")}
            colorValue={cardBorderColor || undefined}
            onColorChange={(value?: string) => setAttributes({ cardBorderColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Button background color", "kotlinskidev")}
            colorValue={buttonBackgroundColor || undefined}
            onColorChange={(value?: string) =>
              setAttributes({ buttonBackgroundColor: value || "" })
            }
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Button text color", "kotlinskidev")}
            colorValue={buttonTextColor || undefined}
            onColorChange={(value?: string) => setAttributes({ buttonTextColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Button hover background color", "kotlinskidev")}
            colorValue={buttonHoverBackgroundColor || undefined}
            onColorChange={(value?: string) =>
              setAttributes({ buttonHoverBackgroundColor: value || "" })
            }
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Button hover text color", "kotlinskidev")}
            colorValue={buttonHoverTextColor || undefined}
            onColorChange={(value?: string) => setAttributes({ buttonHoverTextColor: value || "" })}
            enableAlpha={true}
            clearable={true}
            __experimentalIsRenderedInSidebar={true}
            __nextHasNoMarginBottom
          />
        </PanelBody>
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

import React from "react";
import ServerSideRender from "@wordpress/server-side-render";
import {
  InspectorControls,
  useBlockProps,
  __experimentalColorGradientControl as ColorGradientControl,
} from "@wordpress/block-editor";
import { PanelBody } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface SearchFormDynamicAttributes {
  wrapperBackgroundColor?: string;
  inputBorderColor?: string;
  labelColor?: string;
}

export interface SearchFormDynamicEditProps {
  attributes: SearchFormDynamicAttributes;
  setAttributes: (attrs: Partial<SearchFormDynamicAttributes>) => void;
}

export default function Edit({ attributes, setAttributes }: SearchFormDynamicEditProps) {
  const wrapperBackgroundColor = attributes.wrapperBackgroundColor ?? "";
  const inputBorderColor = attributes.inputBorderColor ?? "";
  const labelColor = attributes.labelColor ?? "";

  const blockProps = useBlockProps();

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Search Form Colors", "kotlinskidev")} initialOpen={false}>
          <ColorGradientControl
            label={__("Panel background color", "kotlinskidev")}
            colorValue={wrapperBackgroundColor || undefined}
            onColorChange={(value: string | undefined) =>
              setAttributes({ wrapperBackgroundColor: value || "" })
            }
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Input/select border color", "kotlinskidev")}
            colorValue={inputBorderColor || undefined}
            onColorChange={(value: string | undefined) =>
              setAttributes({ inputBorderColor: value || "" })
            }
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <ColorGradientControl
            label={__("Label color", "kotlinskidev")}
            colorValue={labelColor || undefined}
            onColorChange={(value: string | undefined) =>
              setAttributes({ labelColor: value || "" })
            }
            gradients={[]}
            disableCustomGradients
            enableAlpha
            clearable
            __experimentalIsRenderedInSidebar
            __nextHasNoMarginBottom
          />
          <p className="components-base-control__help">
            {__(
              "Leave empty to keep the theme's default colors. The search button keeps its own gradient hover effect regardless of these settings.",
              "kotlinskidev"
            )}
          </p>
        </PanelBody>
      </InspectorControls>
      <ServerSideRender block="kotlinskidev/search-form-dynamic" attributes={attributes} />
    </div>
  );
}

import React, { type ComponentType } from "react";
import * as blockEditor from "@wordpress/block-editor";
import { PanelBody, RangeControl, TextControl, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { ButtonColorPanel } from "./ButtonColorControls";
import type { ButtonAttributes } from "./edit";

export type SetButtonAttributes = (attributes: Partial<ButtonAttributes>) => void;

interface ButtonPanelProps {
  attributes: ButtonAttributes;
  setAttributes: SetButtonAttributes;
}

interface LinkControlValue {
  url?: string;
  opensInNewTab?: boolean;
}

interface LinkControlProps {
  value: LinkControlValue;
  settings: { id: string; title: string }[];
  onChange: (value: LinkControlValue) => void;
  onRemove: () => void;
}

const { __experimentalLinkControl: LinkControl } = blockEditor as unknown as {
  __experimentalLinkControl: ComponentType<LinkControlProps>;
};

export function LinkSettingsPanel({ attributes, setAttributes }: ButtonPanelProps) {
  const { url, opensInNewTab, rel } = attributes;
  return (
    <PanelBody title={__("Link settings", "kotlinskidev")} initialOpen>
      <LinkControl
        value={{ url, opensInNewTab }}
        settings={[{ id: "opensInNewTab", title: __("Open in new tab", "kotlinskidev") }]}
        onChange={(next) =>
          setAttributes({
            url: next.url ?? "",
            opensInNewTab: Boolean(next.opensInNewTab),
          })
        }
        onRemove={() => setAttributes({ url: "" })}
      />
      <TextControl
        label={__("Rel attribute", "kotlinskidev")}
        help={__(
          "The relationship of the linked URL as space-separated link types.",
          "kotlinskidev"
        )}
        value={rel}
        onChange={(value) => setAttributes({ rel: value })}
      />
    </PanelBody>
  );
}

export function ContentPanel({ attributes, setAttributes }: ButtonPanelProps) {
  return (
    <PanelBody title={__("Content", "kotlinskidev")} initialOpen={false}>
      <ToggleControl
        label={__("Allow nested blocks", "kotlinskidev")}
        help={__(
          "Switch the label to a block area so you can add Paragraph, Protected Content, Icon, etc. instead of plain text.",
          "kotlinskidev"
        )}
        checked={attributes.useInnerBlocks}
        onChange={(value) => setAttributes({ useInnerBlocks: value })}
      />
    </PanelBody>
  );
}

export function BorderWidthPanel({ attributes, setAttributes }: ButtonPanelProps) {
  return (
    <PanelBody title={__("Border width", "kotlinskidev")} initialOpen={false}>
      <RangeControl
        label={__("Border width (px)", "kotlinskidev")}
        value={attributes.borderWidth}
        onChange={(value) => setAttributes({ borderWidth: value ?? 0 })}
        min={0}
        max={10}
        help={__(
          "Applies to Border color/gradient set below. Native corner radius is available in the Border panel.",
          "kotlinskidev"
        )}
      />
    </PanelBody>
  );
}

export function NormalStatePanel({ attributes, setAttributes }: ButtonPanelProps) {
  return (
    <ButtonColorPanel
      title={__("Normal state", "kotlinskidev")}
      initialOpen
      text={{
        color: attributes.textColor,
        gradient: attributes.textGradient,
        onColorChange: (color) => setAttributes({ textColor: color }),
        onGradientChange: (gradient) => setAttributes({ textGradient: gradient }),
      }}
      background={{
        color: attributes.backgroundColor,
        gradient: attributes.backgroundGradient,
        onColorChange: (color) => setAttributes({ backgroundColor: color }),
        onGradientChange: (gradient) => setAttributes({ backgroundGradient: gradient }),
      }}
      border={{
        color: attributes.borderColor,
        gradient: attributes.borderGradient,
        onColorChange: (color) => setAttributes({ borderColor: color }),
        onGradientChange: (gradient) => setAttributes({ borderGradient: gradient }),
      }}
    />
  );
}

export function HoverStatePanel({ attributes, setAttributes }: ButtonPanelProps) {
  return (
    <ButtonColorPanel
      title={__("Hover state", "kotlinskidev")}
      text={{
        color: attributes.hoverTextColor,
        gradient: attributes.hoverTextGradient,
        onColorChange: (color) => setAttributes({ hoverTextColor: color }),
        onGradientChange: (gradient) => setAttributes({ hoverTextGradient: gradient }),
      }}
      background={{
        color: attributes.hoverBackgroundColor,
        gradient: attributes.hoverBackgroundGradient,
        onColorChange: (color) => setAttributes({ hoverBackgroundColor: color }),
        onGradientChange: (gradient) => setAttributes({ hoverBackgroundGradient: gradient }),
      }}
      border={{
        color: attributes.hoverBorderColor,
        gradient: attributes.hoverBorderGradient,
        onColorChange: (color) => setAttributes({ hoverBorderColor: color }),
        onGradientChange: (gradient) => setAttributes({ hoverBorderGradient: gradient }),
      }}
    />
  );
}

export function EnhancedHoverPanel({ attributes, setAttributes }: ButtonPanelProps) {
  return (
    <PanelBody title={__("Enhanced hover effect", "kotlinskidev")} initialOpen={false}>
      <ToggleControl
        label={__("Cursor glow", "kotlinskidev")}
        help={__(
          "A soft glow in the Hover text color above that follows the cursor. Set a Hover text color above for this to be visible — while this is on, that color only drives the glow and no longer recolors the whole button text on hover.",
          "kotlinskidev"
        )}
        checked={attributes.hoverEnhancedGlow}
        onChange={(value) => setAttributes({ hoverEnhancedGlow: value })}
      />
    </PanelBody>
  );
}

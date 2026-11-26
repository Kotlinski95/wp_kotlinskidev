import React from "react";
import type { BlockEditProps } from "@wordpress/blocks";
import { useBlockProps, InspectorControls, RichText } from "@wordpress/block-editor";
import { PanelBody, TextControl, TextareaControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { LinkControl, TextColorPanel, buildGradientTextStyle } from "./editor-controls";
import type { NavLinkAttributes } from "./types";

const LinkSettingsPanel = ({
  attributes,
  setAttributes,
}: BlockEditProps<NavLinkAttributes>): JSX.Element => {
  const { label, url, opensInNewTab, description, rel } = attributes;

  return (
    <PanelBody title={__("Link settings", "kotlinskidev")} initialOpen>
      <LinkControl
        value={{ url, opensInNewTab }}
        settings={[{ id: "opensInNewTab", title: __("Open in new tab", "kotlinskidev") }]}
        onChange={(next) =>
          setAttributes({
            url: next.url ?? "",
            opensInNewTab: Boolean(next.opensInNewTab),
            ...(label === "" && next.title ? { label: next.title } : {}),
          })
        }
        onRemove={() => setAttributes({ url: "" })}
      />
      <TextareaControl
        label={__("Description", "kotlinskidev")}
        help={__(
          "The description will be displayed in the menu if the current theme supports it.",
          "kotlinskidev"
        )}
        value={description}
        onChange={(value) => setAttributes({ description: value })}
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
};

export function NavLinkEdit(props: BlockEditProps<NavLinkAttributes>) {
  const blockProps = useBlockProps({ className: "kt-nav-link" });
  const { attributes, setAttributes } = props;
  const { label, textColor, textGradient } = attributes;

  return (
    <div {...blockProps}>
      <InspectorControls>
        <LinkSettingsPanel {...props} />
        <TextColorPanel
          controlLabel={__("Gradient Colors", "kotlinskidev")}
          textColor={textColor}
          textGradient={textGradient}
          setAttributes={setAttributes}
        />
      </InspectorControls>
      <RichText
        tagName="span"
        style={buildGradientTextStyle(textGradient, textColor)}
        value={label}
        onChange={(value) => setAttributes({ label: value })}
        placeholder={__("Nav link label…", "kotlinskidev")}
      />
    </div>
  );
}

import React from "react";
import { useState } from "@wordpress/element";
import { registerBlockType, TemplateArray, type BlockEditProps } from "@wordpress/blocks";
import { InspectorControls, useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import { PanelBody, TextControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../shared/nav-icon-picker";

interface SearchPanelAttributes {
  label: string;
  visibility: string;
  navIconId: number;
  navIconUrl: string;
}

const TEMPLATE: TemplateArray = [
  [
    "core/search",
    {
      showLabel: false,
      placeholder: "Type to search…",
      buttonPosition: "button-inside",
      buttonUseIcon: true,
      width: 100,
      widthUnit: "%",
    },
  ],
];

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={16}
    height={16}
    aria-hidden
  >
    <circle cx={11} cy={11} r={8} />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

function SearchPanelEdit({ attributes, setAttributes }: BlockEditProps<SearchPanelAttributes>) {
  const blockProps = useBlockProps({ className: "kt-search-panel-editor" });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Search Panel", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Nav label", "kotlinskidev")}
            value={attributes.label}
            onChange={(label) => setAttributes({ label })}
            help={__("Used as aria-label when an icon is set.", "kotlinskidev")}
          />
        </PanelBody>
        <PanelBody title={__("Nav Icon", "kotlinskidev")}>
          <NavIconPicker
            iconId={attributes.navIconId}
            iconUrl={attributes.navIconUrl}
            onChange={(id, url) => setAttributes({ navIconId: id, navIconUrl: url })}
          />
        </PanelBody>
      </InspectorControls>

      <button
        type="button"
        className="kt-search-panel-editor__trigger"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
      >
        {attributes.navIconUrl ? (
          <img src={attributes.navIconUrl} alt="" width={16} height={16} />
        ) : (
          <SearchIcon />
        )}
        <span>{attributes.label || __("Search", "kotlinskidev")}</span>
      </button>

      <div className="kt-search-panel-editor__panel" hidden={!isOpen}>
        <InnerBlocks template={TEMPLATE} templateLock={false} />
      </div>
    </div>
  );
}

function SearchPanelSave() {
  return <InnerBlocks.Content />;
}

const definition = { edit: SearchPanelEdit, save: SearchPanelSave };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
registerBlockType("kotlinskidev/search-panel", definition as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
registerBlockType("kotlinskidev/nav-search-panel", definition as any);

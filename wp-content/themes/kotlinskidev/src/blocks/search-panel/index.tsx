import React from "react";
import { useState } from "@wordpress/element";
import { registerBlockType, TemplateArray, type BlockEditProps } from "@wordpress/blocks";
import {
  InspectorControls,
  useBlockProps,
  InnerBlocks,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { PanelBody, TextControl, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

interface SearchPanelAttributes {
  label: string;
  visibility: string;
  navIconId: number;
  navIconUrl: string;
}

interface NavIconMedia {
  id: number;
  url: string;
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

const ALLOWED_BLOCKS = [
  "core/search",
  "core/image",
  "core/cover",
  "core/paragraph",
  "core/heading",
  "core/buttons",
  "core/group",
  "kotlinskidev/popular-pages",
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

function NavIconPicker({
  iconId,
  iconUrl,
  onChange,
}: {
  iconId: number;
  iconUrl: string;
  onChange: (id: number, url: string) => void;
}) {
  return (
    <MediaUploadCheck>
      <MediaUpload
        onSelect={(media: NavIconMedia) => onChange(media.id, media.url)}
        allowedTypes={["image/svg+xml"]}
        value={iconId}
        render={({ open }: { open: () => void }) => (
          <>
            {iconUrl && (
              <img
                src={iconUrl}
                alt=""
                style={{ width: 24, height: 24, display: "block", marginBottom: "0.5rem" }}
              />
            )}
            <Button
              variant={iconId ? "secondary" : "primary"}
              onClick={open}
              style={{
                width: "100%",
                justifyContent: "center",
                marginBottom: iconId ? "0.25rem" : 0,
              }}
            >
              {iconId ? __("Replace icon", "kotlinskidev") : __("Select SVG icon", "kotlinskidev")}
            </Button>
            {iconId ? (
              <Button variant="link" isDestructive onClick={() => onChange(0, "")}>
                {__("Remove icon", "kotlinskidev")}
              </Button>
            ) : null}
          </>
        )}
      />
    </MediaUploadCheck>
  );
}

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
        <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={TEMPLATE} templateLock={false} />
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

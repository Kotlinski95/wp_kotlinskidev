import React from "react";
import { useState } from "@wordpress/element";
import { registerBlockType, TemplateArray, type BlockEditProps } from "@wordpress/blocks";
import { InspectorControls, useBlockProps, InnerBlocks } from "@wordpress/block-editor";
import { PanelBody, TextControl, ToggleControl, SelectControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { NavIconPicker } from "../shared/nav-icon-picker";

interface LanguagePanelAttributes {
  label: string;
  labelStyle: string;
  showFlag: boolean;
  visibility: string;
  navIconId: number;
  navIconUrl: string;
  showIndicator: boolean;
  indicatorIconId: number;
  indicatorIconUrl: string;
  indicatorEffect: string;
}

const TEMPLATE: TemplateArray = [
  [
    "polylang/navigation-language-switcher",
    {
      dropdown: false,
      show_names: true,
      show_flags: true,
      force_home: false,
      hide_current: false,
      hide_if_no_translation: false,
    },
  ],
];

const ALLOWED_BLOCKS = [
  "polylang/navigation-language-switcher",
  "kotlinskidev/simple-grid",
  "kotlinskidev/nav-link",
  "kotlinskidev/nav-banner",
  "kotlinskidev/nav-image",
  "kotlinskidev/nav-paragraph",
  "kotlinskidev/button",
];

const ChevronIcon = ({ rotated, animated }: { rotated: boolean; animated: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={12}
    height={12}
    aria-hidden
    style={{
      transition: animated ? "transform 0.2s ease" : "none",
      transform: rotated ? "rotate(180deg)" : "none",
    }}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const GlobeIcon = () => (
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
    <circle cx={12} cy={12} r={10} />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

function LanguagePanelEdit({ attributes, setAttributes }: BlockEditProps<LanguagePanelAttributes>) {
  const blockProps = useBlockProps({ className: "kt-search-panel-editor kt-lang-panel-editor" });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Language Panel", "kotlinskidev")} initialOpen>
          <TextControl
            label={__("Nav label", "kotlinskidev")}
            value={attributes.label}
            onChange={(label) => setAttributes({ label })}
            help={__("Leave empty to show the current language automatically.", "kotlinskidev")}
          />
          <SelectControl
            label={__("Auto label style", "kotlinskidev")}
            value={attributes.labelStyle}
            options={[
              { label: __("Short code (PL)", "kotlinskidev"), value: "short" },
              { label: __("Full name (Polski)", "kotlinskidev"), value: "full" },
            ]}
            onChange={(labelStyle) => setAttributes({ labelStyle })}
            help={__("Used when the nav label is empty.", "kotlinskidev")}
          />
          <ToggleControl
            label={__("Show current language flag", "kotlinskidev")}
            checked={attributes.showFlag}
            onChange={(showFlag) => setAttributes({ showFlag })}
          />
        </PanelBody>
        <PanelBody title={__("Nav Icon", "kotlinskidev")}>
          <NavIconPicker
            iconId={attributes.navIconId}
            iconUrl={attributes.navIconUrl}
            onChange={(id, url) => setAttributes({ navIconId: id, navIconUrl: url })}
          />
        </PanelBody>
        <PanelBody title={__("Dropdown Indicator", "kotlinskidev")}>
          <ToggleControl
            label={__("Show indicator arrow", "kotlinskidev")}
            checked={attributes.showIndicator}
            onChange={(showIndicator) => setAttributes({ showIndicator })}
            help={__("Small arrow hinting that a dropdown will open.", "kotlinskidev")}
          />
          {attributes.showIndicator && (
            <>
              <SelectControl
                label={__("Open effect", "kotlinskidev")}
                value={attributes.indicatorEffect}
                options={[
                  { label: __("Rotate 180°", "kotlinskidev"), value: "rotate" },
                  {
                    label: __("Rotate 180° (no transition)", "kotlinskidev"),
                    value: "rotate-instant",
                  },
                  { label: __("None", "kotlinskidev"), value: "none" },
                ]}
                onChange={(indicatorEffect) => setAttributes({ indicatorEffect })}
              />
              <NavIconPicker
                iconId={attributes.indicatorIconId}
                iconUrl={attributes.indicatorIconUrl}
                onChange={(id, url) =>
                  setAttributes({ indicatorIconId: id, indicatorIconUrl: url })
                }
              />
            </>
          )}
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
          <GlobeIcon />
        )}
        <span>{attributes.label || __("Language", "kotlinskidev")}</span>
        {attributes.showIndicator &&
          (attributes.indicatorIconUrl ? (
            <span
              aria-hidden
              style={{
                width: 12,
                height: 12,
                display: "inline-block",
                backgroundColor: "currentColor",
                WebkitMask: `url(${attributes.indicatorIconUrl}) no-repeat center / contain`,
                mask: `url(${attributes.indicatorIconUrl}) no-repeat center / contain`,
                transition:
                  attributes.indicatorEffect === "rotate" ? "transform 0.2s ease" : "none",
                transform:
                  isOpen && attributes.indicatorEffect !== "none" ? "rotate(180deg)" : "none",
              }}
            />
          ) : (
            <ChevronIcon
              rotated={isOpen && attributes.indicatorEffect !== "none"}
              animated={attributes.indicatorEffect === "rotate"}
            />
          ))}
      </button>

      <div className="kt-search-panel-editor__panel" hidden={!isOpen}>
        <InnerBlocks allowedBlocks={ALLOWED_BLOCKS} template={TEMPLATE} templateLock={false} />
      </div>
    </div>
  );
}

function LanguagePanelSave() {
  return <InnerBlocks.Content />;
}

const definition = { edit: LanguagePanelEdit, save: LanguagePanelSave };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
registerBlockType("kotlinskidev/language-panel", definition as any);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
registerBlockType("kotlinskidev/nav-language-panel", definition as any);

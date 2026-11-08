import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { BlurAmountControl, BLUR_AMOUNT_DEFAULT_VALUE } from "../shared/blur-amount-control";

type OverlayMenu = "never" | "mobile" | "always";
type DisplayMode = "mega" | "list" | "bar";
type Visibility = "all" | "desktop" | "mobile";
type HorizontalSide = "right" | "left";

interface NavigationPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

export interface NavigationAttributes {
  menuSlug: string;
  overlayMenu: OverlayMenu;
  displayMode: DisplayMode;
  visibility: Visibility;
  overlaySlide: HorizontalSide;
  hamburgerLineAlign: HorizontalSide;
  className: string;
  linkNavigatesOnClick: boolean;
  showHamburgerBorder: boolean;
  hideAccordionDividers: boolean;
  blurInactiveLinks: boolean;
  blurAmount: string;
  blurIncludeUtility: boolean;
}

const overlayMenuOptions = [
  { label: __("Never — always inline", "kotlinskidev"), value: "never" },
  { label: __("On mobile only", "kotlinskidev"), value: "mobile" },
  { label: __("Always — hamburger", "kotlinskidev"), value: "always" },
];

const displayModeOptions = [
  { label: __("Mega menu bar", "kotlinskidev"), value: "mega" },
  { label: __("Flat link list", "kotlinskidev"), value: "list" },
  { label: __("Mobile bottom bar", "kotlinskidev"), value: "bar" },
];

const visibilityOptions = [
  { label: __("Always visible", "kotlinskidev"), value: "all" },
  { label: __("Desktop only", "kotlinskidev"), value: "desktop" },
  { label: __("Mobile & tablet only", "kotlinskidev"), value: "mobile" },
];

const overlaySlideOptions = [
  { label: __("From right", "kotlinskidev"), value: "right" },
  { label: __("From left", "kotlinskidev"), value: "left" },
];

const hamburgerLineAlignOptions = [
  { label: __("Right", "kotlinskidev"), value: "right" },
  { label: __("Left", "kotlinskidev"), value: "left" },
];

const visibilityClassMap: Record<Visibility, string> = {
  all: "",
  desktop: "nav-desktop",
  mobile: "nav-mobile",
};

interface EditProps {
  attributes: NavigationAttributes;
  setAttributes: (attrs: Partial<NavigationAttributes>) => void;
}

export function Edit({ attributes, setAttributes }: EditProps) {
  const blockProps = useBlockProps({
    className: ["kt-nav-placeholder", visibilityClassMap[attributes.visibility]]
      .filter(Boolean)
      .join(" "),
  });

  const navigationPosts = useSelect((select) => {
    return (select("core") as any).getEntityRecords("postType", "wp_navigation", {
      per_page: 100,
      status: "publish",
    }) as NavigationPost[] | null;
  }, []);

  const menuOptions = [
    {
      label:
        navigationPosts === null
          ? __("Loading…", "kotlinskidev")
          : __("— Select a menu —", "kotlinskidev"),
      value: "",
    },
    ...(navigationPosts ?? []).map((post) => ({
      label: post.title.rendered || post.slug,
      value: post.slug,
    })),
  ];

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__("Navigation", "kotlinskidev")} initialOpen={true}>
          <SelectControl
            label={__("Navigation menu", "kotlinskidev")}
            value={attributes.menuSlug}
            options={menuOptions}
            onChange={(menuSlug) => setAttributes({ menuSlug })}
          />
          <SelectControl
            label={__("Display mode", "kotlinskidev")}
            help={__(
              "Flat link list renders top-level links only, e.g. footer link columns.",
              "kotlinskidev"
            )}
            value={attributes.displayMode}
            options={displayModeOptions}
            onChange={(displayMode) => setAttributes({ displayMode: displayMode as DisplayMode })}
          />
          <SelectControl
            label={__("Overlay mode", "kotlinskidev")}
            value={attributes.overlayMenu}
            options={overlayMenuOptions}
            onChange={(overlayMenu) => setAttributes({ overlayMenu: overlayMenu as OverlayMenu })}
          />
          <SelectControl
            label={__("Visibility", "kotlinskidev")}
            help={__("Choose on which screen sizes this navigation renders.", "kotlinskidev")}
            value={attributes.visibility}
            options={visibilityOptions}
            onChange={(visibility) => setAttributes({ visibility: visibility as Visibility })}
          />
          {attributes.overlayMenu === "always" && (
            <>
              <SelectControl
                label={__("Overlay slide direction", "kotlinskidev")}
                value={attributes.overlaySlide}
                options={overlaySlideOptions}
                onChange={(overlaySlide) =>
                  setAttributes({ overlaySlide: overlaySlide as HorizontalSide })
                }
              />
              <SelectControl
                label={__("Hamburger short line alignment", "kotlinskidev")}
                value={attributes.hamburgerLineAlign}
                options={hamburgerLineAlignOptions}
                onChange={(hamburgerLineAlign) =>
                  setAttributes({ hamburgerLineAlign: hamburgerLineAlign as HorizontalSide })
                }
              />
              <ToggleControl
                label={__("Show hamburger border", "kotlinskidev")}
                help={__(
                  "Adds a border around the hamburger icon button. Applies the same way whether this block is placed as the desktop or mobile hamburger.",
                  "kotlinskidev"
                )}
                checked={attributes.showHamburgerBorder}
                onChange={(showHamburgerBorder) => setAttributes({ showHamburgerBorder })}
                __nextHasNoMarginBottom
              />
              <ToggleControl
                label={__("Hide accordion dividers", "kotlinskidev")}
                help={__(
                  "Removes the divider lines between items in the hamburger panel, including nested accordion children. Doesn't change content or expand/collapse behavior.",
                  "kotlinskidev"
                )}
                checked={attributes.hideAccordionDividers}
                onChange={(hideAccordionDividers) => setAttributes({ hideAccordionDividers })}
                __nextHasNoMarginBottom
              />
            </>
          )}
          <ToggleControl
            label={__("Navigate top-level links on click", "kotlinskidev")}
            help={__(
              "When on, clicking a link with a real URL navigates to it. Links with '#' or no URL still toggle the panel.",
              "kotlinskidev"
            )}
            checked={attributes.linkNavigatesOnClick}
            onChange={(linkNavigatesOnClick) => setAttributes({ linkNavigatesOnClick })}
          />
        </PanelBody>
        {attributes.overlayMenu === "never" && attributes.displayMode === "mega" && (
          <PanelBody title={__("Blur Inactive Links on Hover", "kotlinskidev")} initialOpen={false}>
            <ToggleControl
              label={__("Blur inactive links on hover", "kotlinskidev")}
              help={__(
                "Hovering one top-level link dims and blurs the rest of the bar. Turn off anytime to revert.",
                "kotlinskidev"
              )}
              checked={attributes.blurInactiveLinks}
              onChange={(blurInactiveLinks) => setAttributes({ blurInactiveLinks })}
              __nextHasNoMarginBottom
            />
            {attributes.blurInactiveLinks && (
              <>
                <ToggleControl
                  label={__("Include search & language", "kotlinskidev")}
                  help={__(
                    "Off: only dropdown links (nav links/submenus) blur. On: the search and language items blur and trigger the effect too.",
                    "kotlinskidev"
                  )}
                  checked={attributes.blurIncludeUtility}
                  onChange={(blurIncludeUtility) => setAttributes({ blurIncludeUtility })}
                  __nextHasNoMarginBottom
                />
                <BlurAmountControl
                  value={attributes.blurAmount || BLUR_AMOUNT_DEFAULT_VALUE}
                  onChange={(blurAmount) => setAttributes({ blurAmount })}
                />
              </>
            )}
          </PanelBody>
        )}
      </InspectorControls>
      <span className="kt-nav-placeholder__icon dashicons dashicons-menu" />
      <span className="kt-nav-placeholder__label">{__("Navigation", "kotlinskidev")}</span>
    </div>
  );
}

registerBlockType<NavigationAttributes>("kotlinskidev/navigation", {
  title: "Navigation",
  category: "kotlinskidev",
  attributes: {
    menuSlug: { type: "string", default: "" },
    overlayMenu: { type: "string", default: "never" },
    displayMode: { type: "string", default: "mega" },
    visibility: { type: "string", default: "all" },
    overlaySlide: { type: "string", default: "right" },
    hamburgerLineAlign: { type: "string", default: "right" },
    className: { type: "string", default: "" },
    linkNavigatesOnClick: { type: "boolean", default: false },
    showHamburgerBorder: { type: "boolean", default: false },
    hideAccordionDividers: { type: "boolean", default: false },
    blurInactiveLinks: { type: "boolean", default: false },
    blurAmount: { type: "string", default: "" },
    blurIncludeUtility: { type: "boolean", default: false },
  },
  edit: Edit,
  save() {
    return null;
  },
});

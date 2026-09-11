import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

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
  },
  edit: Edit,
  save() {
    return null;
  },
});

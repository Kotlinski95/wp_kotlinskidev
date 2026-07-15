import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl, ToggleControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

type OverlayMenu = "never" | "mobile" | "always";
type DisplayMode = "mega" | "list" | "bar";

interface NavigationPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

interface NavigationAttributes {
  menuSlug: string;
  overlayMenu: OverlayMenu;
  displayMode: DisplayMode;
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

registerBlockType<NavigationAttributes>("kotlinskidev/navigation", {
  title: "Navigation",
  category: "kotlinskidev",
  attributes: {
    menuSlug: { type: "string", default: "" },
    overlayMenu: { type: "string", default: "never" },
    displayMode: { type: "string", default: "mega" },
    className: { type: "string", default: "" },
    linkNavigatesOnClick: { type: "boolean", default: false },
  },
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: "kt-nav-placeholder" });

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
        <code className="kt-nav-placeholder__slug">
          {attributes.menuSlug || __("(no slug)", "kotlinskidev")}
        </code>
        <span className="kt-nav-placeholder__mode">{attributes.displayMode}</span>
      </div>
    );
  },
  save() {
    return null;
  },
});

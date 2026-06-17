import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps } from "@wordpress/block-editor";
import { PanelBody, SelectControl } from "@wordpress/components";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";

type OverlayMenu = "never" | "mobile" | "always";

interface NavigationPost {
  id: number;
  slug: string;
  title: { rendered: string };
}

interface NavigationAttributes {
  menuSlug: string;
  overlayMenu: OverlayMenu;
  className: string;
}

const overlayMenuOptions = [
  { label: __("Never — always inline", "kotlinskidev"), value: "never" },
  { label: __("On mobile only", "kotlinskidev"), value: "mobile" },
  { label: __("Always — hamburger", "kotlinskidev"), value: "always" },
];

registerBlockType<NavigationAttributes>("kotlinskidev/navigation", {
  title: "Navigation",
  category: "kotlinskidev",
  attributes: {
    menuSlug: { type: "string", default: "" },
    overlayMenu: { type: "string", default: "never" },
    className: { type: "string", default: "" },
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
              label={__("Overlay mode", "kotlinskidev")}
              value={attributes.overlayMenu}
              options={overlayMenuOptions}
              onChange={(overlayMenu) => setAttributes({ overlayMenu: overlayMenu as OverlayMenu })}
            />
          </PanelBody>
        </InspectorControls>
        <span className="kt-nav-placeholder__icon dashicons dashicons-menu" />
        <span className="kt-nav-placeholder__label">{__("Navigation", "kotlinskidev")}</span>
        <code className="kt-nav-placeholder__slug">
          {attributes.menuSlug || __("(no slug)", "kotlinskidev")}
        </code>
      </div>
    );
  },
  save() {
    return null;
  },
});

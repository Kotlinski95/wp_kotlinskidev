import React from "react";
import { registerBlockType } from "@wordpress/blocks";
import { InspectorControls, useBlockProps, useSettings } from "@wordpress/block-editor";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import { selectCoreEntityRecords } from "@utils/core-entity-records";
import type { PaletteColor } from "./bar-background";
import { visibilityClassMap } from "./navigation-options";
import { BlurPanel, NavigationPanel } from "./navigation-panels";
import type {
  NavigationAttributes,
  NavigationPanelProps,
  NavigationPost,
} from "./navigation-types";

export type { NavigationAttributes } from "./navigation-types";

const NAVIGATION_POSTS_QUERY = { per_page: 100, status: "publish" };

const buildMenuOptions = (navigationPosts: NavigationPost[] | null) => [
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

const useNavigationMenuOptions = () => {
  const navigationPosts = useSelect((select) => {
    return selectCoreEntityRecords<NavigationPost>(select, {
      kind: "postType",
      name: "wp_navigation",
      query: NAVIGATION_POSTS_QUERY,
    });
  }, []);
  return buildMenuOptions(navigationPosts);
};

const useThemePaletteColors = (): PaletteColor[] => {
  const [themePalette = [], defaultPalette = []] = useSettings(
    "color.palette.theme",
    "color.palette.default"
  ) as [PaletteColor[] | undefined, PaletteColor[] | undefined];
  return [...themePalette, ...defaultPalette];
};

export function Edit({ attributes, setAttributes }: NavigationPanelProps) {
  const blockProps = useBlockProps({
    className: ["kt-nav-placeholder", visibilityClassMap[attributes.visibility]]
      .filter(Boolean)
      .join(" "),
  });
  const paletteColors = useThemePaletteColors();
  const menuOptions = useNavigationMenuOptions();
  const showBlurPanel = attributes.overlayMenu === "never" && attributes.displayMode === "mega";

  return (
    <div {...blockProps}>
      <InspectorControls>
        <NavigationPanel
          attributes={attributes}
          setAttributes={setAttributes}
          paletteColors={paletteColors}
          menuOptions={menuOptions}
        />
        {showBlurPanel && <BlurPanel attributes={attributes} setAttributes={setAttributes} />}
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
    barSolidBackground: { type: "string", default: "" },
  },
  edit: Edit,
  save() {
    return null;
  },
});

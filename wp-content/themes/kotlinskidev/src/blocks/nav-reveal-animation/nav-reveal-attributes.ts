import { appendClassName } from "@utils/block-filter-types";
import type { BlockSettings, ExtraProps } from "@utils/block-filter-types";

export interface NavRevealAttributes {
  navRevealAnimation?: string;
  navRevealDelay?: number;
  navRevealTranslate?: string;
}

export const NAME_SCOPED_BLOCKS = [
  "core/navigation-link",
  "core/navigation-submenu",
  "kotlinskidev/nav-link",
  "kotlinskidev/nav-banner",
  "kotlinskidev/nav-image",
  "kotlinskidev/nav-paragraph",
  "kotlinskidev/nav-search-panel",
  "kotlinskidev/nav-language-panel",
  "kotlinskidev/nav-popular-pages",
  "kotlinskidev/social-section",
  "kotlinskidev/search-panel",
  "kotlinskidev/language-panel",
];

export const NAVIGATION_ANCESTOR_GATED_BLOCKS = ["kotlinskidev/button"];

const ALL_SCOPED_BLOCKS = [...NAME_SCOPED_BLOCKS, ...NAVIGATION_ANCESTOR_GATED_BLOCKS];

export const addNavRevealAttribute = (settings: BlockSettings): BlockSettings => {
  if (!ALL_SCOPED_BLOCKS.includes(settings.name as string)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      navRevealAnimation: {
        type: "string",
        default: "",
      },
      navRevealDelay: {
        type: "number",
        default: 0,
      },
      navRevealTranslate: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
};

export const applyNavRevealProps = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: NavRevealAttributes
): ExtraProps => {
  const { navRevealAnimation, navRevealDelay, navRevealTranslate } = attributes;

  if (!navRevealAnimation) {
    return extraProps;
  }

  const classes = [navRevealAnimation];

  if (navRevealTranslate) {
    classes.push(navRevealTranslate);
  }

  appendClassName(extraProps, classes.join(" "));

  if (navRevealDelay) {
    extraProps.style = {
      ...extraProps.style,
      "--reveal-delay": `${navRevealDelay}ms`,
    };
  }

  return extraProps;
};

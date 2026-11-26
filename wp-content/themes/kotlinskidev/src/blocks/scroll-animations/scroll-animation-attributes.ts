import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import { appendClassName } from "@utils/block-filter-types";
import type { BlockSettings, ExtraProps } from "@utils/block-filter-types";

export interface ScrollAnimationAttributes {
  scrollAnimation?: string;
  scrollAnimationDelay?: string;
  scrollAnimationTranslate?: string;
}

const EXCLUDED_BLOCKS = [
  "core/html",
  "core/code",
  "core/preformatted",
  "core/verse",
  ...DYNAMIC_PREVIEW_BLOCKS,
];

export const isScrollAnimationExcludedBlock = (name: string | undefined): boolean =>
  EXCLUDED_BLOCKS.includes(name as string);

export const addScrollAnimationAttribute = (settings: BlockSettings): BlockSettings => {
  if (isScrollAnimationExcludedBlock(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      scrollAnimation: {
        type: "string",
        default: "",
      },
      scrollAnimationDelay: {
        type: "string",
        default: "",
      },
      scrollAnimationTranslate: {
        type: "string",
        default: "",
      },
    };
  }

  return settings;
};

export const applyScrollAnimationClass = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: ScrollAnimationAttributes
): ExtraProps => {
  const { scrollAnimation, scrollAnimationDelay, scrollAnimationTranslate } = attributes;

  const classes = [scrollAnimation, scrollAnimationDelay, scrollAnimationTranslate].filter(
    Boolean
  ) as string[];

  if (classes.length > 0) {
    appendClassName(extraProps, classes.join(" "));
  }

  return extraProps;
};

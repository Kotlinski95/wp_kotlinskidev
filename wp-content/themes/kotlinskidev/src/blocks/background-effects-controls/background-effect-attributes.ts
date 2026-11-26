import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import type { BlockSettings, ExtraProps } from "@utils/block-filter-types";

export interface BackgroundEffectAttributes {
  backgroundEffect?: string;
  backgroundEffectColor1?: string;
  backgroundEffectColor2?: string;
  backgroundEffectColor3?: string;
  backgroundEffectPresetId?: number;
  style?: { border?: { width?: unknown } };
}

const GLOW_BORDER_EFFECT = "kt-bg-fx-glow-border";

const EXCLUDED_BLOCKS = [
  "core/html",
  "core/code",
  "core/preformatted",
  "core/verse",
  ...DYNAMIC_PREVIEW_BLOCKS,
];

export const isBackgroundEffectExcludedBlock = (name: string | undefined): boolean =>
  EXCLUDED_BLOCKS.includes(name as string);

export const addBackgroundEffectAttribute = (settings: BlockSettings): BlockSettings => {
  if (isBackgroundEffectExcludedBlock(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      backgroundEffect: {
        type: "string",
        default: "",
      },
      backgroundEffectColor1: {
        type: "string",
        default: "",
      },
      backgroundEffectColor2: {
        type: "string",
        default: "",
      },
      backgroundEffectColor3: {
        type: "string",
        default: "",
      },
      backgroundEffectPresetId: {
        type: "number",
        default: 0,
      },
    };
  }

  return settings;
};

export const applyBackgroundEffectClass = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: BackgroundEffectAttributes
): ExtraProps => {
  const {
    backgroundEffect,
    backgroundEffectColor1,
    backgroundEffectColor2,
    backgroundEffectColor3,
    backgroundEffectPresetId,
  } = attributes;

  if (backgroundEffectPresetId) {
    return extraProps;
  }

  const classes = [extraProps.className, backgroundEffect].filter(Boolean);

  if (classes.length) {
    extraProps.className = classes.join(" ");
  }

  const borderWidth = attributes?.style?.border?.width;
  const passBorderWidth =
    backgroundEffect === GLOW_BORDER_EFFECT && typeof borderWidth === "string" && borderWidth;

  if (
    backgroundEffect &&
    (backgroundEffectColor1 || backgroundEffectColor2 || backgroundEffectColor3 || passBorderWidth)
  ) {
    extraProps.style = {
      ...extraProps.style,
      ...(backgroundEffectColor1 && { "--kt-bg-fx-color-1": backgroundEffectColor1 }),
      ...(backgroundEffectColor2 && { "--kt-bg-fx-color-2": backgroundEffectColor2 }),
      ...(backgroundEffectColor3 && { "--kt-bg-fx-color-3": backgroundEffectColor3 }),
      ...(passBorderWidth && { "--kt-bg-fx-border-width": borderWidth }),
    };
  }

  return extraProps;
};

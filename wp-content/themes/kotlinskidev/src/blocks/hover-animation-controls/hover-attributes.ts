import { DYNAMIC_PREVIEW_BLOCKS } from "@utils/dynamic-preview-blocks";
import type { BlockSettings } from "@utils/block-filter-types";

const HOVER_EFFECTS_SUPPORTED_DYNAMIC_BLOCKS = ["kotlinskidev/certificate"];

const EXCLUDED_BLOCKS = [
  "core/html",
  "core/code",
  "core/preformatted",
  "core/verse",
  ...DYNAMIC_PREVIEW_BLOCKS.filter(
    (name) => !HOVER_EFFECTS_SUPPORTED_DYNAMIC_BLOCKS.includes(name)
  ),
];

export const DEFAULT_OPACITY_FROM = 100;
export const DEFAULT_OPACITY_TO = 50;

export interface HoverAnimationAttributes {
  hoverAnimation?: string;
  hoverAnimationExtra?: string[];
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  hoverOpacityEnabled?: boolean;
  hoverOpacityFrom?: number;
  hoverOpacityTo?: number;
  hoverBorderColor?: string;
  hoverEnhancedGlow?: boolean;
  inViewHover?: boolean;
  style?: { border?: { radius?: unknown } };
}

export const isHoverExcludedBlock = (name: string | undefined): boolean =>
  EXCLUDED_BLOCKS.includes(name as string);

const buildAnimationAndColorDefinitions = () => ({
  hoverAnimation: {
    type: "string",
    default: "",
  },
  hoverAnimationExtra: {
    type: "array",
    default: [],
    items: { type: "string" },
  },
  hoverBackgroundColor: {
    type: "string",
    default: "",
  },
  hoverTextColor: {
    type: "string",
    default: "",
  },
});

const buildOpacityDefinitions = () => ({
  hoverOpacityEnabled: {
    type: "boolean",
    default: false,
  },
  hoverOpacityFrom: {
    type: "number",
    default: DEFAULT_OPACITY_FROM,
  },
  hoverOpacityTo: {
    type: "number",
    default: DEFAULT_OPACITY_TO,
  },
});

const buildBorderAndGlowDefinitions = () => ({
  hoverBorderColor: {
    type: "string",
    default: "",
  },
  hoverEnhancedGlow: {
    type: "boolean",
    default: false,
  },
  inViewHover: {
    type: "boolean",
    default: true,
  },
});

const buildHoverAttributeDefinitions = () => ({
  ...buildAnimationAndColorDefinitions(),
  ...buildOpacityDefinitions(),
  ...buildBorderAndGlowDefinitions(),
});

export const addHoverAnimationAttribute = (settings: BlockSettings): BlockSettings => {
  if (isHoverExcludedBlock(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      ...buildHoverAttributeDefinitions(),
    };
  }

  return settings;
};

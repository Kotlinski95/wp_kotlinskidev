import { appendClassName } from "@utils/block-filter-types";
import type { BlockSettings, ExtraProps } from "@utils/block-filter-types";

export interface CounterAnimationAttributes {
  enableCounter?: boolean;
  counterDuration?: string;
  counterCustomDuration?: number;
  counterEasing?: string;
}

export const DEFAULT_COUNTER_DURATION_MS = 2000;
export const DEFAULT_COUNTER_EASING = "easeOut";
const CUSTOM_DURATION = "custom";

const SUPPORTED_BLOCKS = [
  "core/heading",
  "core/paragraph",
  "core/group",
  "core/column",
  "core/columns",
  "core/cover",
];

export const supportsCounterAnimation = (name: string | undefined): boolean =>
  SUPPORTED_BLOCKS.includes(name as string);

export const addCounterAnimationAttribute = (settings: BlockSettings): BlockSettings => {
  if (!supportsCounterAnimation(settings.name)) {
    return settings;
  }

  if (typeof settings.attributes !== "undefined") {
    settings.attributes = {
      ...settings.attributes,
      enableCounter: {
        type: "boolean",
        default: false,
      },
      counterDuration: {
        type: "string",
        default: "2000",
      },
      counterCustomDuration: {
        type: "number",
        default: DEFAULT_COUNTER_DURATION_MS,
      },
      counterEasing: {
        type: "string",
        default: DEFAULT_COUNTER_EASING,
      },
    };
  }

  return settings;
};

export const applyCounterAnimationClass = (
  extraProps: ExtraProps,
  _blockType: unknown,
  attributes: CounterAnimationAttributes
): ExtraProps => {
  const { enableCounter, counterDuration, counterCustomDuration, counterEasing } = attributes;

  if (enableCounter) {
    appendClassName(extraProps, "animated-counter");

    extraProps["data-counter-duration"] =
      counterDuration === CUSTOM_DURATION
        ? counterCustomDuration || DEFAULT_COUNTER_DURATION_MS
        : counterDuration || DEFAULT_COUNTER_DURATION_MS;
    extraProps["data-counter-easing"] = counterEasing || DEFAULT_COUNTER_EASING;
  }

  return extraProps;
};

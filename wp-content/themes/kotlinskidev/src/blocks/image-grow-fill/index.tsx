import { addFilter } from "@wordpress/hooks";

const SELF_STRETCH_BLOCKS = ["core/image"];
const FIXED_SELF_STRETCH_VALUES = ["fixedNoShrink", "fixed"];

interface SaveContentExtraProps {
  className?: string;
  style?: Record<string, unknown>;
  [key: string]: unknown;
}

interface SaveBlockType {
  name?: string;
}

interface SelfStretchAttributes {
  style?: {
    layout?: {
      selfStretch?: string;
      flexSize?: string;
    };
  };
}

function applySelfStretchProps(
  extraProps: SaveContentExtraProps,
  blockType: SaveBlockType,
  attributes: SelfStretchAttributes
): SaveContentExtraProps {
  if (!SELF_STRETCH_BLOCKS.includes(blockType.name ?? "")) {
    return extraProps;
  }

  const selfStretch = attributes.style?.layout?.selfStretch;
  const flexSize = attributes.style?.layout?.flexSize;

  let className: string | undefined;

  if (selfStretch === "fill") {
    className = "has-self-stretch-fill";
  } else if (selfStretch && FIXED_SELF_STRETCH_VALUES.includes(selfStretch) && flexSize) {
    className = "has-self-stretch-fixed";
    extraProps.style = {
      ...extraProps.style,
      "--kt-self-stretch-width": flexSize,
    };
  }

  if (!className) {
    return extraProps;
  }

  extraProps.className = extraProps.className ? `${extraProps.className} ${className}` : className;

  return extraProps;
}

addFilter(
  "blocks.getSaveContent.extraProps",
  "kotlinskidev/image-self-stretch-props",
  applySelfStretchProps
);

import { addFilter } from "@wordpress/hooks";

interface BlockSettings {
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

function addCoverLazyLoadingAttribute(settings: BlockSettings, name: string): BlockSettings {
  if (name !== "core/cover" && name !== "core/image") {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      kotlinskidevSkipLazy: {
        type: "boolean",
        default: false,
      },
    },
  };
}

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/cover-lazy-loading-attribute",
  addCoverLazyLoadingAttribute
);

import { addFilter } from "@wordpress/hooks";
import React, { Fragment } from "react";
import { InspectorControls } from "@wordpress/block-editor";
import { createHigherOrderComponent } from "@wordpress/compose";
import { useSelect } from "@wordpress/data";
import { __ } from "@wordpress/i18n";
import registry from "./blocks.json";
import ResponsiveMediaPanel, { type ResponsiveMedia } from "./panel";

export { resolveResponsiveMedia } from "./panel";

type Adapter = "image" | "cover" | "video" | "hero-slide" | "device-frame";

interface ResponsiveAttributes {
  responsiveMedia?: ResponsiveMedia;
  [key: string]: unknown;
}

interface BlockEditProps {
  name: string;
  attributes: ResponsiveAttributes;
  setAttributes: (attributes: Partial<ResponsiveAttributes>) => void;
  [key: string]: unknown;
}

interface BlockSettings {
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface AdapterConfig {
  url: (attributes: ResponsiveAttributes) => string;
  mediaId: (attributes: ResponsiveAttributes) => number;
  allowedTypes: (attributes: ResponsiveAttributes) => string[];
  label: string;
  hasAlphaVideo?: (attributes: ResponsiveAttributes) => boolean;
}

interface CoreStore {
  getMedia?: (id: number) => { media_details?: { width?: number } } | undefined;
}

const VIDEO_EXTENSION = /\.(mp4|webm|mov|m4v|ogv)(\?|$)/i;

const text = (value: unknown): string => (typeof value === "string" ? value : "");
const numeric = (value: unknown): number => (typeof value === "number" ? value : 0);

const ADAPTERS: Record<Adapter, AdapterConfig> = {
  image: {
    url: (a) => text(a.url),
    mediaId: (a) => numeric(a.id),
    allowedTypes: () => ["image"],
    label: __("Image", "kotlinskidev"),
  },
  cover: {
    url: (a) => text(a.url),
    mediaId: (a) => numeric(a.id),
    allowedTypes: (a) => [a.backgroundType === "video" ? "video" : "image"],
    label: __("Cover media", "kotlinskidev"),
  },
  video: {
    url: (a) => text(a.src),
    mediaId: (a) => numeric(a.id),
    allowedTypes: () => ["video"],
    label: __("Video", "kotlinskidev"),
  },
  "hero-slide": {
    url: (a) => text(a.bgVideoUrl) || text(a.bgImageUrl),
    mediaId: (a) => (text(a.bgVideoUrl) ? numeric(a.bgVideoId) : numeric(a.bgImageId)),
    allowedTypes: (a) => [text(a.bgVideoUrl) ? "video" : "image"],
    label: __("Slide media", "kotlinskidev"),
    hasAlphaVideo: (a) => Boolean(text(a.bgVideoUrl) && text(a.bgVideoAlphaUrl)),
  },
  "device-frame": {
    url: (a) => text(a.imageUrl),
    mediaId: (a) => numeric(a.imageId),
    allowedTypes: (a) => [VIDEO_EXTENSION.test(text(a.imageUrl)) ? "video" : "image"],
    label: __("Screen media", "kotlinskidev"),
  },
};

const BLOCKS = registry as Record<string, Adapter>;

const addResponsiveMediaAttribute = (settings: BlockSettings, name: string): BlockSettings => {
  if (!name.startsWith("core/") || !BLOCKS[name]) {
    return settings;
  }

  return {
    ...settings,
    attributes: {
      ...settings.attributes,
      responsiveMedia: { type: "object", default: {} },
    },
  };
};

const useDesktopWidth = (mediaId: number): number | undefined =>
  useSelect(
    (select) => {
      if (!mediaId) {
        return undefined;
      }
      const store = (select as unknown as (name: string) => CoreStore | undefined)("core");
      return store?.getMedia?.(mediaId)?.media_details?.width;
    },
    [mediaId]
  );

const withResponsiveMediaControls = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<BlockEditProps>) => {
    const ResponsiveMediaControls = (props: BlockEditProps) => {
      const { name, attributes, setAttributes } = props;
      const adapter = BLOCKS[name] ? ADAPTERS[BLOCKS[name]] : undefined;
      const desktopUrl = adapter ? adapter.url(attributes) : "";
      const desktopWidth = useDesktopWidth(adapter ? adapter.mediaId(attributes) : 0);

      if (!adapter || !desktopUrl) {
        return <BlockEdit {...props} />;
      }

      return (
        <Fragment>
          <BlockEdit {...props} />
          <InspectorControls>
            <ResponsiveMediaPanel
              slots={attributes.responsiveMedia ?? {}}
              onChange={(responsiveMedia) => setAttributes({ responsiveMedia })}
              allowedTypes={adapter.allowedTypes(attributes)}
              desktopLabel={adapter.label}
              desktopUrl={desktopUrl}
              desktopWidth={desktopWidth}
              hasAlphaVideo={adapter.hasAlphaVideo?.(attributes) ?? false}
            />
          </InspectorControls>
        </Fragment>
      );
    };
    return ResponsiveMediaControls;
  },
  "withResponsiveMediaControls"
);

addFilter(
  "blocks.registerBlockType",
  "kotlinskidev/responsive-media-attribute",
  addResponsiveMediaAttribute
);

addFilter(
  "editor.BlockEdit",
  "kotlinskidev/responsive-media-controls",
  withResponsiveMediaControls
);

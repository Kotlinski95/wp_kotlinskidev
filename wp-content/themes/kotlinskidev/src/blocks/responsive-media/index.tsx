import { addFilter } from "@wordpress/hooks";
import { __ } from "@wordpress/i18n";
import React, { Fragment } from "react";
import { InspectorControls, MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { BaseControl, Button, PanelBody } from "@wordpress/components";
import { createHigherOrderComponent } from "@wordpress/compose";

type SlotName = "mobile" | "tablet";

interface MediaSlot {
  id?: number;
  url: string;
}

type ResponsiveMedia = Partial<Record<SlotName, MediaSlot>>;

interface CoverAttributes {
  url?: string;
  backgroundType?: string;
  responsiveMedia?: ResponsiveMedia;
  [key: string]: unknown;
}

interface BlockEditProps {
  name: string;
  attributes: CoverAttributes;
  setAttributes: (attributes: Partial<CoverAttributes>) => void;
  [key: string]: unknown;
}

interface BlockSettings {
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

interface PickedMedia {
  id?: number;
  url: string;
}

const COVER_BLOCK = "core/cover";
const SLOTS: { name: SlotName; label: string }[] = [
  { name: "mobile", label: __("Mobile", "kotlinskidev") },
  { name: "tablet", label: __("Tablet", "kotlinskidev") },
];

export const resolveResponsiveMedia = (desktopUrl: string, slots: ResponsiveMedia) => {
  const tablet = slots.tablet?.url || desktopUrl;
  const mobile = slots.mobile?.url || tablet;
  return { desktop: desktopUrl, tablet, mobile };
};

const fileName = (url: string): string => decodeURIComponent(url.split("/").pop() ?? url);

const addResponsiveMediaAttribute = (settings: BlockSettings, name: string): BlockSettings => {
  if (name !== COVER_BLOCK) {
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

const withResponsiveMediaControls = createHigherOrderComponent(
  (BlockEdit: React.ComponentType<BlockEditProps>) => {
    const ResponsiveMediaControls = (props: BlockEditProps) => {
      const { name, attributes, setAttributes } = props;
      const mediaType = attributes.backgroundType === "video" ? "video" : "image";

      if (name !== COVER_BLOCK || !attributes.url) {
        return <BlockEdit {...props} />;
      }

      const slots = attributes.responsiveMedia ?? {};
      const resolved = resolveResponsiveMedia(attributes.url, slots);

      const setSlot = (slot: SlotName, media: MediaSlot | null) => {
        const next: ResponsiveMedia = { ...slots };
        if (media) {
          next[slot] = media;
        } else {
          delete next[slot];
        }
        setAttributes({ responsiveMedia: next });
      };

      const describe = (device: "mobile" | "tablet" | "desktop"): string =>
        resolved[device] === attributes.url
          ? __("Cover media", "kotlinskidev")
          : fileName(resolved[device]);

      return (
        <Fragment>
          <BlockEdit {...props} />
          <InspectorControls>
            <PanelBody title={__("Responsive media", "kotlinskidev")} initialOpen={false}>
              <p className="components-base-control__help">
                {__(
                  "The Cover's own media is used on desktop. Add a different file for tablet or mobile; an empty slot uses the next larger one.",
                  "kotlinskidev"
                )}
              </p>
              {mediaType === "video" ? (
                <p className="components-base-control__help">
                  {__(
                    "A video's poster is its featured image in the Media Library. Each slot uses its own video's poster.",
                    "kotlinskidev"
                  )}
                </p>
              ) : null}
              {SLOTS.map(({ name: slotName, label }) => {
                const slot = slots[slotName];
                return (
                  <BaseControl key={slotName} label={label} id={`kt-responsive-media-${slotName}`}>
                    <MediaUploadCheck>
                      <MediaUpload
                        allowedTypes={[mediaType]}
                        value={slot?.id}
                        onSelect={(media: PickedMedia) =>
                          setSlot(slotName, { id: media.id, url: media.url })
                        }
                        render={({ open }: { open: () => void }) => (
                          <div className="kt-responsive-media-slot">
                            {slot ? <span>{fileName(slot.url)}</span> : null}
                            <Button variant="secondary" onClick={open}>
                              {slot
                                ? __("Replace", "kotlinskidev")
                                : __("Select media", "kotlinskidev")}
                            </Button>
                            {slot ? (
                              <Button
                                variant="link"
                                isDestructive
                                onClick={() => setSlot(slotName, null)}
                              >
                                {__("Remove", "kotlinskidev")}
                              </Button>
                            ) : null}
                          </div>
                        )}
                      />
                    </MediaUploadCheck>
                  </BaseControl>
                );
              })}
              <p className="components-base-control__help">
                {__("Mobile uses:", "kotlinskidev")} {describe("mobile")}
                <br />
                {__("Tablet uses:", "kotlinskidev")} {describe("tablet")}
                <br />
                {__("Desktop uses:", "kotlinskidev")} {describe("desktop")}
              </p>
            </PanelBody>
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

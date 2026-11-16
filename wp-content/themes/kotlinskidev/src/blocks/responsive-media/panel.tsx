import { __ } from "@wordpress/i18n";
import React from "react";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { BaseControl, Button, Notice, PanelBody } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";

export type SlotName = "mobile" | "tablet";

export interface MediaSlot {
  id?: number;
  url: string;
  alphaId?: number;
  alphaUrl?: string;
  type?: string;
  posterId?: number;
  posterUrl?: string;
  width?: number;
}

export type ResponsiveMedia = Partial<Record<SlotName, MediaSlot>>;

export interface PickedMedia {
  id?: number;
  url: string;
  type?: string;
  width?: number;
}

interface MediaRecord {
  featured_media?: number;
  source_url?: string;
}

export interface ResponsiveMediaPanelProps {
  slots: ResponsiveMedia;
  onChange: (next: ResponsiveMedia) => void;
  allowedTypes: string[];
  desktopLabel: string;
  desktopUrl: string;
  desktopWidth?: number;
  hasAlphaVideo?: boolean;
  helpText?: string;
}

const SLOTS: { name: SlotName; label: string }[] = [
  { name: "mobile", label: __("Mobile", "kotlinskidev") },
  { name: "tablet", label: __("Tablet", "kotlinskidev") },
];

export const resolveResponsiveMedia = (desktopUrl: string, slots: ResponsiveMedia) => {
  const tablet = slots.tablet?.url || desktopUrl;
  const mobile = slots.mobile?.url || tablet;
  return { desktop: desktopUrl, tablet, mobile };
};

export const fileName = (url: string): string => decodeURIComponent(url.split("/").pop() ?? url);

export const fetchFeaturedPoster = async (
  mediaId: number
): Promise<Pick<MediaSlot, "posterId" | "posterUrl">> => {
  try {
    const media = await apiFetch<MediaRecord>({
      path: `/wp/v2/media/${mediaId}?_fields=featured_media`,
    });
    if (!media.featured_media) {
      return {};
    }
    const poster = await apiFetch<MediaRecord>({
      path: `/wp/v2/media/${media.featured_media}?_fields=source_url`,
    });
    return poster.source_url
      ? { posterId: media.featured_media, posterUrl: poster.source_url }
      : {};
  } catch {
    return {};
  }
};

export default function ResponsiveMediaPanel({
  slots,
  onChange,
  allowedTypes,
  desktopLabel,
  desktopUrl,
  desktopWidth,
  hasAlphaVideo = false,
  helpText,
}: ResponsiveMediaPanelProps) {
  const resolved = resolveResponsiveMedia(desktopUrl, slots);
  const isVideo = allowedTypes.includes("video");

  const setSlot = (slot: SlotName, media: MediaSlot | null) => {
    const next: ResponsiveMedia = { ...slots };
    if (media) {
      next[slot] = media;
    } else {
      delete next[slot];
    }
    onChange(next);
  };

  const selectMedia = async (slot: SlotName, picked: PickedMedia) => {
    const media: MediaSlot = { id: picked.id, url: picked.url };
    if (picked.type) {
      media.type = picked.type;
    }
    if (picked.width) {
      media.width = picked.width;
    }
    if (picked.id && picked.type === "video") {
      Object.assign(media, await fetchFeaturedPoster(picked.id));
    }
    setSlot(slot, media);
  };

  const selectAlphaMedia = (slot: SlotName, picked: PickedMedia) => {
    setSlot(slot, { ...(slots[slot] ?? { url: "" }), alphaId: picked.id, alphaUrl: picked.url });
  };

  const removeAlphaMedia = (slot: SlotName) => {
    const { alphaId, alphaUrl, ...rest } = slots[slot] ?? { url: "" };
    void alphaId;
    void alphaUrl;
    setSlot(slot, rest.url ? rest : null);
  };

  const describe = (device: "mobile" | "tablet" | "desktop"): string =>
    resolved[device] === desktopUrl ? desktopLabel : fileName(resolved[device]);

  const oversized = SLOTS.filter(
    ({ name }) => desktopWidth && slots[name]?.width && (slots[name]?.width ?? 0) > desktopWidth
  );

  return (
    <PanelBody title={__("Responsive media", "kotlinskidev")} initialOpen={false}>
      <p className="components-base-control__help">
        {helpText ??
          __(
            "The block's own media is used on desktop. Add a different file for tablet or mobile; an empty slot uses the next larger one.",
            "kotlinskidev"
          )}
      </p>
      {isVideo ? (
        <p className="components-base-control__help">
          {__(
            "A video's poster is its featured image in the Media Library. It is filled in automatically when you pick a video and can be changed there.",
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
                allowedTypes={allowedTypes}
                value={slot?.id}
                onSelect={(media: PickedMedia) => {
                  void selectMedia(slotName, media);
                }}
                render={({ open }: { open: () => void }) => (
                  <div className="kt-responsive-media-slot">
                    {slot?.url ? <span>{fileName(slot.url)}</span> : null}
                    <Button variant="secondary" onClick={open}>
                      {slot?.url
                        ? __("Replace", "kotlinskidev")
                        : __("Select media", "kotlinskidev")}
                    </Button>
                    {slot?.url ? (
                      <Button variant="link" isDestructive onClick={() => setSlot(slotName, null)}>
                        {__("Remove", "kotlinskidev")}
                      </Button>
                    ) : null}
                  </div>
                )}
              />
            </MediaUploadCheck>
            {hasAlphaVideo ? (
              <MediaUploadCheck>
                <MediaUpload
                  allowedTypes={["video"]}
                  value={slot?.alphaId}
                  onSelect={(media: PickedMedia) => selectAlphaMedia(slotName, media)}
                  render={({ open }: { open: () => void }) => (
                    <div className="kt-responsive-media-slot kt-responsive-media-slot--alpha">
                      <span>
                        {slot?.alphaUrl
                          ? fileName(slot.alphaUrl)
                          : __("Safari HEVC alpha file", "kotlinskidev")}
                      </span>
                      <Button variant="secondary" onClick={open}>
                        {slot?.alphaUrl
                          ? __("Replace Safari HEVC alpha file", "kotlinskidev")
                          : __("Select Safari HEVC alpha file", "kotlinskidev")}
                      </Button>
                      {slot?.alphaUrl ? (
                        <Button
                          variant="link"
                          isDestructive
                          onClick={() => removeAlphaMedia(slotName)}
                        >
                          {__("Remove", "kotlinskidev")}
                        </Button>
                      ) : null}
                    </div>
                  )}
                />
              </MediaUploadCheck>
            ) : null}
          </BaseControl>
        );
      })}
      {oversized.map(({ name, label }) => (
        <Notice key={name} status="warning" isDismissible={false}>
          {label}:{" "}
          {__(
            "this file is larger than the desktop one and will slow down the page.",
            "kotlinskidev"
          )}
        </Notice>
      ))}
      <p className="components-base-control__help">
        {__("Mobile uses:", "kotlinskidev")} {describe("mobile")}
        <br />
        {__("Tablet uses:", "kotlinskidev")} {describe("tablet")}
        <br />
        {__("Desktop uses:", "kotlinskidev")} {describe("desktop")}
      </p>
    </PanelBody>
  );
}

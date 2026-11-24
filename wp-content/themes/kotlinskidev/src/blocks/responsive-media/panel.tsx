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

interface SlotRenderProps {
  open: () => void;
}

interface MediaSlotPickerProps {
  slot: MediaSlot | undefined;
  allowedTypes: string[];
  onSelect: (media: PickedMedia) => void;
  onRemove: () => void;
}

function MediaSlotPicker({ slot, allowedTypes, onSelect, onRemove }: MediaSlotPickerProps) {
  return (
    <MediaUploadCheck>
      <MediaUpload
        allowedTypes={allowedTypes}
        value={slot?.id}
        onSelect={onSelect}
        render={({ open }: SlotRenderProps) => (
          <div className="kt-responsive-media-slot">
            {slot?.url ? <span>{fileName(slot.url)}</span> : null}
            <Button variant="secondary" onClick={open}>
              {slot?.url ? __("Replace", "kotlinskidev") : __("Select media", "kotlinskidev")}
            </Button>
            {slot?.url ? (
              <Button variant="link" isDestructive onClick={onRemove}>
                {__("Remove", "kotlinskidev")}
              </Button>
            ) : null}
          </div>
        )}
      />
    </MediaUploadCheck>
  );
}

interface AlphaSlotPickerProps {
  slot: MediaSlot | undefined;
  onSelect: (media: PickedMedia) => void;
  onRemove: () => void;
}

function AlphaSlotPicker({ slot, onSelect, onRemove }: AlphaSlotPickerProps) {
  return (
    <MediaUploadCheck>
      <MediaUpload
        allowedTypes={["video"]}
        value={slot?.alphaId}
        onSelect={onSelect}
        render={({ open }: SlotRenderProps) => (
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
              <Button variant="link" isDestructive onClick={onRemove}>
                {__("Remove", "kotlinskidev")}
              </Button>
            ) : null}
          </div>
        )}
      />
    </MediaUploadCheck>
  );
}

function useSlotEditing(slots: ResponsiveMedia, onChange: (next: ResponsiveMedia) => void) {
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

  return { setSlot, selectMedia, selectAlphaMedia, removeAlphaMedia };
}

function PanelHelp({ helpText, isVideo }: { helpText?: string; isVideo: boolean }) {
  return (
    <>
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
    </>
  );
}

function OversizedNotices({
  slots,
  desktopWidth,
}: {
  slots: ResponsiveMedia;
  desktopWidth?: number;
}) {
  const oversized = SLOTS.filter(
    ({ name }) => desktopWidth && slots[name]?.width && (slots[name]?.width ?? 0) > desktopWidth
  );
  return (
    <>
      {oversized.map(({ name, label }) => (
        <Notice key={name} status="warning" isDismissible={false}>
          {label}:{" "}
          {__(
            "this file is larger than the desktop one and will slow down the page.",
            "kotlinskidev"
          )}
        </Notice>
      ))}
    </>
  );
}

function ResolvedMediaSummary({
  slots,
  desktopUrl,
  desktopLabel,
}: Pick<ResponsiveMediaPanelProps, "slots" | "desktopUrl" | "desktopLabel">) {
  const resolved = resolveResponsiveMedia(desktopUrl, slots);
  const describe = (device: "mobile" | "tablet" | "desktop"): string =>
    resolved[device] === desktopUrl ? desktopLabel : fileName(resolved[device]);

  return (
    <p className="components-base-control__help">
      {__("Mobile uses:", "kotlinskidev")} {describe("mobile")}
      <br />
      {__("Tablet uses:", "kotlinskidev")} {describe("tablet")}
      <br />
      {__("Desktop uses:", "kotlinskidev")} {describe("desktop")}
    </p>
  );
}

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
  const editing = useSlotEditing(slots, onChange);

  return (
    <PanelBody title={__("Responsive media", "kotlinskidev")} initialOpen={false}>
      <PanelHelp helpText={helpText} isVideo={allowedTypes.includes("video")} />
      {SLOTS.map(({ name: slotName, label }) => (
        <BaseControl key={slotName} label={label} id={`kt-responsive-media-${slotName}`}>
          <MediaSlotPicker
            slot={slots[slotName]}
            allowedTypes={allowedTypes}
            onSelect={(media) => {
              void editing.selectMedia(slotName, media);
            }}
            onRemove={() => editing.setSlot(slotName, null)}
          />
          {hasAlphaVideo ? (
            <AlphaSlotPicker
              slot={slots[slotName]}
              onSelect={(media) => editing.selectAlphaMedia(slotName, media)}
              onRemove={() => editing.removeAlphaMedia(slotName)}
            />
          ) : null}
        </BaseControl>
      ))}
      <OversizedNotices slots={slots} desktopWidth={desktopWidth} />
      <ResolvedMediaSummary slots={slots} desktopUrl={desktopUrl} desktopLabel={desktopLabel} />
    </PanelBody>
  );
}

import React from "react";
import { MediaUpload } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import type { WPMediaItem } from "./slide-attributes";

const FULL_WIDTH_CENTERED = { width: "100%", justifyContent: "center" } as const;

interface MediaPickerButtonProps {
  allowedType: "image" | "video";
  mediaId: number;
  hasMedia: boolean;
  unsetVariant: "primary" | "tertiary";
  setLabel: string;
  changeLabel: string;
  onSelect: (media: WPMediaItem) => void;
}

export const MediaPickerButton = ({
  allowedType,
  mediaId,
  hasMedia,
  unsetVariant,
  setLabel,
  changeLabel,
  onSelect,
}: MediaPickerButtonProps) => (
  <MediaUpload
    onSelect={(item) => onSelect(item as WPMediaItem)}
    allowedTypes={[allowedType]}
    value={mediaId || undefined}
    render={({ open }) => (
      <Button
        variant={hasMedia ? "secondary" : unsetVariant}
        onClick={open}
        style={FULL_WIDTH_CENTERED}
      >
        {hasMedia ? changeLabel : setLabel}
      </Button>
    )}
  />
);

export const RemoveMediaButton = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Button
    variant="tertiary"
    isDestructive
    onClick={onRemove}
    style={{ ...FULL_WIDTH_CENTERED, marginTop: "0.25rem" }}
  >
    {label}
  </Button>
);

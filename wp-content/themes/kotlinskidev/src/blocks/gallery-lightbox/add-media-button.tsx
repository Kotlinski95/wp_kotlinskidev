import React from "react";
import { MediaUpload } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";

interface AddMediaButtonProps {
  hasMedia: boolean;
  emptyLabel: string;
  filledLabel: string;
  onSelect: (selected: unknown) => void;
}

const ALLOWED_MEDIA_TYPES = ["image", "video"];

export const AddMediaButton = ({
  hasMedia,
  emptyLabel,
  filledLabel,
  onSelect,
}: AddMediaButtonProps) => (
  <MediaUpload
    onSelect={onSelect}
    allowedTypes={ALLOWED_MEDIA_TYPES}
    multiple
    value={[]}
    render={({ open }) => (
      <Button
        variant={hasMedia ? "secondary" : "primary"}
        onClick={open}
        style={{
          width: "100%",
          justifyContent: "center",
          marginTop: hasMedia ? "0.5rem" : 0,
        }}
      >
        {hasMedia ? filledLabel : emptyLabel}
      </Button>
    )}
  />
);

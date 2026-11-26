import React from "react";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

interface NavIconMedia {
  id: number;
  url: string;
}

interface NavIconPickerProps {
  iconId: number;
  iconUrl: string;
  onChange: (id: number, url: string) => void;
}

function NavIconControls({
  iconId,
  iconUrl,
  onChange,
  open,
}: NavIconPickerProps & { open: () => void }) {
  return (
    <>
      {iconUrl && (
        <img
          src={iconUrl}
          alt=""
          style={{ width: 24, height: 24, display: "block", marginBottom: "0.5rem" }}
        />
      )}
      <Button
        variant={iconId ? "secondary" : "primary"}
        onClick={open}
        style={{
          width: "100%",
          justifyContent: "center",
          marginBottom: iconId ? "0.25rem" : 0,
        }}
      >
        {iconId ? __("Replace icon", "kotlinskidev") : __("Select SVG icon", "kotlinskidev")}
      </Button>
      {iconId ? (
        <Button variant="link" isDestructive onClick={() => onChange(0, "")}>
          {__("Remove icon", "kotlinskidev")}
        </Button>
      ) : null}
    </>
  );
}

export function NavIconPicker({ iconId, iconUrl, onChange }: NavIconPickerProps) {
  return (
    <MediaUploadCheck>
      <MediaUpload
        onSelect={(media: NavIconMedia) => onChange(media.id, media.url)}
        allowedTypes={["image/svg+xml"]}
        value={iconId}
        render={({ open }: { open: () => void }) => (
          <NavIconControls iconId={iconId} iconUrl={iconUrl} onChange={onChange} open={open} />
        )}
      />
    </MediaUploadCheck>
  );
}

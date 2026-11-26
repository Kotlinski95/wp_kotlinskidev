import React from "react";
import { useSelect } from "@wordpress/data";
import type { DeviceFrameAttributes } from "./attributes";

interface WPMediaRecord {
  mime_type: string;
}

export const useIsVideoMedia = (imageId: number): boolean => {
  const mimeType = useSelect<string>(
    (select) =>
      imageId
        ? ((
            select("core") as {
              getMedia: (id: number) => WPMediaRecord | null;
            }
          ).getMedia(imageId)?.mime_type ?? "")
        : "",
    [imageId]
  );
  return mimeType.startsWith("video/");
};

export const MediaPreview = ({
  attributes,
  isVideo,
}: {
  attributes: DeviceFrameAttributes;
  isVideo: boolean;
}): JSX.Element | null => {
  const { imageUrl, alt, loading, fetchPriority, objectPosition } = attributes;
  if (!imageUrl) {
    return null;
  }
  const previewStyle: React.CSSProperties = objectPosition ? { objectPosition } : {};

  return isVideo ? (
    <video
      className="kt-device-frame__image"
      src={imageUrl}
      style={previewStyle}
      preload={loading === "eager" ? "auto" : "metadata"}
      muted
      loop
      autoPlay
      playsInline
    />
  ) : (
    <img
      className="kt-device-frame__image"
      src={imageUrl}
      alt={alt}
      style={previewStyle}
      loading={loading}
      {...{ fetchpriority: fetchPriority }}
    />
  );
};

import React from "react";
import { MediaUpload, MediaUploadCheck } from "@wordpress/block-editor";
import { Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import type { GalleryMedia } from "./gallery-media";

interface EditorPreviewProps {
  images: GalleryMedia[];
  onSelect: (selected: unknown) => void;
}

const EmptyGalleryPlaceholder = ({ onSelect }: { onSelect: (selected: unknown) => void }) => (
  <MediaUpload
    onSelect={onSelect}
    allowedTypes={["image", "video"]}
    multiple
    value={[]}
    render={({ open }) => (
      <div className="gallery-lightbox-editor gallery-lightbox-editor--empty">
        <span className="dashicons dashicons-format-gallery" />
        <Button variant="primary" onClick={open}>
          {__("Add Images & Videos", "kotlinskidev")}
        </Button>
      </div>
    )}
  />
);

const FirstMediaTrigger = ({ images }: { images: GalleryMedia[] }) => {
  const [first] = images;
  return (
    <div className="gallery-lightbox-editor">
      <div className="gallery-lightbox-trigger" style={{ pointerEvents: "none" }}>
        <img src={first.type === "video" ? first.poster || first.url : first.url} alt={first.alt} />
        {first.type === "video" && (
          <span className="gallery-lightbox-video-badge" aria-hidden="true">
            &#9654;
          </span>
        )}
        {images.length > 1 && <span className="gallery-lightbox-count">+{images.length - 1}</span>}
      </div>
    </div>
  );
};

export const EditorPreview = ({ images, onSelect }: EditorPreviewProps) => (
  <MediaUploadCheck>
    {images.length === 0 ? (
      <EmptyGalleryPlaceholder onSelect={onSelect} />
    ) : (
      <FirstMediaTrigger images={images} />
    )}
  </MediaUploadCheck>
);

import React from "react";
import { __ } from "@wordpress/i18n";
import { sidebarThumbnailSource, type GalleryMedia } from "./gallery-media";

interface MediaSidebarGridProps {
  items: GalleryMedia[];
  onRemove: (id: number) => void;
}

export const MediaSidebarGrid = ({ items, onRemove }: MediaSidebarGridProps) => (
  <div className="gallery-lightbox-sidebar-grid">
    {items.map((item) => (
      <div key={item.id} className="gallery-lightbox-sidebar-item">
        <img src={sidebarThumbnailSource(item)} alt={item.alt} />
        {item.type === "video" && (
          <span className="gallery-lightbox-sidebar-badge" aria-hidden="true">
            &#9654;
          </span>
        )}
        <button
          className="gallery-lightbox-sidebar-remove"
          onClick={() => onRemove(item.id)}
          aria-label={__("Remove", "kotlinskidev")}
          type="button"
        >
          &times;
        </button>
      </div>
    ))}
  </div>
);

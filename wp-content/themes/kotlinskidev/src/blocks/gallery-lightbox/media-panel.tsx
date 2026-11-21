import React from "react";
import { MediaUploadCheck } from "@wordpress/block-editor";
import { PanelBody, ToggleControl } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import { AddMediaButton } from "./add-media-button";
import { mergeSelectedMedia, type GalleryEditProps } from "./gallery-media";
import { MediaSidebarGrid } from "./media-sidebar-grid";

const MobileMediaSection = ({ attributes, setAttributes }: GalleryEditProps) => {
  const { mobileImages = [] } = attributes;
  return (
    <>
      <p className="gallery-lightbox-sidebar-label">
        {__("Mobile media (≤768px)", "kotlinskidev")}
      </p>
      {mobileImages.length > 0 && (
        <MediaSidebarGrid
          items={mobileImages}
          onRemove={(id) =>
            setAttributes({ mobileImages: mobileImages.filter((m) => m.id !== id) })
          }
        />
      )}
      <AddMediaButton
        hasMedia={mobileImages.length > 0}
        emptyLabel={__("Add Mobile Media", "kotlinskidev")}
        filledLabel={__("Add More Mobile Media", "kotlinskidev")}
        onSelect={(selected) =>
          setAttributes({ mobileImages: mergeSelectedMedia(mobileImages, selected) })
        }
      />
    </>
  );
};

const MediaModeToggles = ({ attributes, setAttributes }: GalleryEditProps) => (
  <>
    <div className="gallery-lightbox-sidebar-divider">
      <ToggleControl
        label={__("Lock height to first image", "kotlinskidev")}
        help={__(
          "Keeps the block height fixed when slides change. Requires 'Track active slide' to be enabled.",
          "kotlinskidev"
        )}
        checked={attributes.lockHeight ?? false}
        onChange={(value) => setAttributes({ lockHeight: value })}
      />
    </div>

    <div className="gallery-lightbox-sidebar-divider">
      <ToggleControl
        label={__("Use different media on mobile", "kotlinskidev")}
        help={__("Show alternative images/videos on screens ≤768px.", "kotlinskidev")}
        checked={attributes.useMobileMedia ?? false}
        onChange={(value) => setAttributes({ useMobileMedia: value })}
      />
    </div>
  </>
);

export const MediaPanel = ({ attributes, setAttributes }: GalleryEditProps) => {
  const { images = [], useMobileMedia = false } = attributes;
  return (
    <PanelBody title={__("Media", "kotlinskidev")} initialOpen>
      <MediaUploadCheck>
        {images.length > 0 && (
          <MediaSidebarGrid
            items={images}
            onRemove={(id) => setAttributes({ images: images.filter((img) => img.id !== id) })}
          />
        )}
        <AddMediaButton
          hasMedia={images.length > 0}
          emptyLabel={__("Add Images & Videos", "kotlinskidev")}
          filledLabel={__("Add More Media", "kotlinskidev")}
          onSelect={(selected) => setAttributes({ images: mergeSelectedMedia(images, selected) })}
        />

        <MediaModeToggles attributes={attributes} setAttributes={setAttributes} />

        {useMobileMedia && (
          <MobileMediaSection attributes={attributes} setAttributes={setAttributes} />
        )}
      </MediaUploadCheck>
    </PanelBody>
  );
};

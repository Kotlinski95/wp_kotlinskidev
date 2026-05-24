import React from "react";
import {
  useBlockProps,
  InnerBlocks,
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
} from "@wordpress/block-editor";
import { PanelBody, RangeControl, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";

export interface HeroSlideAttributes {
  bgImageUrl: string;
  bgImageId: number;
  bgVideoUrl: string;
  bgVideoId: number;
  bgOverlay: number;
}

interface WPMediaItem {
  id: number;
  url: string;
}

const SLIDE_TEMPLATE = [
  ["core/heading", { level: 2, placeholder: "Slide Heading" }],
  ["core/paragraph", { placeholder: "Add a description..." }],
  ["core/buttons", {}, [["core/button", { text: "Learn More" }]]],
];

export default function Edit({
  attributes,
  setAttributes,
}: {
  attributes: HeroSlideAttributes;
  setAttributes: (attrs: Partial<HeroSlideAttributes>) => void;
}) {
  const { bgImageUrl, bgImageId, bgVideoUrl, bgVideoId, bgOverlay = 0.4 } = attributes;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Background", "kotlinskidev")} initialOpen>
          <MediaUploadCheck>
            <p className="hero-carousel-sidebar-label">{__("Background Image", "kotlinskidev")}</p>
            <MediaUpload
              onSelect={(item) => {
                const media = item as WPMediaItem;
                setAttributes({ bgImageUrl: media.url, bgImageId: media.id });
              }}
              allowedTypes={["image"]}
              value={bgImageId || undefined}
              render={({ open }) => (
                <Button
                  variant={bgImageUrl ? "secondary" : "primary"}
                  onClick={open}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {bgImageUrl
                    ? __("Change Image", "kotlinskidev")
                    : __("Set Image", "kotlinskidev")}
                </Button>
              )}
            />
            {bgImageUrl && (
              <Button
                variant="tertiary"
                isDestructive
                onClick={() => setAttributes({ bgImageUrl: "", bgImageId: 0 })}
                style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
              >
                {__("Remove Image", "kotlinskidev")}
              </Button>
            )}

            <p className="hero-carousel-sidebar-label" style={{ marginTop: "0.75rem" }}>
              {__("Background Video (optional)", "kotlinskidev")}
            </p>
            <MediaUpload
              onSelect={(item) => {
                const media = item as WPMediaItem;
                setAttributes({ bgVideoUrl: media.url, bgVideoId: media.id });
              }}
              allowedTypes={["video"]}
              value={bgVideoId || undefined}
              render={({ open }) => (
                <Button
                  variant={bgVideoUrl ? "secondary" : "tertiary"}
                  onClick={open}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {bgVideoUrl
                    ? __("Change Video", "kotlinskidev")
                    : __("Set Video", "kotlinskidev")}
                </Button>
              )}
            />
            {bgVideoUrl && (
              <Button
                variant="tertiary"
                isDestructive
                onClick={() => setAttributes({ bgVideoUrl: "", bgVideoId: 0 })}
                style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
              >
                {__("Remove Video", "kotlinskidev")}
              </Button>
            )}
          </MediaUploadCheck>

          <RangeControl
            label={__("Overlay Opacity", "kotlinskidev")}
            value={bgOverlay}
            onChange={(value) => setAttributes({ bgOverlay: value ?? 0.4 })}
            min={0}
            max={1}
            step={0.05}
            style={{ marginTop: "0.75rem" }}
          />
        </PanelBody>
      </InspectorControls>

      <div
        {...useBlockProps({ className: "hero-carousel__slide" })}
        style={{ "--overlay-opacity": bgOverlay } as React.CSSProperties}
      >
        {bgImageUrl ? (
          <div className="hero-carousel__bg">
            {bgVideoUrl ? (
              <video src={bgVideoUrl} muted autoPlay loop playsInline />
            ) : (
              <img src={bgImageUrl} alt="" />
            )}
            <div className="hero-carousel__overlay" />
          </div>
        ) : (
          <div className="hero-carousel__bg hero-carousel__bg--empty">
            <span>{__("Set a background image in the sidebar.", "kotlinskidev")}</span>
          </div>
        )}
        <div className="hero-carousel__content">
          <InnerBlocks template={SLIDE_TEMPLATE as [string, object][]} />
        </div>
      </div>
    </>
  );
}

import React from "react";
import {
  useBlockProps,
  InnerBlocks,
  __experimentalGetSpacingClassesAndStyles as getSpacingClassesAndStyles,
} from "@wordpress/block-editor";
import { __ } from "@wordpress/i18n";
import { BackgroundPanel, DEFAULT_OVERLAY_OPACITY } from "./background-panel";
import type { HeroSlideEditProps } from "./slide-attributes";

export type { HeroSlideAttributes } from "./slide-attributes";

const SLIDE_TEMPLATE = [
  ["core/heading", { level: 2, placeholder: "Slide Heading" }],
  ["core/paragraph", { placeholder: "Add a description..." }],
  ["core/buttons", {}, [["core/button", { text: "Learn More" }]]],
];

const SlideBackground = ({
  bgImageUrl,
  bgVideoUrl,
}: {
  bgImageUrl: string;
  bgVideoUrl: string;
}) => {
  if (!bgImageUrl) {
    return (
      <div className="hero-carousel__bg hero-carousel__bg--empty">
        <span>{__("Set a background image in the sidebar.", "kotlinskidev")}</span>
      </div>
    );
  }
  return (
    <div className="hero-carousel__bg">
      {bgVideoUrl ? (
        <video src={bgVideoUrl} muted autoPlay loop playsInline />
      ) : (
        <img src={bgImageUrl} alt="" />
      )}
      <div className="hero-carousel__overlay" />
    </div>
  );
};

export default function Edit({ attributes, setAttributes }: HeroSlideEditProps) {
  const { bgImageUrl, bgVideoUrl, bgOverlay = DEFAULT_OVERLAY_OPACITY } = attributes;
  const contentSpacingStyle = getSpacingClassesAndStyles(attributes).style;

  return (
    <>
      <BackgroundPanel attributes={attributes} setAttributes={setAttributes} />

      <div
        {...useBlockProps({ className: "hero-carousel__slide" })}
        style={{ "--overlay-opacity": bgOverlay } as React.CSSProperties}
      >
        <SlideBackground bgImageUrl={bgImageUrl} bgVideoUrl={bgVideoUrl} />
        <div className="hero-carousel__content" style={contentSpacingStyle as React.CSSProperties}>
          <InnerBlocks template={SLIDE_TEMPLATE as [string, object][]} />
        </div>
      </div>
    </>
  );
}

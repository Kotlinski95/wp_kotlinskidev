import React from "react";
import { PanelBody, Button } from "@wordpress/components";
import { __, sprintf } from "@wordpress/i18n";
import { onActivationKey } from "@utils/keyboardActivation";
import type { SlideBlock } from "./use-hero-slides";

interface SlidesPanelProps {
  innerBlocks: SlideBlock[];
  activeSlide: number;
  slideCount: number;
  handleNavigate: (index: number) => void;
  handleAddSlide: () => void;
  handleRemoveSlide: (index: number) => void;
}

interface SidebarSlideProps {
  block: SlideBlock;
  index: number;
  isActive: boolean;
  canRemove: boolean;
  onNavigate: () => void;
  onRemove: () => void;
}

const sidebarSlideClassName = (isActive: boolean, hasImage: boolean): string =>
  [
    "hero-carousel-sidebar-slide",
    isActive ? "hero-carousel-sidebar-slide--active" : "",
    !hasImage ? "hero-carousel-sidebar-slide--empty" : "",
  ]
    .filter(Boolean)
    .join(" ");

const RemoveSlideButton = ({ onRemove }: { onRemove: () => void }) => (
  <button
    className="hero-carousel-sidebar-remove"
    onClick={(e) => {
      e.stopPropagation();
      onRemove();
    }}
    aria-label={__("Remove slide", "kotlinskidev")}
  >
    ×
  </button>
);

const SidebarSlide = ({
  block,
  index,
  isActive,
  canRemove,
  onNavigate,
  onRemove,
}: SidebarSlideProps) => {
  const imgUrl = (block.attributes?.bgImageUrl as string) ?? "";
  return (
    <div
      className={sidebarSlideClassName(isActive, Boolean(imgUrl))}
      onClick={onNavigate}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget) {
          onActivationKey(onNavigate)(e);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={sprintf(
        // translators: %d: slide number
        __("Slide %d", "kotlinskidev"),
        index + 1
      )}
    >
      {imgUrl ? <img src={imgUrl} alt="" /> : <span>{index + 1}</span>}
      {canRemove && <RemoveSlideButton onRemove={onRemove} />}
    </div>
  );
};

export const SlidesPanel = ({
  innerBlocks,
  activeSlide,
  slideCount,
  handleNavigate,
  handleAddSlide,
  handleRemoveSlide,
}: SlidesPanelProps) => (
  <PanelBody title={__("Slides", "kotlinskidev")} initialOpen>
    <p className="hero-carousel-sidebar-label">{__("Slides", "kotlinskidev")}</p>
    <div className="hero-carousel-sidebar-slides">
      {innerBlocks.map((block, i) => (
        <SidebarSlide
          key={block.clientId}
          block={block}
          index={i}
          isActive={i === activeSlide}
          canRemove={slideCount > 1}
          onNavigate={() => handleNavigate(i)}
          onRemove={() => handleRemoveSlide(i)}
        />
      ))}
    </div>
    <Button
      variant="secondary"
      onClick={handleAddSlide}
      style={{ width: "100%", justifyContent: "center" }}
    >
      {__("+ Add Slide", "kotlinskidev")}
    </Button>
  </PanelBody>
);

import React, { useState, useEffect } from "react";
import { useBlockProps, InnerBlocks, InspectorControls } from "@wordpress/block-editor";
import { useSelect, useDispatch } from "@wordpress/data";
import { createBlock } from "@wordpress/blocks";
import { PanelBody, RangeControl, Button } from "@wordpress/components";
import { __ } from "@wordpress/i18n";
import CarouselPanel from "@utils/carousel/CarouselPanel";
import type { CarouselSettings } from "@utils/carousel/types";
import "./style.scss";

export interface HeroCarouselAttributes extends Partial<CarouselSettings> {
  minHeight: number;
}

const ALLOWED_BLOCKS = ["kotlinskidev/hero-carousel-slide"];

const SLIDES_TEMPLATE: [string, Record<string, unknown>][] = [
  ["kotlinskidev/hero-carousel-slide", {}],
  ["kotlinskidev/hero-carousel-slide", {}],
];

interface SlideBlock {
  clientId: string;
  attributes: Record<string, unknown>;
}

interface BlockEditorSelectors {
  getBlock: (id: string) => { innerBlocks: SlideBlock[] } | undefined;
  getSelectedBlockClientId: () => string | null;
  getBlockParents: (id: string) => string[];
}

interface BlockEditorActions {
  insertBlock: (block: unknown, index?: number, rootClientId?: string) => void;
  removeBlock: (clientId: string) => void;
  selectBlock: (clientId: string) => void;
}

export default function Edit({
  attributes,
  setAttributes,
  clientId,
}: {
  attributes: HeroCarouselAttributes;
  setAttributes: (attrs: Partial<HeroCarouselAttributes>) => void;
  clientId: string;
}) {
  const { minHeight = 80, ...carouselSettings } = attributes;
  const {
    showArrows = true,
    showPagination = true,
    arrowsPosition = "sides",
    navColor = "",
    navColorOnHover = false,
    navPlacement = "inside",
  } = carouselSettings;
  const [activeSlide, setActiveSlide] = useState(0);

  const { innerBlocks, selectedBlockParents } = useSelect(
    (select) => {
      const store = select("core/block-editor") as unknown as BlockEditorSelectors;
      const selectedCid = store.getSelectedBlockClientId();
      const parents: string[] = selectedCid ? store.getBlockParents(selectedCid) : [];
      return {
        innerBlocks: store.getBlock(clientId)?.innerBlocks ?? [],
        selectedBlockParents: selectedCid ? [...parents, selectedCid] : [],
      };
    },
    [clientId]
  );

  const { insertBlock, removeBlock, selectBlock } = useDispatch(
    "core/block-editor"
  ) as unknown as BlockEditorActions;

  useEffect(() => {
    const idx = innerBlocks.findIndex((b) => selectedBlockParents.includes(b.clientId));
    if (idx >= 0) setActiveSlide(idx);
  }, [selectedBlockParents, innerBlocks]);

  useEffect(() => {
    if (innerBlocks.length > 0 && activeSlide >= innerBlocks.length) {
      setActiveSlide(innerBlocks.length - 1);
    }
  }, [innerBlocks.length, activeSlide]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      innerBlocks.forEach((block, i) => {
        const el = document.querySelector(`[data-block="${block.clientId}"]`);
        if (el instanceof HTMLElement) {
          el.style.display = i === activeSlide ? "" : "none";
        }
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [activeSlide, innerBlocks]);

  const slideCount = innerBlocks.length;

  const handleNavigate = (index: number) => {
    setActiveSlide(index);
    selectBlock(clientId);
  };

  const handleAddSlide = () => {
    insertBlock(createBlock("kotlinskidev/hero-carousel-slide"), undefined, clientId);
    setActiveSlide(slideCount);
  };

  const handleRemoveSlide = (index: number) => {
    if (slideCount <= 1) return;
    const target = innerBlocks[index];
    if (target) removeBlock(target.clientId);
  };

  const effectivePlacement = arrowsPosition === "sides" ? "inside" : (navPlacement ?? "inside");

  const navColorStyle: React.CSSProperties | undefined = navColor
    ? navColorOnHover
      ? ({ "--carousel-nav-color-hover": navColor } as React.CSSProperties)
      : ({ "--carousel-nav-color": navColor } as React.CSSProperties)
    : undefined;

  const editorNav = showArrows ? (
    <div
      className={`carousel-nav carousel-nav--${arrowsPosition}${effectivePlacement === "outside" ? " carousel-nav--outside" : ""}`}
    >
      <div
        className={`swiper-button-prev${activeSlide === 0 ? " swiper-button-disabled" : ""}`}
        onClick={() => activeSlide > 0 && handleNavigate(activeSlide - 1)}
        role="button"
        tabIndex={0}
        aria-label={__("Previous slide", "kotlinskidev")}
      />
      {arrowsPosition !== "sides" && (
        <span className="carousel-nav__counter">
          <span className="carousel-nav__current">{String(activeSlide + 1).padStart(2, "0")}</span>
          {" / "}
          {String(slideCount).padStart(2, "0")}
        </span>
      )}
      <div
        className={`swiper-button-next${activeSlide === slideCount - 1 ? " swiper-button-disabled" : ""}`}
        onClick={() => activeSlide < slideCount - 1 && handleNavigate(activeSlide + 1)}
        role="button"
        tabIndex={0}
        aria-label={__("Next slide", "kotlinskidev")}
      />
    </div>
  ) : null;

  const editorPagination = showPagination ? (
    <div className="swiper-pagination">
      {innerBlocks.map((_, i) => (
        <span
          key={i}
          className={`swiper-pagination-bullet${i === activeSlide ? " swiper-pagination-bullet-active" : ""}`}
          onClick={() => handleNavigate(i)}
          role="button"
          tabIndex={0}
          aria-label={`${__("Go to slide", "kotlinskidev")} ${i + 1}`}
        />
      ))}
    </div>
  ) : null;

  return (
    <>
      <InspectorControls>
        <PanelBody title={__("Slides", "kotlinskidev")} initialOpen>
          <p className="hero-carousel-sidebar-label">{__("Slides", "kotlinskidev")}</p>
          <div className="hero-carousel-sidebar-slides">
            {innerBlocks.map((block, i) => {
              const imgUrl = (block.attributes?.bgImageUrl as string) ?? "";
              return (
                <div
                  key={block.clientId}
                  className={[
                    "hero-carousel-sidebar-slide",
                    i === activeSlide ? "hero-carousel-sidebar-slide--active" : "",
                    !imgUrl ? "hero-carousel-sidebar-slide--empty" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleNavigate(i)}
                >
                  {imgUrl ? <img src={imgUrl} alt="" /> : <span>{i + 1}</span>}
                  {slideCount > 1 && (
                    <button
                      className="hero-carousel-sidebar-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveSlide(i);
                      }}
                      aria-label={__("Remove slide", "kotlinskidev")}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            variant="secondary"
            onClick={handleAddSlide}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {__("+ Add Slide", "kotlinskidev")}
          </Button>
        </PanelBody>
        <CarouselPanel
          settings={carouselSettings}
          onChange={(partial) => setAttributes(partial)}
          features={{
            arrowsPosition: true,
            navColor: true,
            navPlacement: true,
            autoplay: true,
            lazyLoad: true,
          }}
        />
        <PanelBody title={__("Height", "kotlinskidev")} initialOpen={false}>
          <RangeControl
            label={__("Min Height (vh)", "kotlinskidev")}
            value={minHeight}
            onChange={(value) => setAttributes({ minHeight: value ?? 80 })}
            min={40}
            max={100}
          />
        </PanelBody>
      </InspectorControls>
      <div
        {...useBlockProps({ className: "hero-carousel" })}
        data-active-slide={activeSlide}
        style={
          {
            "--hero-min-height": `${minHeight}vh`,
            ...(navColorStyle ?? {}),
          } as React.CSSProperties
        }
      >
        <div className="swiper hero-carousel__swiper">
          <div className="swiper-wrapper">
            <InnerBlocks
              allowedBlocks={ALLOWED_BLOCKS}
              template={SLIDES_TEMPLATE}
              renderAppender={() => null}
            />
          </div>
          {showArrows && effectivePlacement === "inside" ? editorNav : null}
          {showPagination && effectivePlacement === "inside" && arrowsPosition === "sides"
            ? editorPagination
            : null}
        </div>
        {showArrows && effectivePlacement === "outside" ? editorNav : null}
        <button
          className="hero-carousel-editor__add"
          onClick={handleAddSlide}
          title={__("Add slide", "kotlinskidev")}
        >
          +
        </button>
      </div>
    </>
  );
}

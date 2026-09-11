import React from "react";
import { createBlock } from "@wordpress/blocks";
import {
  useBlockProps,
  useInnerBlocksProps,
  useBlockEditContext,
  store as blockEditorStore,
  BlockControls,
  InspectorControls,
  ButtonBlockAppender,
} from "@wordpress/block-editor";
import {
  ToolbarGroup,
  ToolbarButton,
  PanelBody,
  PanelRow,
  ToggleControl,
  RangeControl,
  __experimentalUnitControl as UnitControl,
} from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { memo, useEffect, useMemo, useRef, useState } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { onActivationKey } from "@utils/keyboardActivation";
import SlidesPerViewControl from "@utils/carousel/SlidesPerViewControl";

import {
  ALLOWED_BLOCKS,
  DEFAULT_BLOCK,
  DEFAULT_BLOCK_ATTRIBUTES,
  DEFAULT_INNERBLOCK,
  DEFAULT_INNERBLOCK_ATTRIBUTES,
} from "./constants";
import "./editor.scss";

import PLACEHOLDER_IMG_1 from "./assets/image1.webp";
import PLACEHOLDER_IMG_2 from "./assets/image2.webp";
import PLACEHOLDER_IMG_3 from "./assets/image3.webp";

export interface SliderAttributes {
  autoplay: boolean;
  autoplayTime: number;
  smoothTransition: boolean;
  continuousAutoplay: boolean;
  navigation: boolean;
  pagination: boolean;
  showProgress: boolean;
  slidesPerView: number | "auto";
  slidesPerMobile: number | "auto";
  slidesPerTablet: number | "auto";
  slidesPerDesktop: number | "auto";
  scrollbar: boolean;
  loop: boolean;
  draggable: boolean;
  mousewheel: boolean;
  keyboard: boolean;
  spaceBetween: number;
  centerSlides: boolean;
  peek: number;
  slideMaxWidth: string | number;
  paginationPlacement: "inside" | "outside";
}

const SLIDE_MAX_WIDTH_UNITS = [
  { value: "px", label: "px", default: 900 },
  { value: "%", label: "%", default: 50 },
  { value: "rem", label: "rem", default: 56.25 },
  { value: "vw", label: "vw", default: 70 },
];

const normalizeSlideMaxWidth = (value: SliderAttributes["slideMaxWidth"]): string =>
  typeof value === "number" ? `${value}px` : value || "900px";

const flatWidth = (perView: number | "auto", spaceBetween: number): string =>
  perView === "auto" ? "auto" : `calc((100% - ${spaceBetween * (perView - 1)}px) / ${perView})`;

const editorSlideLayoutVars = (
  attributes: SliderAttributes
): { className: string; style: React.CSSProperties } => {
  if (attributes.centerSlides) {
    return {
      className: "swiper has-center-slides",
      style: {
        "--kt-slider-slide-width": `${100 - attributes.peek * 2}%`,
        "--kt-slider-slide-max-width": normalizeSlideMaxWidth(attributes.slideMaxWidth),
      } as React.CSSProperties,
    };
  }

  return {
    className: "swiper",
    style: {
      "--kt-slider-editor-flat-width": flatWidth(
        attributes.slidesPerView || 1,
        attributes.spaceBetween
      ),
      "--kt-slider-editor-flat-width-mobile": flatWidth(
        attributes.slidesPerMobile || 1,
        attributes.spaceBetween
      ),
      "--kt-slider-editor-flat-width-tablet": flatWidth(
        attributes.slidesPerTablet || 1,
        attributes.spaceBetween
      ),
      "--kt-slider-editor-flat-width-desktop": flatWidth(
        attributes.slidesPerDesktop || 1,
        attributes.spaceBetween
      ),
    } as React.CSSProperties,
  };
};

interface EditProps {
  attributes: SliderAttributes;
  setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

const SliderToolbar = ({ clientId }: { clientId: string }): React.ReactElement => {
  const { insertBlock, selectBlock } = useDispatch(blockEditorStore);
  const innerBlocks = useSelect(
    (selectFn) => selectFn(blockEditorStore).getBlock(clientId)?.innerBlocks ?? [],
    [clientId]
  );

  const addSlide = () => {
    const block = createBlock(DEFAULT_BLOCK, {
      url: `${PLACEHOLDER_IMG_3}`,
      ...DEFAULT_BLOCK_ATTRIBUTES,
    });
    insertBlock(block, innerBlocks.length, clientId, false);
    selectBlock(block.clientId);
  };

  return (
    <ToolbarGroup>
      <ToolbarButton icon="plus" onClick={addSlide}>
        {__("Add Slide", "kotlinskidev")}
      </ToolbarButton>
    </ToolbarGroup>
  );
};

interface SliderProps {
  clientId: string;
  innerBlocksProps: Record<string, unknown>;
  attributes: SliderAttributes;
}

interface BlockEditorSelectors {
  getBlockOrder: (id: string) => string[];
  getSelectedBlockClientId: () => string | null;
  getBlockParents: (id: string) => string[];
}

const EMPTY_CLIENT_IDS: string[] = [];

const Slider = memo(
  ({ clientId, innerBlocksProps, attributes }: SliderProps): React.ReactElement => {
    const [activeSlide, setActiveSlide] = useState(0);
    const { selectBlock } = useDispatch(blockEditorStore);
    const swiperRef = useRef<HTMLDivElement>(null);

    const { slideOrder, blockParents, selectedBlockClientId } = useSelect(
      (selectFn) => {
        const store = selectFn(blockEditorStore) as unknown as BlockEditorSelectors;
        const selectedCid = store.getSelectedBlockClientId();
        return {
          slideOrder: store.getBlockOrder(clientId),
          blockParents: selectedCid ? store.getBlockParents(selectedCid) : EMPTY_CLIENT_IDS,
          selectedBlockClientId: selectedCid,
        };
      },
      [clientId]
    );

    const selectedBlockParents = useMemo(
      () => (selectedBlockClientId ? [...blockParents, selectedBlockClientId] : EMPTY_CLIENT_IDS),
      [blockParents, selectedBlockClientId]
    );

    useEffect(() => {
      const idx = slideOrder.findIndex((id) => selectedBlockParents.includes(id));
      if (idx >= 0) {
        setActiveSlide(idx);
      }
    }, [selectedBlockParents, slideOrder]);

    useEffect(() => {
      if (slideOrder.length > 0 && activeSlide >= slideOrder.length) {
        setActiveSlide(slideOrder.length - 1);
      }
    }, [slideOrder.length, activeSlide]);

    useEffect(() => {
      const wrapperEl = swiperRef.current?.querySelector<HTMLElement>(":scope > .swiper-wrapper");
      const target = wrapperEl?.children[activeSlide] as HTMLElement | undefined;
      target?.scrollIntoView?.({ behavior: "smooth", inline: "nearest", block: "nearest" });
    }, [activeSlide]);

    const slideCount = slideOrder.length;

    const goToSlide = (index: number) => {
      setActiveSlide(index);
      const targetClientId = slideOrder[index];
      if (targetClientId) {
        selectBlock(targetClientId);
      }
    };

    const hasFrontendSwitcher =
      attributes.navigation || attributes.pagination || attributes.scrollbar;
    const showArrows = slideCount > 1 && (attributes.navigation || !hasFrontendSwitcher);
    const showDots = slideCount > 1 && (attributes.pagination || !hasFrontendSwitcher);
    const { className: swiperClassName, style: swiperStyle } = editorSlideLayoutVars(attributes);

    return (
      <>
        <BlockControls>
          <SliderToolbar clientId={clientId} />
        </BlockControls>

        <div ref={swiperRef} className={swiperClassName} style={swiperStyle}>
          <div {...innerBlocksProps} />
          {showArrows && (
            <>
              <div
                className={`swiper-button-prev${activeSlide === 0 ? " swiper-button-disabled" : ""}`}
                onClick={() => activeSlide > 0 && goToSlide(activeSlide - 1)}
                onKeyDown={onActivationKey(() => activeSlide > 0 && goToSlide(activeSlide - 1))}
                role="button"
                tabIndex={0}
                aria-label={__("Previous slide", "kotlinskidev")}
              />
              <div
                className={`swiper-button-next${activeSlide === slideCount - 1 ? " swiper-button-disabled" : ""}`}
                onClick={() => activeSlide < slideCount - 1 && goToSlide(activeSlide + 1)}
                onKeyDown={onActivationKey(
                  () => activeSlide < slideCount - 1 && goToSlide(activeSlide + 1)
                )}
                role="button"
                tabIndex={0}
                aria-label={__("Next slide", "kotlinskidev")}
              />
            </>
          )}
          {showDots && (
            <div className="swiper-pagination">
              {slideOrder.map((id, i) => (
                <span
                  key={id}
                  className={`swiper-pagination-bullet${i === activeSlide ? " swiper-pagination-bullet-active" : ""}`}
                  onClick={() => goToSlide(i)}
                  onKeyDown={onActivationKey(() => goToSlide(i))}
                  role="button"
                  tabIndex={0}
                  aria-label={`${__("Go to slide", "kotlinskidev")} ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <ButtonBlockAppender className="slider-appender has-icon" rootClientId={clientId} />
      </>
    );
  }
);

export default function Edit({ attributes, setAttributes }: EditProps): React.ReactElement {
  const { autoplay, navigation, pagination, spaceBetween } = attributes;
  const { clientId } = useBlockEditContext();
  const blockProps = useBlockProps();

  const innerBlocksProps = useInnerBlocksProps(
    { className: "swiper-wrapper", style: { gap: `${spaceBetween}px` } },
    {
      allowedBlocks: ALLOWED_BLOCKS,
      defaultBlock: {
        name: DEFAULT_BLOCK,
        attributes: {
          url: `${PLACEHOLDER_IMG_3}`,
          ...DEFAULT_BLOCK_ATTRIBUTES,
        },
      },
      directInsert: true,
      orientation: "horizontal",
      template: [
        [
          DEFAULT_BLOCK,
          { url: `${PLACEHOLDER_IMG_1}`, ...DEFAULT_BLOCK_ATTRIBUTES },
          [
            [
              DEFAULT_INNERBLOCK,
              { placeholder: __("Slide title…", "kotlinskidev"), ...DEFAULT_INNERBLOCK_ATTRIBUTES },
            ],
          ],
        ],
        [
          DEFAULT_BLOCK,
          { url: `${PLACEHOLDER_IMG_2}`, ...DEFAULT_BLOCK_ATTRIBUTES },
          [
            [
              DEFAULT_INNERBLOCK,
              { placeholder: __("Slide title…", "kotlinskidev"), ...DEFAULT_INNERBLOCK_ATTRIBUTES },
            ],
          ],
        ],
      ],
      renderAppender: false,
    }
  );

  return (
    <>
      <div {...blockProps}>
        <Slider clientId={clientId} innerBlocksProps={innerBlocksProps} attributes={attributes} />
      </div>

      <InspectorControls>
        <PanelBody title={__("Settings", "kotlinskidev")}>
          <PanelRow>
            <ToggleControl
              label={__("Autoplay", "kotlinskidev")}
              checked={autoplay}
              onChange={(value) => setAttributes({ autoplay: value })}
              help={__(
                "“Autoplay” will automatically advance the slides. Note: this is intentionally disabled in the editor, but will affect the front end.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          {autoplay && (
            <PanelRow>
              <ToggleControl
                label={__("Continuous Autoplay", "kotlinskidev")}
                checked={attributes.continuousAutoplay}
                onChange={(value) => setAttributes({ continuousAutoplay: value })}
                help={__(
                  "Scrolls continuously (like a ticker) instead of pausing between slides. Starts once the carousel scrolls into view, and pauses on hover or keyboard focus, resuming once the pointer or focus leaves.",
                  "kotlinskidev"
                )}
              />
            </PanelRow>
          )}
          {autoplay && !attributes.continuousAutoplay && (
            <PanelRow>
              <ToggleControl
                label={__("Show progress circle", "kotlinskidev")}
                checked={attributes.showProgress}
                onChange={(value) => setAttributes({ showProgress: value })}
                help={__(
                  "Displays a circular countdown indicator that fills up before each automatic slide change.",
                  "kotlinskidev"
                )}
              />
            </PanelRow>
          )}
          <PanelRow>
            <ToggleControl
              label={__("Navigation", "kotlinskidev")}
              checked={navigation}
              onChange={(value) => setAttributes({ navigation: value })}
              help={__(
                "“Navigation” will display arrows so user can navigate forward/backward.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Pagination", "kotlinskidev")}
              checked={pagination}
              onChange={(value) => setAttributes({ pagination: value })}
              help={__(
                "“Pagination” will display dots along the bottom for user to click through slides.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          {pagination && (
            <PanelRow>
              <ToggleControl
                label={__("Show pagination outside carousel", "kotlinskidev")}
                checked={attributes.paginationPlacement === "outside"}
                onChange={(value) =>
                  setAttributes({ paginationPlacement: value ? "outside" : "inside" })
                }
                help={__(
                  "Renders the pagination dots below the slides instead of overlaying them.",
                  "kotlinskidev"
                )}
              />
            </PanelRow>
          )}
          <PanelRow>
            <ToggleControl
              label={__("Smooth Transition", "kotlinskidev")}
              checked={attributes.smoothTransition}
              onChange={(value) => setAttributes({ smoothTransition: value })}
              help={__(
                "Uses a linear easing curve for a smoother feel between slides.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          <PanelRow>
            <RangeControl
              label={__("Autoplay Time (seconds)", "kotlinskidev")}
              value={attributes.autoplayTime}
              onChange={(value) => setAttributes({ autoplayTime: value })}
              min={1}
              max={10}
              help={
                attributes.continuousAutoplay
                  ? __(
                      "Set how long one full continuous scroll cycle takes, in seconds.",
                      "kotlinskidev"
                    )
                  : __("Set the autoplay interval in seconds.", "kotlinskidev")
              }
            />
          </PanelRow>
          <PanelRow>
            <SlidesPerViewControl
              label={__("Slides Per View", "kotlinskidev")}
              value={attributes.slidesPerView}
              onChange={(value) => setAttributes({ slidesPerView: value })}
            />
          </PanelRow>
          <PanelRow>
            <SlidesPerViewControl
              label={__("Slides Per Mobile", "kotlinskidev")}
              value={attributes.slidesPerMobile}
              onChange={(value) => setAttributes({ slidesPerMobile: value })}
            />
          </PanelRow>
          <PanelRow>
            <SlidesPerViewControl
              label={__("Slides Per Tablet", "kotlinskidev")}
              value={attributes.slidesPerTablet}
              onChange={(value) => setAttributes({ slidesPerTablet: value })}
            />
          </PanelRow>
          <PanelRow>
            <SlidesPerViewControl
              label={__("Slides Per Desktop", "kotlinskidev")}
              value={attributes.slidesPerDesktop}
              onChange={(value) => setAttributes({ slidesPerDesktop: value })}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Scrollbar", "kotlinskidev")}
              checked={attributes.scrollbar}
              onChange={(value) => setAttributes({ scrollbar: value })}
              help={__("Enable or disable the scrollbar.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Loop", "kotlinskidev")}
              checked={attributes.loop}
              onChange={(value) => setAttributes({ loop: value })}
              help={__("Enable or disable looping of slides.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Draggable", "kotlinskidev")}
              checked={attributes.draggable}
              onChange={(value) => setAttributes({ draggable: value })}
              help={__(
                "Lets users manually swipe/drag the slides. Keep this on to allow manual swiping even during Continuous Autoplay.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Centered slides (peek effect)", "kotlinskidev")}
              checked={attributes.centerSlides}
              onChange={(value) => setAttributes({ centerSlides: value })}
              help={__(
                "Centers the active slide with the next/previous slides peeking in from the sides. Below tablet width, always shows a single full-width slide regardless of these settings. Use the block's own Wide/Full alignment for an edge-to-edge carousel.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          {attributes.centerSlides && (
            <>
              <PanelRow>
                <RangeControl
                  label={__("Side peek (%)", "kotlinskidev")}
                  value={attributes.peek}
                  onChange={(value) => setAttributes({ peek: value ?? 20 })}
                  min={0}
                  max={40}
                  help={__(
                    "How much of each side slide is visible, as a percentage of the carousel width, up to the max slide width below.",
                    "kotlinskidev"
                  )}
                />
              </PanelRow>
              <PanelRow>
                <UnitControl
                  label={__("Max slide width", "kotlinskidev")}
                  value={normalizeSlideMaxWidth(attributes.slideMaxWidth)}
                  units={SLIDE_MAX_WIDTH_UNITS}
                  onChange={(value?: string) => setAttributes({ slideMaxWidth: value || "900px" })}
                  help={__(
                    "Caps how wide the active slide can grow. On wider screens the slide stays this width, so more of the side slides peek in.",
                    "kotlinskidev"
                  )}
                />
              </PanelRow>
            </>
          )}
          <PanelRow>
            <RangeControl
              label={__("Space Between Slides (px)", "kotlinskidev")}
              value={spaceBetween}
              onChange={(value) => setAttributes({ spaceBetween: value })}
              min={0}
              max={100}
              help={__("Set the space between slides in pixels.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Mousewheel", "kotlinskidev")}
              checked={attributes.mousewheel}
              onChange={(value) => setAttributes({ mousewheel: value })}
              help={__("Enable navigation with mouse wheel scrolling.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Keyboard Navigation", "kotlinskidev")}
              checked={attributes.keyboard}
              onChange={(value) => setAttributes({ keyboard: value })}
              help={__("Enable navigation with keyboard arrow keys.", "kotlinskidev")}
            />
          </PanelRow>
        </PanelBody>
      </InspectorControls>
    </>
  );
}

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
} from "@wordpress/components";
import { useRefEffect } from "@wordpress/compose";
import { useSelect, useDispatch, select, subscribe } from "@wordpress/data";
import { memo } from "@wordpress/element";
import { __ } from "@wordpress/i18n";

import {
  ALLOWED_BLOCKS,
  DEFAULT_BLOCK,
  DEFAULT_BLOCK_ATTRIBUTES,
  DEFAULT_INNERBLOCK,
  DEFAULT_INNERBLOCK_ATTRIBUTES,
} from "./constants";
import { SwiperInit } from "./swiper-init";
import "./editor.scss";

import PLACEHOLDER_IMG_1 from "./assets/image1.webp";
import PLACEHOLDER_IMG_2 from "./assets/image2.webp";
import PLACEHOLDER_IMG_3 from "./assets/image3.webp";

interface SliderAttributes {
  autoplay: boolean;
  autoplayTime: number;
  smoothTransition: boolean;
  navigation: boolean;
  pagination: boolean;
  slidesPerView: number;
  slidesPerMobile: number;
  slidesPerTablet: number;
  slidesPerDesktop: number;
  scrollbar: boolean;
  loop: boolean;
  mousewheel: boolean;
  keyboard: boolean;
  spaceBetween: number;
}

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
  attributes: SliderAttributes;
  innerBlocksProps: Record<string, unknown>;
}

const Slider = memo(({ clientId, attributes, innerBlocksProps }: SliderProps): React.ReactElement => {
  const sliderRef = useRefEffect((element: HTMLElement) => {
    const options = {
      ...attributes,
      autoplay: false,
      grabCursor: false,
      simulateTouch: false,
    };

    let slider = SwiperInit(element, options);
    let slideOrder = select(blockEditorStore).getBlockOrder(clientId);

    const unsubscribeSliderUpdateListener = subscribe(() => {
      const currentSlidesOrder = select(blockEditorStore).getBlockOrder(clientId);

      if (currentSlidesOrder.toString() !== slideOrder.toString()) {
        const selectedBlock = select(blockEditorStore).getSelectedBlock();
        const slideAdded = currentSlidesOrder.length > slideOrder.length;
        const slideRemoved = currentSlidesOrder.length < slideOrder.length;
        const slideMoved = currentSlidesOrder.length === slideOrder.length;
        const activeIndex = slider.activeIndex;

        slideOrder = currentSlidesOrder;
        slider.destroy();

        window.requestAnimationFrame(() => {
          slider = SwiperInit(element, options);

          let slideToIndex = activeIndex;
          if (slideAdded) {
            slideToIndex = slideOrder.length;
          } else if (slideRemoved) {
            slideToIndex = activeIndex - 1;
          } else if (slideMoved && selectedBlock) {
            slideToIndex = slideOrder.findIndex(
              (id: string) => id === selectedBlock.clientId
            );
          }

          if (slideToIndex < 0) {
            slideToIndex = 0;
          }

          slider.slideTo(slideToIndex, 0);
        });
      }
    });

    return () => {
      unsubscribeSliderUpdateListener();
      slider.destroy();
    };
  }, []);

  return (
    <>
      <BlockControls>
        <SliderToolbar clientId={clientId} />
      </BlockControls>

      <div className="swiper" ref={sliderRef}>
        <div {...innerBlocksProps} />
      </div>

      <ButtonBlockAppender className="slider-appender has-icon" rootClientId={clientId} />
    </>
  );
});

export default function Edit({ attributes, setAttributes }: EditProps): React.ReactElement {
  const { autoplay, navigation, pagination, spaceBetween } = attributes;
  const { clientId } = useBlockEditContext();
  const blockProps = useBlockProps();

  const innerBlocksProps = useInnerBlocksProps(
    { className: "swiper-wrapper" },
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
          [[DEFAULT_INNERBLOCK, { placeholder: __("Slide title…", "kotlinskidev"), ...DEFAULT_INNERBLOCK_ATTRIBUTES }]],
        ],
        [
          DEFAULT_BLOCK,
          { url: `${PLACEHOLDER_IMG_2}`, ...DEFAULT_BLOCK_ATTRIBUTES },
          [[DEFAULT_INNERBLOCK, { placeholder: __("Slide title…", "kotlinskidev"), ...DEFAULT_INNERBLOCK_ATTRIBUTES }]],
        ],
      ],
      renderAppender: false,
    }
  );

  return (
    <>
      <div {...blockProps}>
        <Slider clientId={clientId} attributes={attributes} innerBlocksProps={innerBlocksProps} />
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
          <PanelRow>
            <ToggleControl
              label={__("Navigation", "kotlinskidev")}
              checked={navigation}
              onChange={(value) => setAttributes({ navigation: value })}
              help={__("“Navigation” will display arrows so user can navigate forward/backward.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Pagination", "kotlinskidev")}
              checked={pagination}
              onChange={(value) => setAttributes({ pagination: value })}
              help={__("“Pagination” will display dots along the bottom for user to click through slides.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <ToggleControl
              label={__("Smooth Transition", "kotlinskidev")}
              checked={attributes.smoothTransition}
              onChange={(value) => setAttributes({ smoothTransition: value })}
              help={__(
                "Creates a continuous smooth scrolling effect instead of discrete slide transitions.",
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
              help={__(
                attributes.smoothTransition
                  ? "Set the smooth scrolling speed in seconds."
                  : "Set the autoplay interval in seconds.",
                "kotlinskidev"
              )}
            />
          </PanelRow>
          <PanelRow>
            <RangeControl
              label={__("Slides Per View", "kotlinskidev")}
              value={attributes.slidesPerView}
              onChange={(value) => setAttributes({ slidesPerView: value })}
              min={1}
              max={5}
              help={__("Set the number of slides visible at once.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <RangeControl
              label={__("Slides Per Mobile", "kotlinskidev")}
              value={attributes.slidesPerMobile}
              onChange={(value) => setAttributes({ slidesPerMobile: value })}
              min={1}
              max={5}
              help={__("Set the number of slides visible on mobile devices.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <RangeControl
              label={__("Slides Per Tablet", "kotlinskidev")}
              value={attributes.slidesPerTablet}
              onChange={(value) => setAttributes({ slidesPerTablet: value })}
              min={1}
              max={5}
              help={__("Set the number of slides visible on tablets.", "kotlinskidev")}
            />
          </PanelRow>
          <PanelRow>
            <RangeControl
              label={__("Slides Per Desktop", "kotlinskidev")}
              value={attributes.slidesPerDesktop}
              onChange={(value) => setAttributes({ slidesPerDesktop: value })}
              min={1}
              max={5}
              help={__("Set the number of slides visible on desktop devices.", "kotlinskidev")}
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

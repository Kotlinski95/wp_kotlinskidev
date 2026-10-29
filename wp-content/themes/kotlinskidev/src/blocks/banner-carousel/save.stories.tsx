import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Save from "./save";
import { initBannerCarousel } from "./init";
import type { BannerCarouselAttributes } from "./edit";
import metadata from "./block.json";
import { getDefaultAttributes, useInteractiveAttributes } from "@utils/storybook-edit-props";
import { MOCK_MEDIA_LIBRARY } from "../../../.storybook/mock-media-upload";
import "./style.scss";

const STORYBOOK_CAROUSEL_HEIGHT = 420;

function buildBannerCarouselHtml(attributes: BannerCarouselAttributes): string {
  const { images = [], ...carouselSettings } = attributes;
  const settingsData = JSON.stringify(carouselSettings).replace(/"/g, "&quot;");

  const slides = images
    .map(
      (img) =>
        `<div class="swiper-slide" style="flex:0 0 auto;"><img src="${img.url}" alt="${img.alt ?? ""}" style="width:100%;height:100%;max-height:none;object-fit:cover;" /></div>`
    )
    .join("");

  return `
    <div class="wp-block-kotlinskidev-banner-carousel banner-carousel">
      <div class="swiper" data-carousel-settings="${settingsData}" style="height:${STORYBOOK_CAROUSEL_HEIGHT}px">
        <div class="swiper-wrapper" style="height:${STORYBOOK_CAROUSEL_HEIGHT}px">${slides}</div>
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
        <div class="swiper-pagination"></div>
        <div class="swiper-scrollbar"></div>
      </div>
    </div>
  `;
}

function BannerCarouselFrontend() {
  const [attributes] = useInteractiveAttributes<BannerCarouselAttributes>();
  const containerRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => buildBannerCarouselHtml(attributes), [attributes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    // eslint-disable-next-line no-unsanitized/property -- html is built from our own mock image URLs and JSON.stringify'd settings, not user input
    container.innerHTML = html;
    const el = container.querySelector<HTMLElement>("[data-carousel-settings]");
    if (!el) {
      return;
    }
    const swiper = initBannerCarousel(el);
    return () => {
      swiper.destroy(true, true);
      container.innerHTML = "";
    };
  }, [html]);

  return createPortal(<div ref={containerRef} style={{ padding: "2rem" }} />, document.body);
}

const meta: Meta<typeof Save> = {
  title: "Blocks/Banner Carousel/Frontend (live Swiper)",
  component: Save,
  argTypes: {
    "attributes.showArrows": { control: "boolean" },
    "attributes.showPagination": { control: "boolean" },
    "attributes.showScrollbar": { control: "boolean" },
    "attributes.loop": { control: "boolean" },
    "attributes.draggable": { control: "boolean" },
    "attributes.autoplay": { control: "boolean" },
    "attributes.autoplayDelay": { control: { type: "number", min: 500, max: 10000, step: 500 } },
    "attributes.slidesPerView": { control: "select", options: [1, 2, 3, "auto"] },
    "attributes.slidesPerMobile": { control: "select", options: [1, 2, "auto"] },
    "attributes.slidesPerTablet": { control: "select", options: [1, 2, 3, "auto"] },
    "attributes.slidesPerDesktop": { control: "select", options: [1, 2, 3, 4, "auto"] },
    "attributes.transitionEffect": {
      control: "select",
      options: ["slide", "fade", "cube", "coverflow", "flip", "cards"],
    },
    "attributes.arrowsPosition": {
      control: "select",
      options: ["sides", "bottom-left", "bottom-center", "bottom-right"],
    },
    "attributes.navPlacement": { control: "select", options: ["inside", "outside"] },
  },
  render: BannerCarouselFrontend,
};

export default meta;

type Story = StoryObj<typeof Save>;

const BASE_ATTRIBUTES = {
  ...getDefaultAttributes<BannerCarouselAttributes>(metadata.attributes),
  images: MOCK_MEDIA_LIBRARY,
};

export const Default: Story = {
  args: {
    attributes: { ...BASE_ATTRIBUTES, showArrows: true, showPagination: true },
  },
};

export const Autoplay: Story = {
  args: {
    attributes: {
      ...BASE_ATTRIBUTES,
      autoplay: true,
      loop: true,
      autoplayDelay: 2000,
      showPagination: true,
    },
  },
};

export const MultiSlide: Story = {
  args: {
    attributes: {
      ...BASE_ATTRIBUTES,
      slidesPerDesktop: 3,
      slidesPerTablet: 2,
      slidesPerMobile: 1,
      showArrows: true,
    },
  },
};

export const FadeEffect: Story = {
  args: {
    attributes: {
      ...BASE_ATTRIBUTES,
      transitionEffect: "fade",
      showPagination: true,
      loop: true,
    },
  },
};

import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Save from "./save";
import { initGalleryLightbox } from "./init";
import type { GalleryLightboxAttributes } from "./edit";
import metadata from "./block.json";
import { getDefaultAttributes, useInteractiveAttributes } from "@utils/storybook-edit-props";
import {
  MOCK_IMAGE_HERO,
  MOCK_IMAGE_BACKGROUND,
  MOCK_IMAGE_MAP,
} from "../../../.storybook/mock-assets";
import "./style.scss";

function buildGalleryLightboxHtml(attributes: GalleryLightboxAttributes): string {
  const { images = [], useMobileMedia, mobileImages = [], ...carouselSettings } = attributes;
  const [first, ...rest] = images;
  const totalCount = images.length;

  const imagesData = JSON.stringify(
    images.map(({ url, alt, type, poster, width, height }) => ({
      src: url,
      alt,
      type: type ?? "image",
      poster: poster ?? "",
      width: width ?? 0,
      height: height ?? 0,
    }))
  ).replace(/"/g, "&quot;");
  const mobileImagesData =
    useMobileMedia && mobileImages.length
      ? JSON.stringify(
          mobileImages.map(({ url, alt, type, poster, width, height }) => ({
            src: url,
            alt,
            type: type ?? "image",
            poster: poster ?? "",
            width: width ?? 0,
            height: height ?? 0,
          }))
        ).replace(/"/g, "&quot;")
      : "";
  const settingsData = JSON.stringify(carouselSettings).replace(/"/g, "&quot;");

  let countBadge = "";
  if (totalCount > 1) {
    countBadge = carouselSettings.trackActiveSlide
      ? `<span class="gallery-lightbox-count" aria-hidden="true"><span class="gallery-lightbox-count__current">01</span> / ${String(totalCount).padStart(2, "0")}</span>`
      : `<span class="gallery-lightbox-count" aria-hidden="true">+${rest.length}</span>`;
  }

  return `
    <div
      data-gallery-lightbox=""
      data-images="${imagesData}"
      ${mobileImagesData ? `data-mobile-images="${mobileImagesData}"` : ""}
      data-settings="${settingsData}"
    >
      <button class="gallery-lightbox-trigger" type="button" aria-label="${first.alt || "Open gallery"}" style="${first.width && first.height ? `aspect-ratio:${first.width}/${first.height}` : ""}">
        <img src="${first.type === "video" ? first.poster || first.url : first.url}" alt="${first.alt}" />
        ${first.type === "video" ? '<span class="gallery-lightbox-video-badge" aria-hidden="true">&#9654;</span>' : ""}
        ${countBadge}
      </button>
    </div>
  `;
}

function GalleryLightboxFrontend() {
  const [attributes] = useInteractiveAttributes<GalleryLightboxAttributes>();
  const containerRef = useRef<HTMLDivElement>(null);
  const html = useMemo(() => buildGalleryLightboxHtml(attributes), [attributes]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    // eslint-disable-next-line no-unsanitized/property -- html is built from our own mock image URLs and JSON.stringify'd settings, not user input
    container.innerHTML = html;
    const gallery = container.querySelector<HTMLElement>("[data-gallery-lightbox]");
    if (!gallery) {
      return;
    }
    initGalleryLightbox(gallery);
  }, [html]);

  return createPortal(
    <div ref={containerRef} style={{ padding: "2rem", maxWidth: "25rem" }} />,
    document.body
  );
}

const meta: Meta<typeof Save> = {
  title: "Blocks/Gallery Lightbox/Frontend (live lightbox)",
  component: Save,
  parameters: {
    docs: {
      description: {
        component:
          "Click the thumbnail to open the real lightbox — this mounts the actual `initGalleryLightbox()` frontend script (Swiper + zoom + keyboard/backdrop close), not just the editor placeholder shown in the `Edit` story. Renders a hand-built twin of `save.tsx`'s markup rather than the real `Save` component: calling `Save`'s real `useBlockProps.save()` outside a full WP admin bootstrap throws (`Cannot read properties of undefined (reading 'align')`), the same class of crash `banner-carousel` hit.",
      },
    },
  },
  argTypes: {
    "attributes.showArrows": { control: "boolean" },
    "attributes.showPagination": { control: "boolean" },
    "attributes.loop": { control: "boolean" },
    "attributes.trackActiveSlide": { control: "boolean" },
    "attributes.lockHeight": { control: "boolean" },
    "attributes.arrowsPosition": {
      control: "select",
      options: ["sides", "bottom-left", "bottom-center", "bottom-right"],
    },
    "attributes.navPlacement": { control: "select", options: ["inside", "outside"] },
  },
  render: GalleryLightboxFrontend,
};

export default meta;

type Story = StoryObj<typeof Save>;

const MOCK_IMAGES = [
  {
    id: 1,
    url: MOCK_IMAGE_HERO,
    alt: "Storybook mock slide 1",
    caption: "",
    type: "image" as const,
    poster: "",
    width: 1600,
    height: 900,
  },
  {
    id: 2,
    url: MOCK_IMAGE_BACKGROUND,
    alt: "Storybook mock slide 2",
    caption: "",
    type: "image" as const,
    poster: "",
    width: 1600,
    height: 900,
  },
  {
    id: 3,
    url: MOCK_IMAGE_MAP,
    alt: "Storybook mock slide 3",
    caption: "",
    type: "image" as const,
    poster: "",
    width: 1600,
    height: 900,
  },
];

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<GalleryLightboxAttributes>(metadata.attributes),
      images: MOCK_IMAGES,
    },
  },
};

export const TrackActiveSlide: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<GalleryLightboxAttributes>(metadata.attributes),
      images: MOCK_IMAGES,
      trackActiveSlide: true,
    },
  },
};

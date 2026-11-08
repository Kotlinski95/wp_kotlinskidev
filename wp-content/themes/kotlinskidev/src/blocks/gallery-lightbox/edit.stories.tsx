import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type GalleryLightboxAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import {
  MOCK_IMAGE_HERO,
  MOCK_IMAGE_BACKGROUND,
  MOCK_IMAGE_MAP,
} from "../../../.storybook/mock-assets";
import "./index";

function GalleryLightboxStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<GalleryLightboxAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/gallery-lightbox"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Gallery Lightbox",
  component: Edit,
  render: GalleryLightboxStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

const MOCK_IMAGES = [
  {
    id: 1,
    url: MOCK_IMAGE_HERO,
    thumbnailUrl: MOCK_IMAGE_HERO,
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
    thumbnailUrl: MOCK_IMAGE_BACKGROUND,
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
    thumbnailUrl: MOCK_IMAGE_MAP,
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

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<GalleryLightboxAttributes>(metadata.attributes),
  },
};

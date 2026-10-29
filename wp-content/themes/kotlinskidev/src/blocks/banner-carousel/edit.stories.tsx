import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type BannerCarouselAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_MEDIA_LIBRARY } from "../../../.storybook/mock-media-upload";
import "./index";

function BannerCarouselStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<BannerCarouselAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/banner-carousel"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Banner Carousel",
  component: Edit,
  render: BannerCarouselStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<BannerCarouselAttributes>(metadata.attributes),
      images: MOCK_MEDIA_LIBRARY,
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<BannerCarouselAttributes>(metadata.attributes),
  },
};

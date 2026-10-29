import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type HeroCarouselAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function HeroCarouselStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<HeroCarouselAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/hero-carousel"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Hero Carousel",
  component: Edit,
  render: HeroCarouselStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<HeroCarouselAttributes>(metadata.attributes),
  },
};

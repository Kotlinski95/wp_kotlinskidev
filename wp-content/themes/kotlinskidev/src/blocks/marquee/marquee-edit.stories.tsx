import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type MarqueeAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function MarqueeStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<MarqueeAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/marquee"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Marquee",
  component: Edit,
  render: MarqueeStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<MarqueeAttributes>(metadata.attributes),
  },
};

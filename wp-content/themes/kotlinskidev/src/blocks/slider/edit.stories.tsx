import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type SliderAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function SliderStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<SliderAttributes>();

  return (
    <RealBlockEdit
      name="wpe/slider"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Slider",
  component: Edit,
  render: SliderStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<SliderAttributes>(metadata.attributes),
  },
};

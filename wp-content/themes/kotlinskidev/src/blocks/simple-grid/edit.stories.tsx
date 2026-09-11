import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type SimpleGridAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function SimpleGridStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<SimpleGridAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/simple-grid"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Simple Grid",
  component: Edit,
  render: SimpleGridStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<SimpleGridAttributes>(metadata.attributes),
  },
};

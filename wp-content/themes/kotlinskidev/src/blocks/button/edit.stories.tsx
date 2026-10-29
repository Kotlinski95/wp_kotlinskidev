import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ButtonAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function ButtonStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ButtonAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/button"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Button",
  component: Edit,
  render: ButtonStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ButtonAttributes>(metadata.attributes),
      text: "Get in touch",
      url: "#",
    },
  },
};

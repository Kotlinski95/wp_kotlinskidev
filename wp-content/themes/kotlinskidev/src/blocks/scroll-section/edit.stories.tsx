import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ScrollSectionAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function ScrollSectionStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ScrollSectionAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/scroll-section"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Scroll Section",
  component: Edit,
  render: ScrollSectionStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<ScrollSectionAttributes>(metadata.attributes),
  },
};

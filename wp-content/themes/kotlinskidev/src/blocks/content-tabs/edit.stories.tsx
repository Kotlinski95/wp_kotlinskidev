import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ContentTabsAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function ContentTabsStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ContentTabsAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/content-tabs"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Content Tabs",
  component: Edit,
  render: ContentTabsStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<ContentTabsAttributes>(metadata.attributes),
  },
};

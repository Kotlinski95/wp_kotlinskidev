import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type PopularPagesAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function PopularPagesStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<PopularPagesAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/popular-pages"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Popular Pages",
  render: PopularPagesStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<PopularPagesAttributes>(metadata.attributes),
      title: "Popular Pages",
      count: 5,
    },
  },
};

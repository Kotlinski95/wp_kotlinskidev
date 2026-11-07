import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ArticleTocAttributes } from "./edit";
import { RealBlockEdit, useInteractiveAttributes } from "@utils/storybook-edit-props";
import "./index";

function ArticleTocStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ArticleTocAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/article-toc"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Article TOC",
  component: Edit,
  render: ArticleTocStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: { attributes: {} },
};

export const CustomColors: Story = {
  args: {
    attributes: {
      customAccentColor: "#d6336c",
      customActiveBackgroundColor: "#fde8ef",
    },
  },
};

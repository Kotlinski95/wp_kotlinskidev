import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ArticleCardAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function ArticleCardStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ArticleCardAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/article-card"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Article Card",
  component: Edit,
  argTypes: {
    "attributes.cardId": {
      control: "select",
      options: [1, 2, 3],
      description:
        "Which Storybook mock card to preview (see .storybook/mock-server-side-render.tsx)",
    },
  },
  render: ArticleCardStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: { ...getDefaultAttributes<ArticleCardAttributes>(metadata.attributes), cardId: 1 },
  },
};

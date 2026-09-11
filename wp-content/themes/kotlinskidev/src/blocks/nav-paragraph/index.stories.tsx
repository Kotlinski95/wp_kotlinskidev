import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type NavParagraphAttributes } from "../nav-content";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "../nav-content";

function NavParagraphStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<NavParagraphAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/nav-paragraph"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Nav Paragraph",
  render: NavParagraphStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<NavParagraphAttributes>(metadata.attributes),
      content: "Reach out any time — I usually reply within a day.",
    },
  },
};

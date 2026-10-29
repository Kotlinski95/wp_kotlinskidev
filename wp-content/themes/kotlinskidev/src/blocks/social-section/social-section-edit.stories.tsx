import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type SocialSectionAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function SocialSectionStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<SocialSectionAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/social-section"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Social Section",
  render: SocialSectionStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<SocialSectionAttributes>(metadata.attributes),
  },
};

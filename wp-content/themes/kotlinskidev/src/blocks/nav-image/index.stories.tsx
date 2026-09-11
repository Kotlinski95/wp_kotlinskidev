import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type NavImageAttributes } from "../nav-content";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_IMAGE_TEAM } from "../../../.storybook/mock-assets";
import "../nav-content";

function NavImageStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<NavImageAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/nav-image"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Nav Image",
  render: NavImageStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<NavImageAttributes>(metadata.attributes),
      mediaId: 1,
      mediaUrl: MOCK_IMAGE_TEAM,
      altText: "Storybook mock nav image",
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<NavImageAttributes>(metadata.attributes),
  },
};

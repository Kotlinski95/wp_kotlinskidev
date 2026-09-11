import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ResponsiveImageAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_IMAGE_HERO, MOCK_IMAGE_TEAM } from "../../../.storybook/mock-assets";
import "./index";

function ResponsiveImageStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ResponsiveImageAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/responsive-image"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Responsive Image",
  component: Edit,
  render: ResponsiveImageStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ResponsiveImageAttributes>(metadata.attributes),
      desktopImageId: 1,
      desktopImageUrl: MOCK_IMAGE_HERO,
      mobileImageId: 2,
      mobileImageUrl: MOCK_IMAGE_TEAM,
      alt: "Storybook mock responsive image",
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<ResponsiveImageAttributes>(metadata.attributes),
  },
};

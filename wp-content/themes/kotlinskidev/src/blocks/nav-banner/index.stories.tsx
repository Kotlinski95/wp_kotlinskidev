import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type NavBannerAttributes } from "../nav-content";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_IMAGE_WORK } from "../../../.storybook/mock-assets";
import "../nav-content";

function NavBannerStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<NavBannerAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/nav-banner"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Nav Banner",
  render: NavBannerStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<NavBannerAttributes>(metadata.attributes),
      mediaId: 1,
      mediaUrl: MOCK_IMAGE_WORK,
      altText: "Storybook mock nav banner",
      heading: "New: Storybook block docs",
      description: "Browse every custom block in isolation, with real controls.",
      linkUrl: "#",
      linkLabel: "Explore",
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<NavBannerAttributes>(metadata.attributes),
  },
};

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type SocialItemAttributes } from "./index";
import metadata from "./item/block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_ICON_LINKEDIN } from "../../../.storybook/mock-assets";
import "./index";

function SocialItemStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<SocialItemAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/social-item"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Social Item",
  render: SocialItemStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<SocialItemAttributes>(metadata.attributes),
      label: "LinkedIn",
      url: "#",
      navIconId: 1,
      navIconUrl: MOCK_ICON_LINKEDIN,
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<SocialItemAttributes>(metadata.attributes),
  },
};

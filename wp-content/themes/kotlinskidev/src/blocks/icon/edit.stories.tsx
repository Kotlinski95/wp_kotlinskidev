import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type IconAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_ICON } from "../../../.storybook/mock-assets";
import "./index";

function IconStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<IconAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/icon"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Icon",
  component: Edit,
  render: IconStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<IconAttributes>(metadata.attributes),
      mediaId: 1,
      mediaUrl: MOCK_ICON,
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<IconAttributes>(metadata.attributes),
  },
};

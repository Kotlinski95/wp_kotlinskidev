import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type MarqueeItemAttributes } from "./item/edit";
import metadata from "./item/block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_ICON } from "../../../.storybook/mock-assets";
import "./index";

function MarqueeItemStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<MarqueeItemAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/marquee-item"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Marquee Item",
  component: Edit,
  render: MarqueeItemStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<MarqueeItemAttributes>(metadata.attributes),
      label: "React",
      navIconId: 1,
      navIconUrl: MOCK_ICON,
      description:
        "My default for anything interactive — component-driven UIs that stay easy to extend when a client's product grows past the first version.",
      docUrl: "https://react.dev",
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<MarqueeItemAttributes>(metadata.attributes),
  },
};

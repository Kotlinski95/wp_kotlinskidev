import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Edit, type ScrollToTopAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

function ScrollToTopStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ScrollToTopAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/scroll-to-top"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Scroll To Top",
  component: Edit,
  render: ScrollToTopStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Fixed: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ScrollToTopAttributes>(metadata.attributes),
      variant: "fixed",
    },
  },
};

export const Bar: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ScrollToTopAttributes>(metadata.attributes),
      variant: "bar",
    },
  },
};

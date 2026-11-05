import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type NavLinkAttributes } from "../nav-content";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "../nav-content";

function NavLinkStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<NavLinkAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/nav-link"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Nav Link",
  render: NavLinkStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<NavLinkAttributes>(metadata.attributes),
      label: "Services",
      url: "#",
    },
  },
};

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { type SearchPanelAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function SearchPanelStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<SearchPanelAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/search-panel"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta = {
  title: "Blocks/Search Panel",
  parameters: {
    docs: {
      description: {
        component:
          "Click the trigger button to toggle the panel open — it renders a real `core/search` block through `InnerBlocks`.",
      },
    },
  },
  render: SearchPanelStory,
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<SearchPanelAttributes>(metadata.attributes),
  },
};

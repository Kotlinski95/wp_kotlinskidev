import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Edit, type NavigationAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

function NavigationStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<NavigationAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/navigation"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Navigation",
  component: Edit,
  parameters: {
    docs: {
      description: {
        component:
          "The menu dropdown queries `core`'s real `getEntityRecords('postType', 'wp_navigation', ...)` selector, which has no live WP backend to resolve against in Storybook and stays on \"Loading…\" — the same known gap as `content-block`. Display mode, overlay, and visibility Controls below are real.",
      },
    },
  },
  render: NavigationStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<NavigationAttributes>(metadata.attributes),
  },
};

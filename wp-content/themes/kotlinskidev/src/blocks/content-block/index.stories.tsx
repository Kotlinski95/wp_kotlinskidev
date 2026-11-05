import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Edit, type ContentBlockAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

function ContentBlockStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ContentBlockAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/content-block"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Content Block",
  component: Edit,
  parameters: {
    docs: {
      description: {
        component:
          "The reusable-block dropdown queries `core`'s real `getEntityRecords('postType', 'wp_block', ...)` selector, which has no live WP backend to resolve against in Storybook and stays on \"Loading…\" — a known, acceptable gap shared with every other block that reads live WP data instead of a mocked `ServerSideRender` response.",
      },
    },
  },
  render: ContentBlockStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<ContentBlockAttributes>(metadata.attributes),
  },
};

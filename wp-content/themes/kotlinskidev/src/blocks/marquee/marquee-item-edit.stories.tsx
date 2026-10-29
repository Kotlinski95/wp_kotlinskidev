import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type MarqueeItemAttributes } from "./item/edit";
import metadata from "./item/block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
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
  parameters: {
    docs: {
      description: {
        component:
          "The modal picker's dropdown stays on \"Loading…\" here — same known gap as `modal-trigger`/`content-block`/`navigation` (`core`'s real `getEntityRecords('postType', 'kt_modal', ...)` has no live WP backend to resolve in Storybook).",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<MarqueeItemAttributes>(metadata.attributes),
  },
};

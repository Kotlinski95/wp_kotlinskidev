import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type OfferTableAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function OfferTableStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<OfferTableAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/offer-table"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Offer Table",
  component: Edit,
  render: OfferTableStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<OfferTableAttributes>(metadata.attributes),
      offerKey: "website",
    },
  },
};

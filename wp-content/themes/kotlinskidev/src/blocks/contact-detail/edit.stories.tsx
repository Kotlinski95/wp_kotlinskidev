import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ContactDetailAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function ContactDetailStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ContactDetailAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/contact-detail"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Contact Detail",
  component: Edit,
  argTypes: {
    "attributes.field": {
      control: "select",
      options: ["address", "phone", "email", "hours"],
    },
    "attributes.showLabel": {
      control: "boolean",
    },
  },
  render: ContactDetailStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<ContactDetailAttributes>(metadata.attributes),
  },
};

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Edit, type ProtectedContentAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

function ProtectedContentStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ProtectedContentAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/protected-content"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Protected Content",
  component: Edit,
  render: ProtectedContentStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ProtectedContentAttributes>(metadata.attributes),
      content: "hello@example.com",
      useProtection: true,
      protectionType: "email",
    },
  },
};

export const Unprotected: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ProtectedContentAttributes>(metadata.attributes),
      content: "Plain, unprotected text.",
    },
  },
};

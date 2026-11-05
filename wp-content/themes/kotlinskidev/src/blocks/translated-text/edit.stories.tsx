import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type TranslatedTextAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function TranslatedTextStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<TranslatedTextAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/translated-text"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Translated Text",
  component: Edit,
  render: TranslatedTextStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<TranslatedTextAttributes>(metadata.attributes),
      fallbackText: "Get in touch",
      stringName: "contact-cta-heading",
    },
  },
};

import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Edit, type ContactFormAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

function ContactFormStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ContactFormAttributes>();

  return (
    <RealBlockEdit
      name="contact-form-ts/form"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Contact Form",
  component: Edit,
  render: ContactFormStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<ContactFormAttributes>(metadata.attributes),
  },
};

export const WithCaptcha: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ContactFormAttributes>(metadata.attributes),
      enableCaptcha: true,
      captchaProvider: "turnstile",
      turnstileSiteKey: "0x4AAAAAAA-storybook-mock",
    },
  },
};

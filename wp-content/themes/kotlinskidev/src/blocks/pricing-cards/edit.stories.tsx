import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { RealBlockEdit } from "@utils/storybook-edit-props";
import "./index";

const meta: Meta = {
  title: "Blocks/Pricing Cards",
  render: () => (
    <RealBlockEdit name="kotlinskidev/pricing-cards" attributes={{}} setAttributes={() => {}} />
  ),
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};

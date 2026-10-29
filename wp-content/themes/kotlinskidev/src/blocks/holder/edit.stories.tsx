import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { RealBlockEdit } from "@utils/storybook-edit-props";
import "../simple-grid/index";

const meta: Meta = {
  title: "Blocks/Holder",
  render: () => (
    <RealBlockEdit name="kotlinskidev/holder" attributes={{}} setAttributes={() => {}} />
  ),
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};

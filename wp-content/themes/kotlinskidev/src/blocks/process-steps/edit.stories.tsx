import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { RealBlockEdit } from "@utils/storybook-edit-props";
import "./index";

const meta: Meta = {
  title: "Blocks/Process Steps",
  render: () => (
    <RealBlockEdit name="kotlinskidev/process-steps" attributes={{}} setAttributes={() => {}} />
  ),
};

export default meta;

type Story = StoryObj;

export const Default: Story = {};

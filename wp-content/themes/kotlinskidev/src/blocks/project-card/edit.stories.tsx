import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ProjectCardAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function ProjectCardStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ProjectCardAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/project-card"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Project Card",
  component: Edit,
  argTypes: {
    "attributes.cardId": {
      control: "select",
      options: [1, 2, 3],
      description:
        "Which Storybook mock card to preview (see .storybook/mock-server-side-render.tsx)",
    },
  },
  render: ProjectCardStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: { ...getDefaultAttributes<ProjectCardAttributes>(metadata.attributes), cardId: 1 },
  },
};

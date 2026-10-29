import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type ModelViewerAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import { MOCK_IMAGE_WORK } from "../../../.storybook/mock-assets";
import "./index";

function ModelViewerStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<ModelViewerAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/model-viewer"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Model Viewer",
  component: Edit,
  parameters: {
    docs: {
      description: {
        component:
          "The editor preview only ever shows the fallback poster image and a badge — matching the real block, whose three.js runtime loads on the frontend only, never in the editor canvas.",
      },
    },
  },
  render: ModelViewerStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<ModelViewerAttributes>(metadata.attributes),
      modelId: 1,
      modelUrl: "storybook-mock-model.glb",
      posterId: 1,
      posterUrl: MOCK_IMAGE_WORK,
    },
  },
};

export const Empty: Story = {
  args: {
    attributes: getDefaultAttributes<ModelViewerAttributes>(metadata.attributes),
  },
};

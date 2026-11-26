import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import apiFetch from "@wordpress/api-fetch";
import { BlockEditorProvider, BlockList } from "@wordpress/block-editor";
import { createBlock, type Block } from "@wordpress/blocks";
import Edit, { type SpeedDialAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

apiFetch.use((options) => {
  if (options.path?.includes("trigger-options")) {
    return Promise.resolve({
      features: ["biggerText", "contrast"],
      profiles: ["adhdFriendly", "dyslexiaFriendly"],
    });
  }
  return Promise.resolve({});
});

const defaults = getDefaultAttributes<SpeedDialAttributes>(metadata.attributes);

function SpeedDialStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<SpeedDialAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/speed-dial"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

function AllActionsStory() {
  const [blocks, setBlocks] = useState<Block[]>(() => [
    createBlock("kotlinskidev/speed-dial", {}, [
      createBlock("kotlinskidev/speed-dial-item", { action: "phone" }),
      createBlock("kotlinskidev/speed-dial-item", { action: "email" }),
      createBlock("kotlinskidev/speed-dial-item", { action: "accessibility" }),
      createBlock("kotlinskidev/speed-dial-item", { action: "url", value: "https://example.com" }),
      createBlock("kotlinskidev/speed-dial-item", {
        action: "trigger",
        triggerAction: "profile:adhdFriendly",
      }),
      createBlock("kotlinskidev/speed-dial-item", { action: "custom" }),
    ]),
  ]);

  return (
    <BlockEditorProvider value={blocks} onInput={setBlocks} onChange={setBlocks} settings={{}}>
      <BlockList />
    </BlockEditorProvider>
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Speed Dial",
  component: Edit,
  render: SpeedDialStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: { attributes: defaults },
};

export const AllActions: Story = {
  render: AllActionsStory,
  args: { attributes: defaults },
};

export const TopLeftDown: Story = {
  args: {
    attributes: {
      ...defaults,
      position: { desktop: "top-left", tablet: "top-left", mobile: "top-left" },
      direction: "down",
    },
  },
};

export const LabelsAlways: Story = {
  args: { attributes: { ...defaults, labels: "always" } },
};

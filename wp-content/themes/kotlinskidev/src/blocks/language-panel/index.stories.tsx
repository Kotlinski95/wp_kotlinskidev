import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { LanguagePanelEdit, type LanguagePanelAttributes } from "./index";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";

function LanguagePanelStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<LanguagePanelAttributes>();

  return (
    <RealBlockEdit
      name="kotlinskidev/language-panel"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof LanguagePanelEdit> = {
  title: "Blocks/Language Panel",
  component: LanguagePanelEdit,
  parameters: {
    docs: {
      description: {
        component:
          "Click the trigger button to toggle the panel open. Its content, a `polylang/navigation-language-switcher` block, renders through `InnerBlocks` but shows WordPress's own \"block isn't available\" placeholder here since the Polylang plugin (which registers that block) isn't installed in this Storybook environment.",
      },
    },
  },
  render: LanguagePanelStory,
};

export default meta;

type Story = StoryObj<typeof LanguagePanelEdit>;

export const Default: Story = {
  args: {
    attributes: getDefaultAttributes<LanguagePanelAttributes>(metadata.attributes),
  },
};

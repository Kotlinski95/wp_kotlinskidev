import React from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import Edit, { type GoogleMapsBlockAttributes } from "./edit";
import metadata from "./block.json";
import {
  getDefaultAttributes,
  useInteractiveAttributes,
  RealBlockEdit,
} from "@utils/storybook-edit-props";
import "./index";

function GoogleMapsStory() {
  const [attributes, setAttributes] = useInteractiveAttributes<GoogleMapsBlockAttributes>();

  return (
    <RealBlockEdit
      name="googlemaps/google-maps-block"
      attributes={attributes}
      setAttributes={setAttributes as (attrs: Record<string, unknown>) => void}
    />
  );
}

const meta: Meta<typeof Edit> = {
  title: "Blocks/Google Maps",
  component: Edit,
  parameters: {
    docs: {
      description: {
        component:
          "The map only ever loads the real Google Maps JS API against a real API key, so this story deliberately leaves `apiKey` empty — filling it in would try to call Google's live API from within Storybook. The placeholder box, its width/height, and every other Control below are real and wired to `setAttributes`.",
      },
    },
  },
  render: GoogleMapsStory,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {
    attributes: {
      ...getDefaultAttributes<GoogleMapsBlockAttributes>(metadata.attributes),
      address: "Warsaw, Poland",
    },
  },
};

import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-webpack5";
import ResponsiveMediaPanel, { type ResponsiveMedia } from "./panel";

function PanelStory({
  allowedTypes,
  desktopWidth,
  initial,
}: {
  allowedTypes: string[];
  desktopWidth?: number;
  initial: ResponsiveMedia;
}) {
  const [slots, setSlots] = useState<ResponsiveMedia>(initial);

  return (
    <ResponsiveMediaPanel
      slots={slots}
      onChange={setSlots}
      allowedTypes={allowedTypes}
      desktopLabel="Cover media"
      desktopUrl="https://example.test/uploads/desktop.mp4"
      desktopWidth={desktopWidth}
    />
  );
}

const meta: Meta<typeof PanelStory> = {
  title: "Editor/Responsive media panel",
  component: PanelStory,
};

export default meta;

type Story = StoryObj<typeof PanelStory>;

export const Empty: Story = {
  args: { allowedTypes: ["video"], initial: {} },
};

export const WithMobileVariant: Story = {
  args: {
    allowedTypes: ["video"],
    desktopWidth: 1920,
    initial: { mobile: { id: 3, url: "https://example.test/uploads/mobile.mp4", width: 720 } },
  },
};

export const LargerThanDesktopWarning: Story = {
  args: {
    allowedTypes: ["image"],
    desktopWidth: 800,
    initial: { mobile: { id: 3, url: "https://example.test/uploads/mobile.webp", width: 1600 } },
  },
};

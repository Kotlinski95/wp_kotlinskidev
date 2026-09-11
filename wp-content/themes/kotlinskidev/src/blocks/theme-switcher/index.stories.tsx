import type { Meta, StoryObj } from "@storybook/react-webpack5";
import { Edit } from "./index";

const meta: Meta<typeof Edit> = {
  title: "Blocks/Theme Switcher",
  component: Edit,
};

export default meta;

type Story = StoryObj<typeof Edit>;

export const Default: Story = {
  args: {},
};

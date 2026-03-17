import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SearchInput } from "./SearchInput";

type Story = StoryObj<typeof SearchInput>;

const meta: Meta<typeof SearchInput> = {
  title: "Filter/SearchInput",
  component: SearchInput,
};
export default meta;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => {},
  },
};

export const WithValue: Story = {
  args: {
    value: "React hooks",
    onChange: () => {},
  },
};

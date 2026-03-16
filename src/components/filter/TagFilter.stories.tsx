import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TagFilter } from "./TagFilter";

const meta: Meta<typeof TagFilter> = {
  title: "Filter/TagFilter",
  component: TagFilter,
};
export default meta;

type Story = StoryObj<typeof TagFilter>;

export const Default: Story = {
  args: {
    selectedTag: "React",
    onTagChange: () => {},
  },
};

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TagFilter } from "./TagFilter";

type Story = StoryObj<typeof TagFilter>;

const meta: Meta<typeof TagFilter> = {
  title: "Filter/TagFilter",
  component: TagFilter,
};
export default meta;

export const Default: Story = {
  args: {
    selectedTag: "React",
    onTagChange: () => {},
  },
};

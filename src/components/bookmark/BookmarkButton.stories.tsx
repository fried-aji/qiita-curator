import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookmarkButton } from "./BookmarkButton";

type Story = StoryObj<typeof BookmarkButton>;

const meta: Meta<typeof BookmarkButton> = {
  title: "Bookmark/BookmarkButton",
  component: BookmarkButton,
};
export default meta;

export const Default: Story = {
  args: {
    isBookmarked: false,
    onClick: () => {},
  },
};

export const Bookmarked: Story = {
  args: {
    isBookmarked: true,
    onClick: () => {},
  },
};

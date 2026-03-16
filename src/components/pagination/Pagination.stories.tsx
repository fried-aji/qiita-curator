import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "Pagination/Pagination",
  component: Pagination,
};
export default meta;

type Story = StoryObj<typeof Pagination>;

export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 20,
    tag: "React",
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 10,
    totalPages: 20,
    tag: "React",
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 20,
    totalPages: 20,
    tag: "React",
  },
};

export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    tag: "React",
  },
};

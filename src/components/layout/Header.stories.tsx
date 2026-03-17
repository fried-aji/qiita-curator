import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Header } from "./Header";

type Story = StoryObj<typeof Header>;

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
};
export default meta;

export const Default: Story = {};

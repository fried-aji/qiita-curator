import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SessionProvider } from "next-auth/react";
import { Header } from "./Header";

type Story = StoryObj<typeof Header>;

const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};
export default meta;

export const Default: Story = {};

export const LoggedIn: Story = {
  decorators: [
    (Story) => (
      <SessionProvider
        session={{
          user: {
            id: "1",
            name: "テストユーザー",
            email: "test@example.com",
            image: null,
          },
          expires: "2099-01-01",
        }}
      >
        <Story />
      </SessionProvider>
    ),
  ],
};

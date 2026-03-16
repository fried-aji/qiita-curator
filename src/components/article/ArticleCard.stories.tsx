import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArticleCard } from "./ArticleCard";

const MOCK_ARTICLE = {
  id: "article-1",
  title: "Reactの基礎：useStateを理解する",
  url: "https://qiita.com/user/items/article-1",
  created_at: "2026-01-01T00:00:00+09:00",
  likes_count: 42,
  tags: [{ name: "React" }, { name: "TypeScript" }],
  user: { id: "testuser", profile_image_url: "https://placehold.co/40" },
};

const meta: Meta<typeof ArticleCard> = {
  title: "Article/ArticleCard",
  component: ArticleCard,
};
export default meta;

type Story = StoryObj<typeof ArticleCard>;

export const Default: Story = {
  args: {
    article: MOCK_ARTICLE,
    isBookmarked: false,
    onBookmarkToggle: () => {},
  },
};

export const Bookmarked: Story = {
  args: {
    article: MOCK_ARTICLE,
    isBookmarked: true,
    onBookmarkToggle: () => {},
  },
};

export const ManyTags: Story = {
  args: {
    article: {
      ...MOCK_ARTICLE,
      tags: [
        { name: "React" },
        { name: "TypeScript" },
        { name: "Next.js" },
        { name: "Storybook" },
      ],
    },
    isBookmarked: false,
    onBookmarkToggle: () => {},
  },
};

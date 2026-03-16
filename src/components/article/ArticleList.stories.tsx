import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArticleList } from "./ArticleList";

const MOCK_ARTICLES = [
  {
    id: "article-1",
    title: "Reactの基礎：useStateを理解する",
    url: "https://qiita.com/user/items/article-1",
    created_at: "2026-01-01T00:00:00+09:00",
    likes_count: 42,
    tags: [{ name: "React" }, { name: "TypeScript" }],
    user: { id: "testuser", profile_image_url: "https://placehold.co/40" },
  },
  {
    id: "article-2",
    title: "Next.js App RouterでSSRを実装する",
    url: "https://qiita.com/user/items/article-2",
    created_at: "2026-01-02T00:00:00+09:00",
    likes_count: 88,
    tags: [{ name: "Next.js" }, { name: "React" }],
    user: { id: "testuser2", profile_image_url: "https://placehold.co/40" },
  },
];

const meta: Meta<typeof ArticleList> = {
  title: "Article/ArticleList",
  component: ArticleList,
};
export default meta;

type Story = StoryObj<typeof ArticleList>;

export const Default: Story = {
  args: {
    articles: MOCK_ARTICLES,
    bookmarkedIds: [],
    onBookmarkToggle: () => {},
  },
};

export const WithBookmarks: Story = {
  args: {
    articles: MOCK_ARTICLES,
    bookmarkedIds: ["article-1"],
    onBookmarkToggle: () => {},
  },
};

export const Empty: Story = {
  args: {
    articles: [],
    bookmarkedIds: [],
    onBookmarkToggle: () => {},
  },
};

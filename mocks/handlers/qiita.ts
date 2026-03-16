import { http, HttpResponse } from "msw";

export const MOCK_ARTICLES = [
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
  {
    id: "article-3",
    title: "Storybookでコンポーネント管理を始める",
    url: "https://qiita.com/user/items/article-3",
    created_at: "2026-01-03T00:00:00+09:00",
    likes_count: 15,
    tags: [{ name: "Storybook" }],
    user: { id: "testuser3", profile_image_url: "https://placehold.co/40" },
  },
];

export const qiitaHandlers = [
  http.get("https://qiita.com/api/v2/items", () => {
    return HttpResponse.json(MOCK_ARTICLES, {
      headers: {
        "total-count": "3",
      },
    });
  }),
];

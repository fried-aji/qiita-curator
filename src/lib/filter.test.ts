import { describe, it, expect } from "vitest";
import { filterByKeyword } from "./filter";
import type { QiitaArticle } from "@/types/qiita";

const ARTICLES: QiitaArticle[] = [
  {
    id: "1",
    title: "Reactの基礎",
    url: "",
    created_at: "",
    likes_count: 0,
    tags: [{ name: "React" }],
    user: { id: "u1", profile_image_url: "" },
  },
  {
    id: "2",
    title: "Next.jsでSSR",
    url: "",
    created_at: "",
    likes_count: 0,
    tags: [{ name: "Next.js" }],
    user: { id: "u2", profile_image_url: "" },
  },
];

describe("filterByKeyword", () => {
  it("空文字の場合は全件返す", () => {
    expect(filterByKeyword(ARTICLES, "")).toHaveLength(2);
  });

  it("キーワードに一致する記事のみ返す", () => {
    const result = filterByKeyword(ARTICLES, "React");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("大文字小文字を区別しない", () => {
    const result = filterByKeyword(ARTICLES, "react");
    expect(result).toHaveLength(1);
  });

  it("一致なしの場合は空配列を返す", () => {
    const result = filterByKeyword(ARTICLES, "Vue");
    expect(result).toHaveLength(0);
  });
});

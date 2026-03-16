import type { QiitaArticle } from "@/types/qiita";

export const PER_PAGE = 20;

export async function fetchArticlesByTag(
  tag: string,
  page = 1,
  perPage = PER_PAGE
): Promise<{ articles: QiitaArticle[]; totalCount: number }> {
  const params = new URLSearchParams({
    tag,
    page: String(page),
    perPage: String(perPage),
  });

  const res = await fetch(`/api/articles?${params}`);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}

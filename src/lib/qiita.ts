import type { QiitaArticle } from "@/types/qiita";

const QIITA_API_BASE = "https://qiita.com/api/v2";

export const PER_PAGE = 20;

export async function fetchArticlesByTag(
  tag: string,
  page = 1,
  perPage = PER_PAGE
): Promise<{ articles: QiitaArticle[]; totalCount: number }> {
  const params = new URLSearchParams({
    query: `tag:${tag}`,
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(`${QIITA_API_BASE}/items?${params}`);

  if (!res.ok) {
    throw new Error(`Qiita API error: ${res.status}`);
  }

  const totalCount = parseInt(res.headers.get("total-count") ?? "0", 10);
  const articles: QiitaArticle[] = await res.json();
  return { articles, totalCount };
}

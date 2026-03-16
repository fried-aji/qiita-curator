import type { QiitaArticle } from "@/types/qiita";

const QIITA_API_BASE = "https://qiita.com/api/v2";

export async function fetchArticlesByTag(
  tag: string,
  page = 1,
  perPage = 20
): Promise<QiitaArticle[]> {
  const params = new URLSearchParams({
    query: `tag:${tag}`,
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(`${QIITA_API_BASE}/items?${params}`);

  if (!res.ok) {
    throw new Error(`Qiita API error: ${res.status}`);
  }

  return res.json();
}

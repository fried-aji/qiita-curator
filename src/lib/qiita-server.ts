import type { QiitaArticle } from "@/types/qiita";
import { ALL_TAG, DEFAULT_TAGS } from "@/components/filter/TagFilter";
import { PER_PAGE } from "@/lib/qiita";

const QIITA_API_BASE = "https://qiita.com/api/v2";

export class QiitaApiError extends Error {
  constructor(public status: number) {
    super(`Qiita API error: ${status}`);
  }
}

export async function fetchArticlesFromQiita(
  tag: string,
  page = 1,
  perPage = PER_PAGE
): Promise<{ articles: QiitaArticle[]; totalCount: number }> {
  const query =
    tag === ALL_TAG
      ? DEFAULT_TAGS.map((t) => `tag:${t}`).join(" OR ")
      : `tag:${tag}`;

  const params = new URLSearchParams({
    query,
    page: String(page),
    per_page: String(perPage),
  });

  const headers: HeadersInit = {};
  if (process.env.QIITA_ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.QIITA_ACCESS_TOKEN}`;
  }

  const res = await fetch(`${QIITA_API_BASE}/items?${params}`, { headers });

  if (!res.ok) {
    throw new QiitaApiError(res.status);
  }

  const totalCount = parseInt(
    res.headers.get("X-Total-Count") ?? res.headers.get("total-count") ?? "0",
    10
  );
  const articles: QiitaArticle[] = await res.json();

  return { articles, totalCount };
}

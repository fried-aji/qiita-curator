import type { QiitaArticle } from "@/types/qiita";

export function filterByKeyword(articles: QiitaArticle[], keyword: string): QiitaArticle[] {
  if (!keyword.trim()) return articles;
  const lower = keyword.toLowerCase();
  return articles.filter((a) => a.title.toLowerCase().includes(lower));
}

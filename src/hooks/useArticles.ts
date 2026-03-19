import { useQuery } from "@tanstack/react-query";
import { PER_PAGE } from "@/lib/qiita";
import type { QiitaArticle } from "@/types/qiita";

interface ArticlesResponse {
  articles: QiitaArticle[];
  totalCount: number;
}

export function useArticles(tag: string, page: number) {
  return useQuery<ArticlesResponse>({
    queryKey: ["articles", tag, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        tag,
        page: String(page),
        perPage: String(PER_PAGE),
      });
      const res = await fetch(`/api/articles?${params}`);
      if (!res.ok) throw new Error("Failed to fetch articles");
      return res.json();
    },
  });
}

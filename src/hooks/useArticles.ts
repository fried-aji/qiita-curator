import { useQuery } from "@tanstack/react-query";
import { fetchArticlesByTag } from "@/lib/qiita";

export function useArticles(tag: string, page = 1) {
  return useQuery({
    queryKey: ["articles", tag, page],
    queryFn: () => fetchArticlesByTag(tag, page),
    enabled: !!tag,
  });
}

import { useQuery } from "@tanstack/react-query";
import { fetchArticlesByTag } from "@/lib/qiita";

export function useArticles(tag: string) {
  return useQuery({
    queryKey: ["articles", tag],
    queryFn: () => fetchArticlesByTag(tag),
    enabled: !!tag,
  });
}

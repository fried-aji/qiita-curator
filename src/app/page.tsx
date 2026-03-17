import { ArticlesSection } from "@/components/articles/ArticlesSection";
import { fetchArticlesFromQiita } from "@/lib/qiita-server";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag = "all", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const { articles, totalCount } = await fetchArticlesFromQiita(tag, currentPage);

  return (
    <ArticlesSection
      key={tag}
      tag={tag}
      page={currentPage}
      articles={articles}
      totalCount={totalCount}
    />
  );
}

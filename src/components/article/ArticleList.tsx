import { ArticleCard } from "./ArticleCard";
import type { QiitaArticle } from "@/types/qiita";

interface Props {
  articles: QiitaArticle[];
  bookmarkedIds: string[];
  onBookmarkToggle: (article: QiitaArticle) => void;
}

export function ArticleList({
  articles,
  bookmarkedIds,
  onBookmarkToggle,
}: Props) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        記事が見つかりません
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isBookmarked={bookmarkedIds.includes(article.id)}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
}

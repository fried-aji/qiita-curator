"use client";

import { useState } from "react";
import { TagFilter, DEFAULT_TAGS } from "@/components/filter/TagFilter";
import { SearchInput } from "@/components/filter/SearchInput";
import { ArticleList } from "@/components/article/ArticleList";
import { useArticles } from "@/hooks/useArticles";
import { useBookmark } from "@/hooks/useBookmark";
import { filterByKeyword } from "@/lib/filter";

export default function Home() {
  const [selectedTag, setSelectedTag] = useState(DEFAULT_TAGS[0]);
  const [keyword, setKeyword] = useState("");
  const { data: articles = [], isLoading, isError } = useArticles(selectedTag);
  const { bookmarkedIds, toggle } = useBookmark();

  const filteredArticles = filterByKeyword(articles, keyword);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">技術記事</h1>
      <div className="space-y-3">
        <TagFilter selectedTag={selectedTag} onTagChange={setSelectedTag} />
        <SearchInput value={keyword} onChange={setKeyword} />
      </div>

      {isLoading && <p className="text-center">読み込み中...</p>}
      {isError && <p className="text-center text-destructive">記事の取得に失敗しました</p>}
      {!isLoading && !isError && (
        <ArticleList
          articles={filteredArticles}
          bookmarkedIds={bookmarkedIds}
          onBookmarkToggle={toggle}
        />
      )}
    </div>
  );
}

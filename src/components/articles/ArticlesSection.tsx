"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { TagFilter } from "@/components/filter/TagFilter";
import { SearchInput } from "@/components/filter/SearchInput";
import { ArticleList } from "@/components/article/ArticleList";
import { Pagination } from "@/components/pagination/Pagination";
import { useBookmark } from "@/hooks/useBookmark";
import { filterByKeyword } from "@/lib/filter";
import { PER_PAGE } from "@/lib/qiita";
import type { QiitaArticle } from "@/types/qiita";

interface Props {
  tag: string;
  page: number;
  articles: QiitaArticle[];
  totalCount: number;
}

export function ArticlesSection({ tag, page, articles, totalCount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const filteredArticles = filterByKeyword(articles, keyword);

  const { bookmarkedIds, toggle } = useBookmark();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">技術記事</h1>
      <div className="space-y-3">
        <TagFilter
          selectedTag={tag}
          onTagChange={(newTag) =>
            startTransition(() => router.push(`/?tag=${newTag}&page=1`))
          }
        />
        <SearchInput value={keyword} onChange={setKeyword} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tag}
          initial={{ opacity: 0 }}
          animate={{ opacity: isPending ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-6">
            <ArticleList
              articles={filteredArticles}
              bookmarkedIds={bookmarkedIds}
              onBookmarkToggle={toggle}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                tag={tag}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

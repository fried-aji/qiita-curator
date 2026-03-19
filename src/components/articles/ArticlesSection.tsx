"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TagFilter } from "@/components/filter/TagFilter";
import { SearchInput } from "@/components/filter/SearchInput";
import { ArticleList } from "@/components/article/ArticleList";
import { Pagination } from "@/components/pagination/Pagination";
import { useBookmark } from "@/hooks/useBookmark";
import { useArticles } from "@/hooks/useArticles";
import { filterByKeyword } from "@/lib/filter";
import { PER_PAGE } from "@/lib/qiita";

interface Props {
  tag: string;
  page: number;
}

export function ArticlesSection({ tag, page }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState("");

  const { data, isLoading } = useArticles(tag, page);
  const articles = data?.articles ?? [];
  const totalCount = data?.totalCount ?? 0;

  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
  const filteredArticles = filterByKeyword(articles, keyword);

  const { bookmarkedIds, toggle } = useBookmark();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">技術記事</h2>
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
        {isPending || isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex justify-center py-12"
          >
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
        )}
      </AnimatePresence>
    </div>
  );
}

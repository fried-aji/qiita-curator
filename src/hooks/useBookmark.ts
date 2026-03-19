"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";
import type { QiitaArticle } from "@/types/qiita";

interface BookmarkItem {
  articleId: string;
  title: string;
  url: string;
  tags: string[];
}

interface BookmarkResponse {
  bookmarkedIds: string[];
  bookmarks: BookmarkItem[];
}

async function fetchBookmarks(): Promise<BookmarkResponse> {
  const res = await fetch("/api/bookmarks");
  if (!res.ok) throw new Error("Failed to fetch bookmarks");
  return res.json();
}

export function useBookmark() {
  const queryClient = useQueryClient();
  const { status } = useSession();

  const { data } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
  });

  const bookmarkedIds = data?.bookmarkedIds ?? [];
  const bookmarks = data?.bookmarks ?? [];

  const toggleMutation = useMutation({
    mutationFn: async ({
      article,
      adding,
    }: {
      article: QiitaArticle;
      adding: boolean;
    }) => {
      if (!adding) {
        const res = await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId: article.id }),
        });
        if (!res.ok) throw new Error("Failed to remove bookmark");
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId: article.id,
            title: article.title,
            url: article.url,
            tags: article.tags.map((t) => t.name),
          }),
        });
        if (!res.ok) throw new Error("Failed to add bookmark");
      }
    },
    onMutate: async ({ article, adding }) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous =
        queryClient.getQueryData<BookmarkResponse>(["bookmarks"]);

      queryClient.setQueryData<BookmarkResponse>(["bookmarks"], (old) => {
        if (!old) return old;
        if (!adding) {
          return {
            bookmarkedIds: old.bookmarkedIds.filter((id) => id !== article.id),
            bookmarks: old.bookmarks.filter((b) => b.articleId !== article.id),
          };
        }
        return {
          bookmarkedIds: [...old.bookmarkedIds, article.id],
          bookmarks: [
            ...old.bookmarks,
            {
              articleId: article.id,
              title: article.title,
              url: article.url,
              tags: article.tags.map((t) => t.name),
            },
          ],
        };
      });

      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (articleId: string) => {
      const res = await fetch("/api/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      if (!res.ok) throw new Error("Failed to remove bookmark");
    },
    onMutate: async (articleId) => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previous =
        queryClient.getQueryData<BookmarkResponse>(["bookmarks"]);
      queryClient.setQueryData<BookmarkResponse>(["bookmarks"], (old) => {
        if (!old) return old;
        return {
          bookmarkedIds: old.bookmarkedIds.filter((id) => id !== articleId),
          bookmarks: old.bookmarks.filter((b) => b.articleId !== articleId),
        };
      });
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bookmarks"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  const toggle = (article: QiitaArticle) => {
    if (status !== "authenticated") {
      signIn("google");
      return;
    }
    toggleMutation.mutate({ article, adding: !bookmarkedIds.includes(article.id) });
  };
  const remove = (articleId: string) => removeMutation.mutate(articleId);
  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  return { bookmarkedIds, bookmarks, toggle, remove, isBookmarked };
}

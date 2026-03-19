"use client";

import { useBookmark } from "@/hooks/useBookmark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BookmarksPage() {
  const { bookmarks, remove } = useBookmark();

  if (bookmarks.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        ブックマークした記事はありません
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ブックマーク ({bookmarks.length}件)</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <div
            key={bookmark.articleId}
            className="border rounded-lg p-4 space-y-3 flex flex-col"
          >
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:underline flex-1"
            >
              {bookmark.title}
            </a>
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => remove(bookmark.articleId)}
            >
              削除
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

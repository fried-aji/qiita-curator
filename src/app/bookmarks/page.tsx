"use client";

import { useAtomValue } from "jotai";
import { bookmarkedIdsAtom } from "@/stores/bookmarkStore";
import { useBookmark } from "@/hooks/useBookmark";

export default function BookmarksPage() {
  const bookmarkedIds = useAtomValue(bookmarkedIdsAtom);
  const { toggle } = useBookmark();

  if (bookmarkedIds.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        ブックマークした記事はありません
      </p>
    );
  }

  // NOTE: ブックマーク一覧はIDのみ保存しているため、
  // 記事データはlocalStorageか別途API取得が必要。
  // MVP段階ではID一覧の表示のみとする。
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ブックマーク ({bookmarkedIds.length}件)</h1>
      <ul className="space-y-2">
        {bookmarkedIds.map((id) => (
          <li key={id} className="flex items-center justify-between border rounded p-3">
            <span className="text-sm font-mono">{id}</span>
            <button
              onClick={() => toggle(id)}
              className="text-sm text-destructive"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

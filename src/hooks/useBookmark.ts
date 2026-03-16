import { useAtom } from "jotai";
import { bookmarkedIdsAtom } from "@/stores/bookmarkStore";

export function useBookmark() {
  const [bookmarkedIds, setBookmarkedIds] = useAtom(bookmarkedIdsAtom);

  const toggle = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  return { bookmarkedIds, toggle, isBookmarked };
}

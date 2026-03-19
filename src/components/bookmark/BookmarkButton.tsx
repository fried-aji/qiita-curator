import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

interface Props {
  isBookmarked: boolean;
  onClick: () => void;
}

export function BookmarkButton({ isBookmarked, onClick }: Props) {
  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      aria-label={isBookmarked ? "ブックマーク解除" : "ブックマーク追加"}
      className="cursor-pointer"
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}

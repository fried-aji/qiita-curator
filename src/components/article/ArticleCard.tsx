import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import type { QiitaArticle } from "@/types/qiita";

type Props = {
  article: QiitaArticle;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
};

export function ArticleCard({ article, isBookmarked, onBookmarkToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {article.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <Badge key={tag.name} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">
          ❤️ {article.likes_count}
        </span>
        <BookmarkButton
          isBookmarked={isBookmarked}
          onClick={() => onBookmarkToggle(article.id)}
        />
      </CardFooter>
    </Card>
  );
}

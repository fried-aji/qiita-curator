import { Badge } from "@/components/ui/badge";

export const ALL_TAG = "all";
export const DEFAULT_TAGS = ["React", "Next.js", "TypeScript", "Storybook", "MSW", "Vitest"];

type Props = {
  selectedTag: string;
  onTagChange: (tag: string) => void;
};

export function TagFilter({ selectedTag, onTagChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        variant={selectedTag === ALL_TAG ? "default" : "outline"}
        className="cursor-pointer"
        onClick={() => onTagChange(ALL_TAG)}
      >
        すべて
      </Badge>
      {DEFAULT_TAGS.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onTagChange(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}

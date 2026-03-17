import { Input } from "@/components/ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: Props) {
  return (
    <Input
      type="search"
      placeholder="記事を検索..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

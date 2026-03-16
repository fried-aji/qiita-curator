import Link from "next/link";
import { Bookmark } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-lg">
          Qiita Curator
        </Link>
        <Link href="/bookmarks" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Bookmark className="h-4 w-4 mr-1" />
          ブックマーク
        </Link>
      </div>
    </header>
  );
}

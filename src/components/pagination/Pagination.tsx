import Link from "next/link";
import { getPaginationRange } from "@/lib/pagination";

type Props = {
  currentPage: number;
  totalPages: number;
  tag: string;
};

export function Pagination({ currentPage, totalPages, tag }: Props) {
  const pages = getPaginationRange(currentPage, totalPages);
  const isPrevDisabled = currentPage === 1;
  const isNextDisabled = currentPage === totalPages;

  const disabledClass = "pointer-events-none opacity-50";
  const baseClass =
    "inline-flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors";
  const activeClass = "border-primary bg-primary text-primary-foreground font-bold";
  const inactiveClass = "border-border bg-background hover:bg-muted";

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-center gap-1">
      <Link
        href={`/?tag=${tag}&page=${currentPage - 1}`}
        aria-label="前のページ"
        className={`${baseClass} ${inactiveClass} ${isPrevDisabled ? disabledClass : ""}`}
      >
        ‹
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={`/?tag=${tag}&page=${p}`}
          aria-label={`${p}ページ目`}
          aria-current={p === currentPage ? "page" : undefined}
          className={`${baseClass} ${p === currentPage ? activeClass : inactiveClass}`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={`/?tag=${tag}&page=${currentPage + 1}`}
        aria-label="次のページ"
        className={`${baseClass} ${inactiveClass} ${isNextDisabled ? disabledClass : ""}`}
      >
        ›
      </Link>
    </nav>
  );
}

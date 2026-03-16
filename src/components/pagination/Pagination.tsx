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

  const baseClass =
    "inline-flex h-8 w-8 items-center justify-center rounded border text-sm transition-colors";
  const activeClass = "border-primary bg-primary text-primary-foreground font-bold";
  const inactiveClass = "border-border bg-background hover:bg-muted";
  const disabledClass = "border-border bg-background opacity-50 cursor-not-allowed";

  return (
    <nav aria-label="ページネーション" className="flex items-center justify-center gap-1">
      {isPrevDisabled ? (
        <span aria-disabled="true" aria-label="前のページ" className={`${baseClass} ${disabledClass}`}>
          ‹
        </span>
      ) : (
        <Link
          href={`/?tag=${tag}&page=${currentPage - 1}`}
          aria-label="前のページ"
          className={`${baseClass} ${inactiveClass}`}
        >
          ‹
        </Link>
      )}

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

      {isNextDisabled ? (
        <span aria-disabled="true" aria-label="次のページ" className={`${baseClass} ${disabledClass}`}>
          ›
        </span>
      ) : (
        <Link
          href={`/?tag=${tag}&page=${currentPage + 1}`}
          aria-label="次のページ"
          className={`${baseClass} ${inactiveClass}`}
        >
          ›
        </Link>
      )}
    </nav>
  );
}

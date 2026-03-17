const WINDOW_SIZE = 5;

export function getPaginationRange(currentPage: number, totalPages: number): number[] {
  if (totalPages <= WINDOW_SIZE) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const half = Math.floor(WINDOW_SIZE / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + WINDOW_SIZE - 1);

  // 末尾に達した場合はstartを調整
  if (end === totalPages) {
    start = Math.max(1, end - WINDOW_SIZE + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

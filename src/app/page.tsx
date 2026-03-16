import { ArticlesSection } from "@/components/articles/ArticlesSection";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag = "React", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  return <ArticlesSection tag={tag} page={currentPage} />;
}

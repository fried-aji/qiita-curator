import { NextRequest, NextResponse } from "next/server";
import { PER_PAGE } from "@/lib/qiita";

const QIITA_API_BASE = "https://qiita.com/api/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get("tag") ?? "React";
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("perPage") ?? String(PER_PAGE);

  const params = new URLSearchParams({
    query: `tag:${tag}`,
    page,
    per_page: perPage,
  });

  const res = await fetch(`${QIITA_API_BASE}/items?${params}`);

  if (!res.ok) {
    return NextResponse.json(
      { error: `Qiita API error: ${res.status}` },
      { status: res.status }
    );
  }

  const totalCount = parseInt(
    res.headers.get("X-Total-Count") ?? res.headers.get("total-count") ?? "0",
    10
  );
  const articles = await res.json();

  return NextResponse.json({ articles, totalCount });
}

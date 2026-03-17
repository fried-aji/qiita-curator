import { NextRequest, NextResponse } from "next/server";
import { PER_PAGE } from "@/lib/qiita";
import { ALL_TAG, DEFAULT_TAGS } from "@/components/filter/TagFilter";

const QIITA_API_BASE = "https://qiita.com/api/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get("tag") ?? ALL_TAG;
  const page = searchParams.get("page") ?? "1";
  const perPage = searchParams.get("perPage") ?? String(PER_PAGE);

  const query =
    tag === ALL_TAG
      ? DEFAULT_TAGS.map((t) => `tag:${t}`).join(" OR ")
      : `tag:${tag}`;

  const params = new URLSearchParams({
    query,
    page,
    per_page: perPage,
  });

  const headers: HeadersInit = {};
  if (process.env.QIITA_ACCESS_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.QIITA_ACCESS_TOKEN}`;
  }

  const res = await fetch(`${QIITA_API_BASE}/items?${params}`, { headers });

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

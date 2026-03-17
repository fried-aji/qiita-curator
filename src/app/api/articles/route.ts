import { NextRequest, NextResponse } from "next/server";
import { fetchArticlesFromQiita, QiitaApiError } from "@/lib/qiita-server";
import { PER_PAGE } from "@/lib/qiita";
import { ALL_TAG } from "@/components/filter/TagFilter";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tag = searchParams.get("tag") ?? ALL_TAG;
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const perPage = parseInt(searchParams.get("perPage") ?? String(PER_PAGE), 10);

  try {
    const data = await fetchArticlesFromQiita(tag, page, perPage);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof QiitaApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

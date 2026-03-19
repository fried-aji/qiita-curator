import { NextRequest, NextResponse } from "next/server";
import type { Bookmark } from "@/generated/prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ bookmarkedIds: [], bookmarks: [] });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    bookmarkedIds: bookmarks.map((b: Bookmark) => b.articleId),
    bookmarks: bookmarks.map((b: Bookmark) => ({
      articleId: b.articleId,
      title: b.title,
      url: b.url,
      tags: JSON.parse(b.tags) as string[],
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { articleId, title, url, tags } = await req.json();
  const bookmark = await prisma.bookmark.upsert({
    where: { userId_articleId: { userId: session.user.id, articleId } },
    update: {},
    create: {
      userId: session.user.id,
      articleId,
      title,
      url,
      tags: JSON.stringify(tags),
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { articleId } = await req.json();
  await prisma.bookmark.delete({
    where: { userId_articleId: { userId: session.user.id, articleId } },
  });

  return NextResponse.json({ success: true });
}

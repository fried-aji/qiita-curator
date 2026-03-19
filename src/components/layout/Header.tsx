"use client";

import Link from "next/link";
import Image from "next/image";
import { Bookmark } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button, buttonVariants } from "@/components/ui/button";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <h1 className="font-bold text-lg">
          <Link href="/">Qiita Curator</Link>
        </h1>
        <div className="flex items-center gap-2">
          {session ? (
            <>
              <Link
                href="/bookmarks"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                <Bookmark className="h-4 w-4 mr-1" />
                ブックマーク
              </Link>
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "ユーザー"}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ redirectTo: "/" })}
              >
                ログアウト
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => signIn("google")}
            >
              Googleでログイン
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

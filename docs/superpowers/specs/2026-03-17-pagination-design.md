# ページネーション機能 設計ドキュメント

**Date:** 2026-03-17
**Status:** Approved

---

## 概要

Qiita CuratorにURLベースのページネーションを追加する。Next.js App RouterのSearchParamsを活用し、ルーティング実装をポートフォリオとしてアピールする。

---

## 要件

- 1ページあたり20件表示（現状維持）
- ページ番号はURLクエリパラメータで管理（`?tag=React&page=2`）
- コンパクト型UI：現在ページを中心に前後2ページ分を表示（最大5ページ分）
- キーワード検索はクライアントサイドフィルタリングを維持（現ページ20件が対象、URLへの反映なし）
- PaginationコンポーネントはStorybookで管理
- 将来的なサーバーサイド検索・ブックマーク移行に対応できる構造

---

## アーキテクチャ

### URLパラメータ設計

```
/?tag=React&page=1     ← デフォルト
/?tag=Next.js&page=3   ← タグ切り替え後にpage=1リセット
```

`keyword` はURLパラメータに含めない。純粋なクライアントstateとして管理し、URLは変更しない。

**既知の制限:** キーワード検索はAPIから取得した現ページ20件に対するフィルタリングのみ。ページをまたいだ全件検索には対応しない（将来のサーバーサイド検索で解決予定）。

### データフロー

```
URL (?tag=React&page=2)
  → page.tsx (Server Component — await searchParams で読み取り)
    → ArticlesSection (Client Component, src/components/articles/)
        AnimatePresence key={tag} ← タグ切り替え時のみアニメーション（ここに配置）
        useArticles(tag, page)
          → fetchArticlesByTag(tag, page, 20)
            → Qiita API → { articles, totalCount }  ← X-Total-Countヘッダー
        Pagination
          → <Link href="/?tag=React&page=3">
```

### AnimatePresence の配置

`AnimatePresence` は Framer Motion の Client Component であるため、Server Component（`page.tsx`）からは直接使用できない。`ArticlesSection`（Client Component）内に配置し、`key={tag}` でタグ切り替え時のみアニメーションを発火させる。ページ切り替えはアニメーションなし（意図的）。

```tsx
// ArticlesSection.tsx 内
<AnimatePresence mode="wait">
  <motion.div key={tag} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
    {/* ArticleList, Pagination */}
  </motion.div>
</AnimatePresence>
```

### page.tsx（Server Component）

```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>;
}) {
  const { tag = "React", page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  return <ArticlesSection tag={tag} page={currentPage} />;
}
```

### Providers の位置

`layout.tsx` に `QueryClientProvider` + `JotaiProvider` が既にある。`page.tsx` を Server Component にしても `ArticlesSection` は Providers 配下でレンダリングされるため変更不要。

---

## コンポーネント設計

### fetchArticlesByTag の変更（qiita.ts）

Qiita API の `X-Total-Count` レスポンスヘッダーから総件数を取得する。`useArticles` が唯一の呼び出し元であるため、返却型の変更は安全に行える。

```ts
export async function fetchArticlesByTag(
  tag: string,
  page = 1,
  perPage = 20
): Promise<{ articles: QiitaArticle[]; totalCount: number }> {
  const res = await fetch(...);
  if (!res.ok) throw new Error(`Qiita API error: ${res.status}`);
  const totalCount = parseInt(res.headers.get("X-Total-Count") ?? "0", 10);
  const articles: QiitaArticle[] = await res.json();
  return { articles, totalCount };
}
```

### useArticles の変更

```ts
export function useArticles(tag: string, page: number) {
  return useQuery({
    queryKey: ["articles", tag, page],
    queryFn: () => fetchArticlesByTag(tag, page),
    enabled: !!tag,
  });
}
```

### ArticlesSection コンポーネント

**ファイル:** `src/components/articles/ArticlesSection.tsx`（新規）

```tsx
"use client";
type Props = { tag: string; page: number };
```

内部処理：
- `useArticles(tag, page)` → `data?.articles ?? []`, `data?.totalCount ?? 0`
- `useBookmark()` でブックマーク操作
- `keyword` は `useState`（URLに反映しない）
- `filterByKeyword(articles, keyword)` でクライアントサイドフィルタリング
- `totalPages = Math.max(1, Math.ceil(totalCount / 20))`
- `AnimatePresence key={tag}` をここに配置
- `TagFilter` のコールバックで `router.push(`/?tag=${newTag}&page=1`)`

### Pagination コンポーネント

**ファイル:** `src/components/pagination/Pagination.tsx`（新規）

```tsx
type Props = { currentPage: number; totalPages: number; tag: string };
```

**表示ロジック（コンパクト型・5ページ固定表示）:**

| 現在ページ | 表示 |
|-----------|------|
| page=1 | **[1]** 2 3 4 5 › |
| page=3 | ‹ 1 2 **[3]** 4 5 › |
| page=10 | ‹ 8 9 **[10]** 11 12 › |
| page=20 | ‹ 16 17 18 19 **[20]** |

- `‹`: page=1 のとき `pointer-events-none opacity-50`
- `›`: page=totalPages のとき `pointer-events-none opacity-50`
- 各ページ番号: `<Link href={`/?tag=${tag}&page=${n}`}>`

**Storybook Stories（`tag="React"` 固定）:**
- `Default`（currentPage=1, totalPages=20）
- `MiddlePage`（currentPage=10, totalPages=20）
- `LastPage`（currentPage=20, totalPages=20）

---

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/app/page.tsx` | 変更 | Server Component化、`await searchParams`、AnimatePresenceを削除 |
| `src/components/articles/ArticlesSection.tsx` | 新規 | 記事一覧・フィルタ・ブックマーク・AnimatePresenceのClient Component |
| `src/components/pagination/Pagination.tsx` | 新規 | コンパクト型ページネーションUI |
| `src/components/pagination/Pagination.stories.tsx` | 新規 | Storybook Stories（3パターン） |
| `src/lib/qiita.ts` | 変更 | X-Total-Countヘッダーを取得し `{ articles, totalCount }` を返す |
| `src/hooks/useArticles.ts` | 変更 | `page` パラメータ追加、新返却型に対応 |
| `e2e/article-list.spec.ts` | 変更 | ページネーション操作のE2Eテスト追加 |
| `src/components/filter/TagFilter.tsx` | 変更不要 | Props変更なし |

---

## E2Eテストシナリオ（追加分）

1. **ページネーションUIが表示される** — トップページを開き、ページ番号ボタンが存在することを確認
2. **次ページへ遷移できる** — `›` ボタンをクリックし、URLが `?page=2` を含むことを確認
3. **タグ切り替えでpage=1にリセットされる** — `?page=2` の状態でタグをクリックし、URLが `page=1` に戻ることを確認

---

## 将来の拡張性

- **サーバーサイド検索:** `keyword` をURLパラメータに追加し `fetchArticlesByTag` に渡すだけ（keyword制限の解決）
- **ブックマークのサーバー移行:** `useBookmark.ts` の内部実装差し替えのみ

---

## 制約・注意事項

- キーワード検索は現ページ（20件）の中のクライアントサイドフィルタリング（既知の制限）
- ページ切り替え時のフェードアニメーションなし（タグ切り替え時のみ）

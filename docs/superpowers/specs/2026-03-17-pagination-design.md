# ページネーション機能 設計ドキュメント

**Date:** 2026-03-17
**Status:** Approved

---

## 概要

Qiita Curatorに URLベースのページネーションを追加する。Next.js App RouterのSearchParamsを活用し、ルーティング実装をポートフォリオとしてアピールする。

---

## 要件

- 1ページあたり20件表示（現状維持）
- ページ番号はURLクエリパラメータで管理（`?tag=React&page=2`）
- コンパクト型UI：現在ページを中心に前後2ページ分を表示（最大5ページ分）
- キーワード検索時はpage=1にリセット（現ページ内フィルタリング）
- PaginationコンポーネントはStorybookで管理
- 将来的なサーバーサイド検索・ブックマーク移行に対応できる構造

---

## アーキテクチャ

### URLパラメータ設計

```
/?tag=React&page=1     ← デフォルト
/?tag=Next.js&page=3   ← タグ切り替え後にpage=1リセット
```

### データフロー

```
URL (?tag=React&page=2)
  → page.tsx (Server Component — searchParams で読み取り)
    → ArticlesSection (Client Component — useArticles, useBookmark)
      → useArticles(tag, page)
        → fetchArticlesByTag(tag, page, 20)
          → Qiita API
    → Pagination (Client Component)
      → <Link href="/?tag=React&page=3"> でページ遷移
```

### Server / Client Component の分割

`page.tsx` を Server Component に変更し、`searchParams` でタグとページ番号を受け取る。インタラクティブな部分（useArticles, useBookmark, キーワード検索）は `ArticlesSection` という Client Component に切り出す。

```
src/app/
  page.tsx              ← Server Component（searchParams受け取り）
  ArticlesSection.tsx   ← "use client"（記事取得・フィルタ・ブックマーク）
```

---

## コンポーネント設計

### Pagination コンポーネント

**ファイル:** `src/components/pagination/Pagination.tsx`

```tsx
type Props = {
  currentPage: number;
  totalPages: number;
  tag: string;
  keyword?: string;
};
```

**表示ロジック（コンパクト型）:**

| 現在ページ | 表示 |
|-----------|------|
| page=1 | [1] 2 3 4 5 › |
| page=2 | 1 [2] 3 4 5 › |
| page=3 | ‹ 1 2 [3] 4 5 › |
| page=10 | ‹ 8 9 [10] 11 12 › |
| page=19 | ‹ 16 17 18 [19] 20 |
| page=20 | ‹ 16 17 18 19 [20] |

- `‹`（前）: page=1 のとき非活性
- `›`（次）: page=totalPages のとき非活性
- 各ページ番号は `<Link href={`/?tag=${tag}&page=${n}`}>` で実装

**Storybook Stories:**
- `Default`（page=1）
- `MiddlePage`（page=10）
- `LastPage`（page=20）

### TagFilter の変更

タグクリック時に `router.push` → `<Link href="/?tag=React&page=1">` に変更。JavaScript不要でルーティングを実現。

### ArticlesSection（新規）

`page.tsx` から切り出した Client Component。Props:
- `tag: string`
- `page: number`

内部で `useArticles(tag, page)`、`useBookmark()`、`filterByKeyword()` を呼び出す。キーワード入力時に `router.replace` で `page=1` にリセット。

---

## 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `src/app/page.tsx` | 変更 | Server Component化、searchParams受け取り |
| `src/app/ArticlesSection.tsx` | 新規 | 記事一覧・フィルタ・ブックマークのClient Component |
| `src/components/pagination/Pagination.tsx` | 新規 | コンパクト型ページネーションUI |
| `src/components/pagination/Pagination.stories.tsx` | 新規 | Storybook Stories（3パターン） |
| `src/hooks/useArticles.ts` | 変更 | `page` パラメータ追加 |
| `src/lib/qiita.ts` | 変更 | `page` パラメータを正しくAPIに渡す（既存） |
| `src/components/filter/TagFilter.tsx` | 変更 | router.push → Link に変更 |
| `e2e/article-list.spec.ts` | 変更 | ページネーション操作のE2Eテスト追加 |

---

## 将来の拡張性

- **サーバーサイド検索への移行:** `keyword` をURLパラメータに追加し（`?tag=React&page=1&keyword=hooks`）、`fetchArticlesByTag` に渡すだけで対応可能。現在の構造を壊さない。
- **ブックマークのサーバー移行:** `useBookmark.ts` の内部実装を差し替えるだけ。コンポーネント側は変更不要。

---

## 制約・注意事項

- Qiita API は総件数（total_count）をレスポンスヘッダーで返すが、`totalPages` はMVPでは固定値20（= 最大400件）とする
- キーワード検索は現ページ（20件）の中のクライアントサイドフィルタリング
- Qiita API の `per_page` 上限は100件

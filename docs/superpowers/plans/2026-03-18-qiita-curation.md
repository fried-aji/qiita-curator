# Qiita記事キュレーションアプリ 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qiita APIから技術記事を取得し、タグフィルタリング・キーワード検索・ブックマーク機能を持つWebアプリをNext.jsで構築する。

**Architecture:** Next.js App Router（SSR/SSG）+ TanStack QueryによるAPIキャッシュ管理 + Jotaiによるグローバルstate（ブックマーク）をlocalStorageに永続化。コンポーネントはStorybookで管理し、MSWでAPIをモック化してテストする。

**Tech Stack:** Next.js 16 (App Router) / TypeScript / shadcn/ui (TailwindCSS v4) / TanStack Query v5 / Jotai v2 / Storybook 10 / MSW v2 / Vitest 4 / Playwright / GitHub Actions / Vercel / pnpm

---

## 開発者コンテキスト（必読）

このプランを実行する開発者について：

- **スキル:** HTML/CSS/TypeScript/Astro/Vue.js/Alpine.js は実務経験あり
- **React/Next.js:** 技術書で理論は習得済み。ハンズオン開発は今回が初めて
- **目的:** フロントエンドエンジニアとして転職活動中。React/Next.jsのポートフォリオが不足しているため個人開発で補填する
- **期間:** 2026-03-18（木）〜 2026-03-21（日）の4日間
- **パッケージマネージャー:** pnpm（既存プロジェクトと統一）

### 作業時の注意事項

- React初体験のため、実装に詰まった場合は都度丁寧に説明すること
- スコープを広げる提案はしない。MVPを完成させることを最優先とする
- shadcn/uiのコンポーネントをベースに使い、デザインにコストをかけない
- TanStack QueryでAPIに繋がらない場合はSWRで代替可（Chapter 6-3で学習済み）

---

## アプリ仕様

### 対象ユーザー

開発者本人（Qiitaの技術記事をブックマーク・管理したい）

### 画面構成

```
/              記事一覧（タグ選択 + キーワード検索 + フィルタリング）
/bookmarks     ブックマーク一覧（ブックマーク済み記事の表示）
```

### 使用API

**Qiita API v2**（認証不要、60 req/hour）

```
記事検索: GET https://qiita.com/api/v2/items?query=tag:react&page=1&per_page=20
レスポンス例:
[
  {
    "id": "abc123",
    "title": "Reactの基礎",
    "url": "https://qiita.com/user/items/abc123",
    "created_at": "2026-01-01T00:00:00+09:00",
    "likes_count": 42,
    "tags": [{"name": "React"}, {"name": "TypeScript"}],
    "user": { "id": "username", "profile_image_url": "..." }
  }
]
```

### タグ候補（初期値）

`React` / `Next.js` / `TypeScript` / `Storybook` / `MSW` / `Vitest`

---

## ファイル構成

```
project-root/
├── .github/
│   └── workflows/
│       └── ci.yml                    # lint + 型チェック + Vitest
├── .storybook/
│   ├── main.ts                       # Storybook設定（Vite builder）
│   └── preview.ts                    # グローバルデコレーター
├── e2e/
│   ├── article-list.spec.ts          # E2Eテスト: 記事一覧表示
│   └── bookmark.spec.ts              # E2Eテスト: ブックマーク操作
├── src/
│   ├── app/
│   │   ├── layout.tsx                # ルートレイアウト（Providers含む）
│   │   ├── page.tsx                  # 記事一覧ページ
│   │   ├── bookmarks/
│   │   │   └── page.tsx              # ブックマーク一覧ページ
│   │   └── providers.tsx             # TanStack Query + Jotai Providers
│   ├── components/
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx       # 記事カード（タイトル・タグ・ブックマークボタン）
│   │   │   ├── ArticleCard.stories.tsx
│   │   │   ├── ArticleList.tsx       # 記事カードの一覧
│   │   │   └── ArticleList.stories.tsx
│   │   ├── filter/
│   │   │   ├── TagFilter.tsx         # タグ選択UI
│   │   │   ├── TagFilter.stories.tsx
│   │   │   ├── SearchInput.tsx       # キーワード検索Input
│   │   │   └── SearchInput.stories.tsx
│   │   ├── bookmark/
│   │   │   ├── BookmarkButton.tsx    # ブックマークトグルボタン
│   │   │   └── BookmarkButton.stories.tsx
│   │   └── layout/
│   │       ├── Header.tsx            # グローバルヘッダー（ナビゲーション）
│   │       └── Header.stories.tsx
│   ├── hooks/
│   │   ├── useArticles.ts            # TanStack Query: Qiita API取得
│   │   └── useBookmark.ts            # Jotai: ブックマーク操作
│   ├── stores/
│   │   └── bookmarkStore.ts          # Jotai atoms（ブックマーク状態）
│   ├── lib/
│   │   ├── qiita.ts                  # Qiita API クライアント関数
│   │   └── filter.ts                 # フィルタリング純粋関数（テスト対象）
│   └── types/
│       └── qiita.ts                  # Qiita APIレスポンス型定義
├── mocks/
│   ├── browser.ts                    # MSW: ブラウザ用セットアップ
│   ├── server.ts                     # MSW: テスト用セットアップ
│   └── handlers/
│       └── qiita.ts                  # MSW: Qiita APIハンドラー
├── playwright.config.ts
├── vitest.config.ts
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Chunk 1: 環境構築（Day 1 / 3月18日）

**目標:** 空アプリがVercelに自動デプロイされ、CIが緑になること

### Task 1: Next.jsプロジェクト作成

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: プロジェクト作成**

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
```

プロンプトが出た場合はすべてデフォルト（Enter）で進む。

- [ ] **Step 2: 起動確認**

```bash
pnpm dev
```

`http://localhost:3000` にアクセスしてNext.jsデフォルト画面が表示されることを確認。

- [ ] **Step 3: 不要ファイルの削除**

`src/app/page.tsx` の中身を以下に置き換える：

```tsx
export default function Home() {
  return <main><h1>Qiita記事キュレーター</h1></main>;
}
```

`src/app/globals.css` はshadcn/ui initが自動生成するTailwind v4形式のまま使用する（`@import "tailwindcss"` がv4の正しい記法）。手動編集不要。

- [ ] **Step 4: 型チェック通過確認**

```bash
pnpm tsc --noEmit
```

Expected: エラーなし

---

### Task 2: shadcn/ui セットアップ

**Files:**
- Create: `components.json`, `src/lib/utils.ts`

- [ ] **Step 1: shadcn/ui 初期化**

```bash
pnpm dlx shadcn@latest init
```

プロンプト:
- Style: `Default`
- Base color: `Slate`
- CSS variables: `Yes`

- [ ] **Step 2: 最低限必要なコンポーネントを追加**

```bash
pnpm dlx shadcn@latest add button badge input card
```

- [ ] **Step 3: 動作確認**

`src/app/page.tsx` を一時的に変更：

```tsx
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main>
      <Button>Test Button</Button>
    </main>
  );
}
```

`pnpm dev` でButtonが表示されることを確認後、元に戻す。

---

### Task 3: Storybook セットアップ

**Files:**
- Create: `.storybook/main.ts`, `.storybook/preview.ts`

- [ ] **Step 1: Storybook インストール**

```bash
pnpm dlx storybook@latest init
```

Storybook 10はNext.jsプロジェクトを自動検出し `@storybook/nextjs-vite` フレームワークを選択する（`--builder vite` 不要）。

インストール中に `Do you want to run the 'eslintPlugin' fixer?` と聞かれたら `yes`。

- [ ] **Step 2: 自動生成されたサンプルStoryを削除**

```bash
rm -rf src/stories
```

- [ ] **Step 3: TailwindをStorybookに適用**

`.storybook/preview.ts` を以下に変更（Storybook 10は `@storybook/nextjs-vite` を使用）：

```ts
import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
```

- [ ] **Step 4: 起動確認**

```bash
pnpm storybook
```

`http://localhost:6006` にアクセスしてStorybookが表示されることを確認。

---

### Task 4: MSW セットアップ

**Files:**
- Create: `mocks/handlers/qiita.ts`, `mocks/browser.ts`, `mocks/server.ts`

- [ ] **Step 1: MSW インストール**

```bash
pnpm add -D msw
```

- [ ] **Step 2: Service Worker 生成**

```bash
pnpm dlx msw init public/ --save
```

`public/mockServiceWorker.js` が生成されることを確認。

- [ ] **Step 3: モックハンドラー作成**

`mocks/handlers/qiita.ts`:

```ts
import { http, HttpResponse } from "msw";

export const MOCK_ARTICLES = [
  {
    id: "article-1",
    title: "Reactの基礎：useStateを理解する",
    url: "https://qiita.com/user/items/article-1",
    created_at: "2026-01-01T00:00:00+09:00",
    likes_count: 42,
    tags: [{ name: "React" }, { name: "TypeScript" }],
    user: { id: "testuser", profile_image_url: "https://placehold.co/40" },
  },
  {
    id: "article-2",
    title: "Next.js App RouterでSSRを実装する",
    url: "https://qiita.com/user/items/article-2",
    created_at: "2026-01-02T00:00:00+09:00",
    likes_count: 88,
    tags: [{ name: "Next.js" }, { name: "React" }],
    user: { id: "testuser2", profile_image_url: "https://placehold.co/40" },
  },
  {
    id: "article-3",
    title: "Storybookでコンポーネント管理を始める",
    url: "https://qiita.com/user/items/article-3",
    created_at: "2026-01-03T00:00:00+09:00",
    likes_count: 15,
    tags: [{ name: "Storybook" }],
    user: { id: "testuser3", profile_image_url: "https://placehold.co/40" },
  },
];

export const qiitaHandlers = [
  http.get("https://qiita.com/api/v2/items", () => {
    return HttpResponse.json(MOCK_ARTICLES);
  }),
];
```

`mocks/browser.ts`:

```ts
import { setupWorker } from "msw/browser";
import { qiitaHandlers } from "./handlers/qiita";

export const worker = setupWorker(...qiitaHandlers);
```

`mocks/server.ts`:

```ts
import { setupServer } from "msw/node";
import { qiitaHandlers } from "./handlers/qiita";

export const server = setupServer(...qiitaHandlers);
```

---

### Task 5: GitHub Actions CI セットアップ

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: CI設定ファイル作成**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm lint
```

- [ ] **Step 2: GitHubリポジトリ作成 + 初回プッシュ**

```bash
git init
git add .
git commit -m "chore: initial setup"
gh repo create qiita-curator --public --source=. --push
```

- [ ] **Step 3: GitHub ActionsでCIが緑になることを確認**

```bash
gh run list --limit 5
```

`completed / success` になっていること。

---

### Task 6: Vercel デプロイ連携

- [ ] **Step 1: Vercel CLIでデプロイ**

```bash
pnpm add -D vercel
pnpm dlx vercel --yes
```

- [ ] **Step 2: 本番URLにアクセスして表示確認**

Vercelが発行したURLにアクセス。「Qiita記事キュレーター」のテキストが表示されること。

- [ ] **Step 3: Gitプッシュで自動デプロイが動くことを確認**

```bash
git push origin main
```

Vercelダッシュボードでデプロイが自動トリガーされることを確認。

- [ ] **Step 4: Day 1 完了コミット**

```bash
git add .
git commit -m "chore: setup Next.js + shadcn/ui + Storybook + MSW + CI + Vercel"
git push origin main
```

---

## Chunk 2: コンポーネント実装（Day 2 / 3月19日）

**目標:** モックデータで動くUIを完成させ、全コンポーネントにStorybookのStoryが存在すること

### Task 7: 型定義

**Files:**
- Create: `src/types/qiita.ts`

- [ ] **Step 1: Qiita API レスポンス型を定義**

`src/types/qiita.ts`:

```ts
export type QiitaTag = {
  name: string;
};

export type QiitaUser = {
  id: string;
  profile_image_url: string;
};

export type QiitaArticle = {
  id: string;
  title: string;
  url: string;
  created_at: string;
  likes_count: number;
  tags: QiitaTag[];
  user: QiitaUser;
};
```

---

### Task 8: BookmarkButton コンポーネント

**Files:**
- Create: `src/components/bookmark/BookmarkButton.tsx`
- Create: `src/components/bookmark/BookmarkButton.stories.tsx`

- [ ] **Step 1: コンポーネント実装**

`src/components/bookmark/BookmarkButton.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";

type Props = {
  isBookmarked: boolean;
  onClick: () => void;
};

export function BookmarkButton({ isBookmarked, onClick }: Props) {
  return (
    <Button
      variant={isBookmarked ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      aria-label={isBookmarked ? "ブックマーク解除" : "ブックマーク追加"}
    >
      {isBookmarked ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
    </Button>
  );
}
```

lucide-reactのインストール（shadcn/uiに含まれているか確認してから実行）:

```bash
pnpm add lucide-react
```

- [ ] **Step 2: Story作成**

`src/components/bookmark/BookmarkButton.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { BookmarkButton } from "./BookmarkButton";

const meta: Meta<typeof BookmarkButton> = {
  title: "Bookmark/BookmarkButton",
  component: BookmarkButton,
};
export default meta;

type Story = StoryObj<typeof BookmarkButton>;

export const Default: Story = {
  args: {
    isBookmarked: false,
    onClick: () => {},
  },
};

export const Bookmarked: Story = {
  args: {
    isBookmarked: true,
    onClick: () => {},
  },
};
```

- [ ] **Step 3: Storybookで確認**

```bash
pnpm storybook
```

`Bookmark/BookmarkButton` に `Default` と `Bookmarked` の2パターンが表示されること。

---

### Task 9: ArticleCard コンポーネント

**Files:**
- Create: `src/components/article/ArticleCard.tsx`
- Create: `src/components/article/ArticleCard.stories.tsx`

- [ ] **Step 1: コンポーネント実装**

`src/components/article/ArticleCard.tsx`:

```tsx
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark/BookmarkButton";
import type { QiitaArticle } from "@/types/qiita";

type Props = {
  article: QiitaArticle;
  isBookmarked: boolean;
  onBookmarkToggle: (id: string) => void;
};

export function ArticleCard({ article, isBookmarked, onBookmarkToggle }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {article.title}
          </a>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {article.tags.map((tag) => (
            <Badge key={tag.name} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <span className="text-sm text-muted-foreground">
          ❤️ {article.likes_count}
        </span>
        <BookmarkButton
          isBookmarked={isBookmarked}
          onClick={() => onBookmarkToggle(article.id)}
        />
      </CardFooter>
    </Card>
  );
}
```

- [ ] **Step 2: Story作成**

`src/components/article/ArticleCard.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ArticleCard } from "./ArticleCard";

const MOCK_ARTICLE = {
  id: "article-1",
  title: "Reactの基礎：useStateを理解する",
  url: "https://qiita.com/user/items/article-1",
  created_at: "2026-01-01T00:00:00+09:00",
  likes_count: 42,
  tags: [{ name: "React" }, { name: "TypeScript" }],
  user: { id: "testuser", profile_image_url: "https://placehold.co/40" },
};

const meta: Meta<typeof ArticleCard> = {
  title: "Article/ArticleCard",
  component: ArticleCard,
};
export default meta;

type Story = StoryObj<typeof ArticleCard>;

export const Default: Story = {
  args: {
    article: MOCK_ARTICLE,
    isBookmarked: false,
    onBookmarkToggle: () => {},
  },
};

export const Bookmarked: Story = {
  args: {
    article: MOCK_ARTICLE,
    isBookmarked: true,
    onBookmarkToggle: () => {},
  },
};

export const ManyTags: Story = {
  args: {
    article: {
      ...MOCK_ARTICLE,
      tags: [
        { name: "React" },
        { name: "TypeScript" },
        { name: "Next.js" },
        { name: "Storybook" },
      ],
    },
    isBookmarked: false,
    onBookmarkToggle: () => {},
  },
};
```

---

### Task 10: TagFilter コンポーネント

**Files:**
- Create: `src/components/filter/TagFilter.tsx`
- Create: `src/components/filter/TagFilter.stories.tsx`

- [ ] **Step 1: コンポーネント実装**

`src/components/filter/TagFilter.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";

export const DEFAULT_TAGS = ["React", "Next.js", "TypeScript", "Storybook", "MSW", "Vitest"];

type Props = {
  selectedTag: string;
  onTagChange: (tag: string) => void;
};

export function TagFilter({ selectedTag, onTagChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {DEFAULT_TAGS.map((tag) => (
        <Badge
          key={tag}
          variant={selectedTag === tag ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onTagChange(tag)}
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Story作成**

`src/components/filter/TagFilter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { TagFilter } from "./TagFilter";

const meta: Meta<typeof TagFilter> = {
  title: "Filter/TagFilter",
  component: TagFilter,
};
export default meta;

type Story = StoryObj<typeof TagFilter>;

export const Default: Story = {
  args: {
    selectedTag: "React",
    onTagChange: () => {},
  },
};
```

---

### Task 11: SearchInput コンポーネント

**Files:**
- Create: `src/components/filter/SearchInput.tsx`
- Create: `src/components/filter/SearchInput.stories.tsx`

- [ ] **Step 1: コンポーネント実装**

`src/components/filter/SearchInput.tsx`:

```tsx
import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: Props) {
  return (
    <Input
      type="search"
      placeholder="記事を検索..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

- [ ] **Step 2: Story作成**

`src/components/filter/SearchInput.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { SearchInput } from "./SearchInput";

const meta: Meta<typeof SearchInput> = {
  title: "Filter/SearchInput",
  component: SearchInput,
};
export default meta;

type Story = StoryObj<typeof SearchInput>;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => {},
  },
};

export const WithValue: Story = {
  args: {
    value: "React hooks",
    onChange: () => {},
  },
};
```

---

### Task 12: Header + ArticleList コンポーネント

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/article/ArticleList.tsx`

- [ ] **Step 1: Header実装**

`src/components/layout/Header.tsx`:

```tsx
import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-lg">
          Qiita Curator
        </Link>
        <Button variant="outline" size="sm" asChild>
          <Link href="/bookmarks">
            <Bookmark className="h-4 w-4 mr-1" />
            ブックマーク
          </Link>
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: ArticleList実装**

`src/components/article/ArticleList.tsx`:

```tsx
import { ArticleCard } from "./ArticleCard";
import type { QiitaArticle } from "@/types/qiita";

type Props = {
  articles: QiitaArticle[];
  bookmarkedIds: string[];
  onBookmarkToggle: (id: string) => void;
};

export function ArticleList({ articles, bookmarkedIds, onBookmarkToggle }: Props) {
  if (articles.length === 0) {
    return <p className="text-center text-muted-foreground py-8">記事が見つかりません</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          isBookmarked={bookmarkedIds.includes(article.id)}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Day 2 完了コミット**

```bash
git add .
git commit -m "feat: add UI components (ArticleCard, TagFilter, SearchInput, Header) with Storybook stories"
git push origin main
```

---

## Chunk 3: データ取得 + テスト（Day 3 / 3月20日）

**目標:** Qiita APIに接続し、MSWモックとVitestのテストが通ること

### Task 13: Qiita APIクライアント + フィルター関数

**Files:**
- Create: `src/lib/qiita.ts`
- Create: `src/lib/filter.ts`

- [ ] **Step 1: APIクライアント実装**

`src/lib/qiita.ts`:

```ts
import type { QiitaArticle } from "@/types/qiita";

const QIITA_API_BASE = "https://qiita.com/api/v2";

export async function fetchArticlesByTag(
  tag: string,
  page = 1,
  perPage = 20
): Promise<QiitaArticle[]> {
  const params = new URLSearchParams({
    query: `tag:${tag}`,
    page: String(page),
    per_page: String(perPage),
  });

  const res = await fetch(`${QIITA_API_BASE}/items?${params}`);

  if (!res.ok) {
    throw new Error(`Qiita API error: ${res.status}`);
  }

  return res.json();
}
```

- [ ] **Step 2: フィルター純粋関数実装**（テスト対象）

`src/lib/filter.ts`:

```ts
import type { QiitaArticle } from "@/types/qiita";

export function filterByKeyword(articles: QiitaArticle[], keyword: string): QiitaArticle[] {
  if (!keyword.trim()) return articles;
  const lower = keyword.toLowerCase();
  return articles.filter((a) => a.title.toLowerCase().includes(lower));
}
```

---

### Task 14: Vitestによる単体テスト

**Files:**
- Create: `vitest.config.ts`
- Create: `src/lib/filter.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Vitest インストール**

```bash
pnpm add -D @vitejs/plugin-react @testing-library/react @testing-library/jest-dom
```

Storybook initで `vitest` と `playwright` は既にインストール済み。`jsdom` は vitest に内包。

- [ ] **Step 2: Vitest設定**

`vitest.config.ts`（Storybook 10生成のprojects構造にunit testプロジェクトを追加）：

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      // Unit tests (jsdom) - filter.test.ts などの純粋関数テスト対象
      {
        plugins: [react()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
          setupFiles: ['./vitest.setup.ts'],
        },
        resolve: {
          alias: {
            '@': path.resolve(dirname, './src'),
          },
        },
      },
      // Storybook tests (browser / Playwright)
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

- [ ] **Step 3: package.jsonにtestスクリプト追加**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: filterByKeywordのテスト作成**

`src/lib/filter.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filterByKeyword } from "./filter";
import type { QiitaArticle } from "@/types/qiita";

const ARTICLES: QiitaArticle[] = [
  {
    id: "1",
    title: "Reactの基礎",
    url: "",
    created_at: "",
    likes_count: 0,
    tags: [{ name: "React" }],
    user: { id: "u1", profile_image_url: "" },
  },
  {
    id: "2",
    title: "Next.jsでSSR",
    url: "",
    created_at: "",
    likes_count: 0,
    tags: [{ name: "Next.js" }],
    user: { id: "u2", profile_image_url: "" },
  },
];

describe("filterByKeyword", () => {
  it("空文字の場合は全件返す", () => {
    expect(filterByKeyword(ARTICLES, "")).toHaveLength(2);
  });

  it("キーワードに一致する記事のみ返す", () => {
    const result = filterByKeyword(ARTICLES, "React");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("1");
  });

  it("大文字小文字を区別しない", () => {
    const result = filterByKeyword(ARTICLES, "react");
    expect(result).toHaveLength(1);
  });

  it("一致なしの場合は空配列を返す", () => {
    const result = filterByKeyword(ARTICLES, "Vue");
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 5: テスト実行・通過確認**

```bash
pnpm test
```

Expected: `4 passed`

---

### Task 15: Jotai + ブックマーク状態管理

**Files:**
- Create: `src/stores/bookmarkStore.ts`
- Create: `src/hooks/useBookmark.ts`

- [ ] **Step 1: Jotai インストール**

```bash
pnpm add jotai
```

- [ ] **Step 2: ブックマークatom定義**

`src/stores/bookmarkStore.ts`:

```ts
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// localStorageに永続化されるブックマークID配列
export const bookmarkedIdsAtom = atomWithStorage<string[]>("bookmarks", []);
```

- [ ] **Step 3: useBookmarkフック実装**

`src/hooks/useBookmark.ts`:

```ts
import { useAtom } from "jotai";
import { bookmarkedIdsAtom } from "@/stores/bookmarkStore";

export function useBookmark() {
  const [bookmarkedIds, setBookmarkedIds] = useAtom(bookmarkedIdsAtom);

  const toggle = (id: string) => {
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const isBookmarked = (id: string) => bookmarkedIds.includes(id);

  return { bookmarkedIds, toggle, isBookmarked };
}
```

---

### Task 16: TanStack Query + Providers + ページ実装

**Files:**
- Create: `src/app/providers.tsx`
- Create: `src/hooks/useArticles.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/bookmarks/page.tsx`

- [ ] **Step 1: TanStack Query インストール**

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

- [ ] **Step 2: Providers実装**

`src/app/providers.tsx`:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider } from "jotai";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分間はキャッシュを使用
          },
        },
      })
  );

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </JotaiProvider>
  );
}
```

- [ ] **Step 3: layout.tsxにProvidersを適用**

`src/app/layout.tsx`（Next.js 16のデフォルトはGeistフォント。既にインストール済みのためそのまま使用）：

```tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Qiita Curator",
  description: "Qiita記事のキュレーションアプリ",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={geist.className}>
        <Providers>
          <Header />
          <main className="container mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: useArticlesフック実装**

`src/hooks/useArticles.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { fetchArticlesByTag } from "@/lib/qiita";

export function useArticles(tag: string) {
  return useQuery({
    queryKey: ["articles", tag],
    queryFn: () => fetchArticlesByTag(tag),
    enabled: !!tag,
  });
}
```

- [ ] **Step 5: トップページ実装**

`src/app/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { TagFilter, DEFAULT_TAGS } from "@/components/filter/TagFilter";
import { SearchInput } from "@/components/filter/SearchInput";
import { ArticleList } from "@/components/article/ArticleList";
import { useArticles } from "@/hooks/useArticles";
import { useBookmark } from "@/hooks/useBookmark";
import { filterByKeyword } from "@/lib/filter";

export default function Home() {
  const [selectedTag, setSelectedTag] = useState(DEFAULT_TAGS[0]);
  const [keyword, setKeyword] = useState("");
  const { data: articles = [], isLoading, isError } = useArticles(selectedTag);
  const { bookmarkedIds, toggle } = useBookmark();

  const filteredArticles = filterByKeyword(articles, keyword);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <TagFilter selectedTag={selectedTag} onTagChange={setSelectedTag} />
        <SearchInput value={keyword} onChange={setKeyword} />
      </div>

      {isLoading && <p className="text-center">読み込み中...</p>}
      {isError && <p className="text-center text-destructive">記事の取得に失敗しました</p>}
      {!isLoading && !isError && (
        <ArticleList
          articles={filteredArticles}
          bookmarkedIds={bookmarkedIds}
          onBookmarkToggle={toggle}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 6: ブックマークページ実装**

`src/app/bookmarks/page.tsx`:

```tsx
"use client";

import { useAtomValue } from "jotai";
import { bookmarkedIdsAtom } from "@/stores/bookmarkStore";
import { useBookmark } from "@/hooks/useBookmark";

export default function BookmarksPage() {
  const bookmarkedIds = useAtomValue(bookmarkedIdsAtom);
  const { toggle } = useBookmark();

  if (bookmarkedIds.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        ブックマークした記事はありません
      </p>
    );
  }

  // NOTE: ブックマーク一覧はIDのみ保存しているため、
  // 記事データはlocalStorageか別途API取得が必要。
  // MVP段階ではID一覧の表示のみとする。
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">ブックマーク ({bookmarkedIds.length}件)</h1>
      <ul className="space-y-2">
        {bookmarkedIds.map((id) => (
          <li key={id} className="flex items-center justify-between border rounded p-3">
            <span className="text-sm font-mono">{id}</span>
            <button
              onClick={() => toggle(id)}
              className="text-sm text-destructive"
            >
              削除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: 動作確認**

```bash
pnpm dev
```

- タグ選択 → 記事一覧が切り替わること
- キーワード入力 → リアルタイムでフィルタリングされること
- ブックマークボタン → トグルして状態が変わること
- ページリロード → ブックマーク状態が維持されること（localStorage）

- [ ] **Step 8: Day 3 完了コミット**

```bash
git add .
git commit -m "feat: integrate Qiita API with TanStack Query, Jotai bookmark state, Vitest tests"
git push origin main
```

---

## Chunk 4: 仕上げ（Day 4 / 3月21日）

**目標:** E2Eテスト・ローディングUI・README・本番デプロイ確認

### Task 17: Playwright E2Eテスト

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/article-list.spec.ts`
- Create: `e2e/bookmark.spec.ts`

- [ ] **Step 1: Playwright インストール**

```bash
pnpm add -D @playwright/test
pnpm dlx playwright install chromium
```

- [ ] **Step 2: Playwright設定**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 3: 記事一覧E2Eテスト作成**

`e2e/article-list.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("トップページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("タグフィルターが存在する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("React")).toBeVisible();
  await expect(page.getByText("Next.js")).toBeVisible();
});

test("検索フィールドが存在する", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByPlaceholder("記事を検索...")).toBeVisible();
});
```

- [ ] **Step 4: ブックマークE2Eテスト作成**

`e2e/bookmark.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("ブックマークページに遷移できる", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "ブックマーク" }).click();
  await expect(page).toHaveURL("/bookmarks");
});

test("ブックマークなしの場合メッセージが表示される", async ({ page }) => {
  // localStorageをクリアしてから確認
  await page.goto("/bookmarks");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByText("ブックマークした記事はありません")).toBeVisible();
});
```

- [ ] **Step 5: E2Eテスト実行**

```bash
pnpm dlx playwright test
```

Expected: テスト全件通過

---

### Task 18: CIにVitestとE2Eテストを追加

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: CI設定更新**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm tsc --noEmit
      - run: pnpm lint
      - run: pnpm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: latest
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm dlx playwright install --with-deps chromium
      - run: pnpm dlx playwright test
```

---

### Task 19: ローディング・エラー状態のUI改善

**Files:**
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`

- [ ] **Step 1: ローディングUI**

`src/app/loading.tsx`:

```tsx
export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: エラーUI**

`src/app/error.tsx`:

```tsx
"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="text-center py-8 space-y-4">
      <p className="text-destructive">エラーが発生しました</p>
      <button onClick={reset} className="underline text-sm">
        再試行
      </button>
    </div>
  );
}
```

---

### Task 20: README作成 + 最終デプロイ確認

**Files:**
- Modify: `README.md`

- [ ] **Step 1: README記載**

`README.md` に以下を記載：

```markdown
# Qiita Curator

Qiita APIから技術記事を取得し、タグフィルタリング・キーワード検索・ブックマーク機能を提供するWebアプリ。

## デモ

[Vercel URL]

## 技術スタック

| 技術 | 選定理由 |
|------|---------|
| Next.js 15 (App Router) | SSR/SSGの柔軟な使い分け、ルーティング |
| TypeScript | 型安全性の確保 |
| TanStack Query | APIキャッシュ管理（staleTime設定でQiita APIのレート制限に対応） |
| Jotai | 軽量なglobal state管理。localStorage永続化はatomWithStorageで実現 |
| shadcn/ui | UIコンポーネントをコードとして管理。Storybookとの相性が良い |
| Storybook | コンポーネントの独立した開発・確認環境 |
| MSW | APIモックによるテスト環境の再現 |
| Vitest | Viteベースの高速テストランナー |
| Playwright | E2Eテストによる実際のユーザー操作の検証 |

## 開発

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## テスト

\`\`\`bash
pnpm test              # Vitest
pnpm dlx playwright test  # E2E
\`\`\`
```

- [ ] **Step 2: 最終コミット + デプロイ確認**

```bash
git add .
git commit -m "feat: complete MVP - E2E tests, loading UI, README"
git push origin main
```

Vercelの本番URLにアクセスしてすべての機能が動作することを確認。

---

## トラブルシューティング

### StorybookとTailwindが適用されない

`.storybook/preview.ts` で `globals.css` を正しくimportしているか確認。パスは `"../src/app/globals.css"` になっているはず。

### MSWのService Workerが動かない

`public/mockServiceWorker.js` が存在するか確認。なければ `pnpm dlx msw init public/ --save` を再実行。

### TanStack Queryで詰まった場合

SWRで代替可能。`useArticles.ts` を以下に変更：

```ts
import useSWR from "swr";
import { fetchArticlesByTag } from "@/lib/qiita";

export function useArticles(tag: string) {
  const { data, error, isLoading } = useSWR(
    tag ? ["articles", tag] : null,
    () => fetchArticlesByTag(tag)
  );
  return { data: data ?? [], isError: !!error, isLoading };
}
```

`pnpm add swr` でインストール。

### Qiita APIのレート制限（60 req/hour）に引っかかった場合

開発中はMSWのモックを有効化して実APIを叩かないようにする。`src/app/layout.tsx` に以下を追加：

```tsx
// 開発環境でMSWを有効化（本番では無効）
if (process.env.NODE_ENV === "development") {
  const { worker } = await import("../../mocks/browser");
  await worker.start();
}
```

---

## 完成基準チェックリスト

- [ ] Vercel本番URLにデプロイ済み
- [ ] タグ選択で記事が切り替わる
- [ ] キーワード検索でリアルタイムフィルタリング
- [ ] ブックマークがlocalStorageに永続化される
- [ ] Storybook: 全コンポーネントにStoryが存在
- [ ] Vitest: `pnpm test` が全件通過
- [ ] Playwright: E2Eテスト全件通過
- [ ] GitHub Actions: CIが緑
- [ ] READMEに技術選定の理由が記載されている

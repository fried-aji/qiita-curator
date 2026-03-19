# CLAUDE.md

## Purpose

Qiita APIから技術記事を取得し、タグフィルタリング・キーワード検索・ブックマーク機能を提供するWebアプリ。
転職活動用ポートフォリオとして、Next.js / React / テストの実装経験を積むために開発する。

## Developer Context

- **スキル:** HTML/CSS/TypeScript/Astro/Vue.js/Alpine.js は実務経験あり
- **React/Next.js:** 技術書で理論は習得済み。ハンズオン開発は今回が初めて
- **目的:** フロントエンドエンジニアとして転職活動中。React/Next.jsのポートフォリオ強化
- **パッケージマネージャー:** pnpm

## Repo Map

```
project-root/
├── CLAUDE.md                           # このファイル（リポジトリ記憶）
├── prisma/
│   └── schema.prisma                   # Prismaスキーマ（User, Account, Session, Bookmark）
├── prisma.config.ts                    # Prisma設定（POSTGRES_URL接続先）
├── .github/
│   └── workflows/
│       └── ci.yml                      # lint + 型チェック + Vitest + Playwright
├── .storybook/
│   ├── main.ts                         # Storybook設定（Vite builder）
│   └── preview.ts                      # globals.cssのimport（Tailwind適用）
├── e2e/
│   ├── article-list.spec.ts            # E2E: 記事一覧表示
│   └── bookmark.spec.ts                # E2E: ブックマーク操作
├── mocks/
│   ├── browser.ts                      # MSW: ブラウザ用セットアップ
│   ├── server.ts                       # MSW: Vitest用セットアップ
│   └── handlers/
│       └── qiita.ts                    # MSW: Qiita APIモックハンドラー + MOCK_ARTICLES
├── src/
│   ├── auth.ts                         # Auth.js v5設定（Google OAuth, Prismaアダプター）
│   ├── app/
│   │   ├── layout.tsx                  # ルートレイアウト（Providers + Header）
│   │   ├── page.tsx                    # 記事一覧ページ（"use client"）
│   │   ├── loading.tsx                 # ローディングUI（スケルトン）
│   │   ├── error.tsx                   # エラーUI（"use client"）
│   │   ├── providers.tsx               # TanStack Query + SessionProvider（"use client"）
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts            # Auth.js ルートハンドラー
│   │   │   ├── articles/
│   │   │   │   └── route.ts            # 記事取得API（Qiita APIプロキシ）
│   │   │   └── bookmarks/
│   │   │       └── route.ts            # ブックマークCRUD API（GET/POST/DELETE）
│   │   └── bookmarks/
│   │       └── page.tsx                # ブックマーク一覧ページ（"use client"）
│   ├── components/
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx         # 記事カード（タイトル・タグ・ブックマークボタン）
│   │   │   ├── ArticleCard.stories.tsx
│   │   │   ├── ArticleList.tsx         # 記事カード一覧（空の場合のフォールバック含む）
│   │   │   └── ArticleList.stories.tsx
│   │   ├── articles/
│   │   │   └── ArticlesSection.tsx     # 記事一覧セクション（AnimatePresence + ローディング）
│   │   ├── filter/
│   │   │   ├── TagFilter.tsx           # タグ選択UI（DEFAULT_TAGSをexport）
│   │   │   ├── TagFilter.stories.tsx
│   │   │   ├── SearchInput.tsx         # キーワード検索Input
│   │   │   └── SearchInput.stories.tsx
│   │   ├── bookmark/
│   │   │   ├── BookmarkButton.tsx      # ブックマークトグルボタン（lucide-react使用）
│   │   │   └── BookmarkButton.stories.tsx
│   │   ├── pagination/
│   │   │   ├── Pagination.tsx          # ページネーションUI（Link使用）
│   │   │   └── Pagination.stories.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx              # グローバルヘッダー（ログイン/ログアウト + ナビゲーション）
│   │   │   └── Header.stories.tsx
│   │   └── ui/                         # shadcn/uiが自動生成（編集しない）
│   ├── hooks/
│   │   ├── useArticles.ts              # TanStack Query: Qiita API取得
│   │   └── useBookmark.ts              # TanStack Query: ブックマークCRUD（未ログイン時はsignIn誘導）
│   ├── lib/
│   │   ├── qiita.ts                    # クライアント用: PER_PAGE定数など
│   │   ├── qiita-server.ts             # サーバー用: fetchArticlesFromQiita（Qiita APIクライアント）
│   │   ├── prisma.ts                   # Prismaクライアントシングルトン（@prisma/adapter-pg使用）
│   │   ├── filter.ts                   # filterByKeyword: 純粋関数（Vitestテスト対象）
│   │   ├── pagination.ts               # getPaginationRange: ページネーション計算（Vitestテスト対象）
│   │   └── utils.ts                    # shadcn/uiが自動生成（cn関数）
│   └── types/
│       └── qiita.ts                    # QiitaArticle, QiitaTag, QiitaUser 型定義
├── vitest.config.ts
├── vitest.setup.ts                     # MSW server setup（beforeAll/afterEach/afterAll）
├── playwright.config.ts
├── next.config.ts
├── tailwind.config.ts
├── .mise.toml                          # Node.jsバージョン固定（mise）
└── components.json                     # shadcn/ui設定
```

## Rules

- **コンポーネントは必ずStoriesファイルを同梱する**（`.stories.tsx`）
- **Qiita API呼び出しは `src/lib/qiita-server.ts` に集約する**。APIルート経由でのみ呼び出す
- **shadcn/uiの `src/components/ui/` は直接編集しない**
- **スコープを広げる提案はしない**。実装済み機能の改善を優先する
- **"use client" は最小限の範囲で使う**。インタラクティブが必要なコンポーネントのみ

## Version Management (mise)

Node.jsのバージョン管理は **mise** を使用する。プロジェクトルートに `.mise.toml` を作成してバージョンを固定する。

```toml
# .mise.toml
[tools]
node = "20"
```

```bash
mise install          # .mise.tomlに記載のバージョンをインストール
mise use node@20      # .mise.tomlを生成しながらバージョン指定
mise current          # 現在アクティブなバージョンを確認
```

> **注意:** `.mise.toml` はコミットしてチームでバージョンを統一する。`.tool-versions`（asdf互換）でも可。

## Commands

```bash
pnpm dev                   # 開発サーバー起動（http://localhost:3000）
pnpm build                 # プロダクションビルド（prisma generate を含む）
pnpm tsc --noEmit          # 型チェック
pnpm lint                  # ESLint
pnpm test                  # Vitest（単体テスト + Storybookテスト）
pnpm test:watch            # Vitest watch mode
pnpm storybook             # Storybook起動（http://localhost:6006）
pnpm exec playwright test  # Playwright E2Eテスト
pnpm prisma generate       # Prismaクライアント生成（スキーマ変更後に実行）
pnpm prisma db push        # スキーマをDBに反映
```

## Tech Stack

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16 (App Router) | フレームワーク |
| React | 19 | UIライブラリ |
| TypeScript | 5 | 型安全性 |
| shadcn/ui + TailwindCSS | v4（`@import "tailwindcss"` 記法） | UIコンポーネント |
| TanStack Query | v5 | APIキャッシュ管理（staleTime: 60秒） |
| Auth.js | v5 (next-auth beta) | Google OAuth 認証 |
| Prisma | 7 | ORM（`@prisma/adapter-pg` でPrisma Postgresに接続） |
| Framer Motion | latest | フェードアニメーション（AnimatePresence） |
| Storybook | 10 (nextjs-vite framework) | コンポーネントカタログ |
| MSW | v2 | APIモック（browser: setupWorker / test: setupServer） |
| Vitest | 4 | 単体テスト（jsdom）+ Storybookテスト（Playwright browser） |
| Playwright | latest | E2Eテスト（chromium） |
| GitHub Actions | - | CI（lint + 型チェック + Vitest + E2E） |
| Vercel | - | ホスティング（mainブランチ自動デプロイ） |
| pnpm | latest | パッケージマネージャー |

## Key Architecture Decisions

### 認証・ブックマーク管理
Auth.js v5 + Google OAuth でユーザー認証を行い、ブックマークはPrisma Postgres（Vercel上）にユーザーごとに保存する。
`/api/bookmarks` エンドポイントでCRUDを提供し、`useBookmark.ts` フックがTanStack QueryでAPIを叩く。
未ログイン時にブックマークボタンを押すと `signIn("google")` が呼ばれてログイン画面へ誘導する。

### Prisma 7 の構成
Prisma 7 では `schema.prisma` の `datasource` に `url` を書かず、`prisma.config.ts` で接続先を管理する。
ランタイムは `@prisma/adapter-pg`（`PrismaPg`）を使用。Neonアダプターではなくpgアダプターを選ぶのは、
Prisma Postgres（`db.prisma.io`）が標準PostgreSQLプロトコルで接続するため。

### 記事取得フロー
Qiita APIへの直接アクセスは `src/lib/qiita-server.ts` に集約し、`/api/articles` ルートを経由して
クライアントに返す。`useArticles.ts` フックがTanStack QueryでこのAPIを叩く。

### アニメーション
`ArticlesSection.tsx` で `AnimatePresence mode="wait"` を使い、タグ切り替え時に
フェードアウト → スピナー → フェードインのトランジションを実現している。

### MSWの使い分け
- `mocks/browser.ts`（setupWorker）: ブラウザ開発時のモック
- `mocks/server.ts`（setupServer）: Vitestテスト時のモック（vitest.setup.tsで起動）

### なぜQiita APIか
- 認証不要（60 req/hour）
- 開発者向けコンテンツなのでポートフォリオとして文脈が合う
- MSWでのモックが容易（GET 1エンドポイント）

# CLAUDE.md

## Purpose

Qiita APIから技術記事を取得し、タグフィルタリング・キーワード検索・ブックマーク機能を提供するWebアプリ。
転職活動用ポートフォリオとして、Next.js / React / テストの実務経験を証明するために開発する。

## Developer Context

- **氏名:** 永野間 陸
- **スキル:** HTML/CSS/TypeScript/Astro/Vue.js/Alpine.js は実務経験あり
- **React/Next.js:** 技術書で理論は習得済み。ハンズオン開発は今回が初めて
- **目的:** フロントエンドエンジニアとして転職活動中。React/Next.jsのポートフォリオ補填
- **パッケージマネージャー:** pnpm

## Repo Map

```
project-root/
├── CLAUDE.md                           # このファイル（リポジトリ記憶）
├── docs/
│   └── superpowers/
│       └── plans/
│           └── 2026-03-18-qiita-curation.md  # 実装計画書（タスク一覧）
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
│   ├── app/
│   │   ├── layout.tsx                  # ルートレイアウト（Providers + Header）
│   │   ├── page.tsx                    # 記事一覧ページ（"use client"）
│   │   ├── loading.tsx                 # ローディングUI（スケルトン）
│   │   ├── error.tsx                   # エラーUI（"use client"）
│   │   ├── providers.tsx               # TanStack Query + Jotai Providers（"use client"）
│   │   └── bookmarks/
│   │       └── page.tsx                # ブックマーク一覧ページ（"use client"）
│   ├── components/
│   │   ├── article/
│   │   │   ├── ArticleCard.tsx         # 記事カード（タイトル・タグ・ブックマークボタン）
│   │   │   ├── ArticleCard.stories.tsx
│   │   │   ├── ArticleList.tsx         # 記事カード一覧（空の場合のフォールバック含む）
│   │   │   └── ArticleList.stories.tsx
│   │   ├── filter/
│   │   │   ├── TagFilter.tsx           # タグ選択UI（DEFAULT_TAGSをexport）
│   │   │   ├── TagFilter.stories.tsx
│   │   │   ├── SearchInput.tsx         # キーワード検索Input
│   │   │   └── SearchInput.stories.tsx
│   │   ├── bookmark/
│   │   │   ├── BookmarkButton.tsx      # ブックマークトグルボタン（lucide-react使用）
│   │   │   └── BookmarkButton.stories.tsx
│   │   ├── layout/
│   │   │   └── Header.tsx              # グローバルヘッダー（/, /bookmarks ナビゲーション）
│   │   └── ui/                         # shadcn/uiが自動生成（編集しない）
│   ├── hooks/
│   │   ├── useArticles.ts              # TanStack Query: Qiita API取得
│   │   └── useBookmark.ts              # Jotai: ブックマーク操作（toggle, isBookmarked）
│   ├── stores/
│   │   └── bookmarkStore.ts            # atomWithStorage: localStorageに永続化
│   ├── lib/
│   │   ├── qiita.ts                    # fetchArticlesByTag: Qiita APIクライアント
│   │   ├── filter.ts                   # filterByKeyword: 純粋関数（Vitestテスト対象）
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
- **API呼び出しは `src/lib/qiita.ts` に集約する**。ページやフックから直接fetchしない
- **shadcn/uiの `src/components/ui/` は直接編集しない**
- **スコープを広げる提案はしない**。MVPを完成させることを最優先とする
- **"use client" は最小限の範囲で使う**。インタラクティブが必要なコンポーネントのみ
- **TanStack Queryのstaleに詰まった場合はSWRで代替可**（トラブルシューティング参照）

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
pnpm dev              # 開発サーバー起動（http://localhost:3000）
pnpm build            # プロダクションビルド
pnpm tsc --noEmit     # 型チェック
pnpm lint             # ESLint
pnpm test             # Vitest（単体テスト）
pnpm test:watch       # Vitest watch mode
pnpm storybook        # Storybook起動（http://localhost:6006）
pnpm dlx playwright test  # Playwright E2Eテスト
```

## Tech Stack

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 16 (App Router) | フレームワーク |
| React | 19 | UIライブラリ |
| TypeScript | 5 | 型安全性 |
| shadcn/ui + TailwindCSS | v4（`@import "tailwindcss"` 記法） | UIコンポーネント |
| TanStack Query | v5 | APIキャッシュ管理（staleTime: 60秒） |
| Jotai | v2 | グローバルstate（ブックマーク） |
| Storybook | 10 (nextjs-vite framework) | コンポーネントカタログ |
| MSW | v2 | APIモック（browser: setupWorker / test: setupServer） |
| Vitest | 4 | 単体テスト（jsdom）+ Storybookテスト（Playwright browser） |
| Playwright | latest | E2Eテスト（chromium） |
| GitHub Actions | - | CI（lint + 型チェック + Vitest + E2E） |
| Vercel | - | ホスティング（mainブランチ自動デプロイ） |
| pnpm | latest | パッケージマネージャー |

## Key Architecture Decisions

### なぜJotai + localStorageか
ブックマーク機能はサーバーサイド管理（認証 + DB）まで不要なMVP。
`atomWithStorage("bookmarks", [])` でlocalStorageへの永続化を1行で実現。
将来的にSupabase等へ移行する場合は `useBookmark.ts` フックの実装を差し替えるだけでよい。

### なぜQiita APIか
- 認証不要（60 req/hour）
- 開発者向けコンテンツなのでポートフォリオとして文脈が合う
- MSWでのモックが容易（GET 1エンドポイント）

### MSWの使い分け
- `mocks/browser.ts`（setupWorker）: ブラウザ開発時のモック
- `mocks/server.ts`（setupServer）: Vitestテスト時のモック（vitest.setup.tsで起動）

## Implementation Plan

詳細な実装手順: `docs/superpowers/plans/2026-03-18-qiita-curation.md`

4日間のチャンク構成:
- **Day 1 (Chunk 1):** 環境構築（Next.js + shadcn/ui + Storybook + MSW + CI + Vercel）
- **Day 2 (Chunk 2):** コンポーネント実装（全コンポーネント + Storybook Stories）
- **Day 3 (Chunk 3):** データ取得 + テスト（Qiita API + Jotai + TanStack Query + Vitest）
- **Day 4 (Chunk 4):** 仕上げ（Playwright E2E + ローディングUI + README + 最終デプロイ）

# 🟢 Qiita Curator

Qiita APIから技術記事を取得し、タグフィルタリング・キーワード検索・ブックマーク機能を提供するWebアプリです。

## デモ

https://qiita-curator.vercel.app/

## 技術スタック

| 技術 | 説明 |
|------|---------|
| Next.js 16 (App Router) | SSR/SSGの柔軟な使い分け、ルーティング |
| TypeScript | 型安全性の確保 |
| TanStack Query v5 | APIキャッシュ管理（`staleTime`でQiita APIのレート制限に対応） |
| Jotai v2 | 状態管理 |
| shadcn/ui + Tailwind CSS v4 | UIコンポーネントをコードとして管理。|
| Storybook 10 | コンポーネント管理 |
| MSW v2 | APIモック |
| Vitest 4 | テストランナー |
| Playwright | E2Eテスト |

## 機能

- **タグフィルタリング** — React / Next.js / TypeScript など技術タグで記事を絞り込み
- **キーワード検索** — タイトルのリアルタイムフィルタリング
- **ブックマーク** — localStorage に永続化。ページリロード後も保持

## 開発

```bash
pnpm install
pnpm dev
```

`http://localhost:3000` にアクセス。

## テスト

```bash
pnpm test              # Vitest（単体テスト + Storybookテスト）
pnpm exec playwright test  # E2Eテスト（Playwright）
```

## Storybook

```bash
pnpm storybook
```

`http://localhost:6006` でコンポーネントカタログを確認。

# 🟢 Qiita Curator

Qiita APIから技術記事を取得し、タグフィルタリング・キーワード検索・ブックマーク機能を提供するWebアプリです。

## デモ

https://qiita-curator.vercel.app/

## 機能

- **タグフィルタリング** — React / Next.js / TypeScript など技術タグで記事を絞り込み
- **キーワード検索** — タイトルのリアルタイムフィルタリング
- **Googleログイン** — Auth.js v5 による Google OAuth 認証
- **ブックマーク** — ログインユーザーごとにDBへ保存・削除。未ログイン時はログイン画面へ誘導
- **フェードアニメーション** — タグ切り替え時にフェードアウト→スピナー→フェードインのトランジション

## 技術スタック

| 技術 | 説明 |
|------|---------|
| Next.js（App Router） | フレームワーク |
| TanStack Query | APIキャッシュ管理（`staleTime`でQiita APIのレート制限に対応） |
| Auth.js | Google OAuth 認証 |
| Prisma + Prisma Postgres | ORM + Vercel上のデータベース（ブックマーク永続化） |
| shadcn/ui + Tailwind CSS | UIコンポーネント・スタイリング |
| Framer Motion | ページ遷移アニメーション |
| Storybook | コンポーネントカタログ |
| MSW | APIモック（テスト・開発） |
| Vitest | 単体テスト + Storybookテスト |
| Playwright | E2Eテスト |

## 開発環境のセットアップ

### 必要な環境変数

`.env.local` を作成し、以下を設定してください。

```env
# Google OAuth（Google Cloud Console で取得）
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Auth.js シークレット（openssl rand -base64 33 などで生成）
AUTH_SECRET=

# Prisma Postgres 接続文字列（Prisma Console で取得）
POSTGRES_URL=
```

### 起動

```bash
pnpm install
pnpm prisma generate
pnpm dev
```

`http://localhost:3000` にアクセス。

## テスト

```bash
pnpm test                  # Vitest（単体テスト + Storybookテスト）
pnpm exec playwright test  # E2Eテスト（Playwright）
```

## Storybook

```bash
pnpm storybook
```

`http://localhost:6006` でコンポーネントカタログを確認。

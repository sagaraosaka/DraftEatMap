# 食べイコ

行きたいお店を地図に保存・管理するPWA。Google Maps上でお気に入りのお店をピン留めし、訪問記録・星評価・メモを残せる。

## 環境変数

`.env.local` を作成して以下を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

## Supabase セットアップ

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. **SQL Editor** で `supabase/schema.sql` の内容を実行
3. `schema.sql` 内のコメントに記載されたマイグレーションSQLも順に実行（`is_public`・`area` カラム追加など）
4. **Auth > URL Configuration** でリダイレクトURLを追加：
   - `http://localhost:3000/auth/callback`（開発）
   - `https://your-domain.com/auth/callback`（本番）
5. Google OAuthを使う場合は **Auth > Providers > Google** で設定

## Google Maps API セットアップ

1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクトを作成
2. 以下のAPIを有効化：
   - Maps JavaScript API
   - Places API（New）
3. APIキーを作成し、`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` に設定
4. 本番環境ではAPIキーのHTTPリファラー制限を設定

## 開発

```bash
npm install
npm run dev
```

→ http://localhost:3000

## テスト

```bash
npm test
```

ユニットテスト（Vitest + jsdom）：
- 認証リダイレクト（middleware）
- 店舗追加・削除・ステータス更新
- 重複保存防止（DuplicateStoreError）
- 公開共有（setStorePublic / getPublicStore）

## PWA / Web Share Target 確認

**PWAとしてインストール（iOS）**
1. Safari で `http://localhost:3000` を開く
2. 共有 → 「ホーム画面に追加」

**Web Share Target（iOSの共有シートから店舗を送る）**
1. PWAとしてインストール済みであること
2. Google Maps などで店舗を開き、共有シートから「食べイコ」を選択
3. `/share` ページが開き、クイック追加できる

## 主な技術スタック

- Next.js 15 (App Router)
- Supabase（認証 + PostgreSQL）
- Google Maps JavaScript API
- Tailwind CSS
- Vitest

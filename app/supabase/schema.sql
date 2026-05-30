-- =============================================
-- DraftEatMap — Supabase Schema
-- Supabase SQL Editor に貼り付けて実行する
-- =============================================

-- ─── stores テーブル ───────────────────────
CREATE TABLE stores (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  address      TEXT NOT NULL,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  place_id     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'unvisited' CHECK (status IN ('unvisited', 'visited')),
  rating       SMALLINT CHECK (rating BETWEEN 1 AND 5),
  memo         TEXT,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  photo_url    TEXT,
  price_range  TEXT,
  tabelog_url  TEXT,
  visited_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── インデックス ──────────────────────────
CREATE INDEX stores_user_id_idx ON stores (user_id);
CREATE INDEX stores_status_idx  ON stores (user_id, status);
CREATE INDEX stores_tags_idx    ON stores USING GIN (tags);

-- ─── Row Level Security ────────────────────
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 自分のデータのみ参照・操作できる
CREATE POLICY "users can select own stores"
  ON stores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users can insert own stores"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can update own stores"
  ON stores FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users can delete own stores"
  ON stores FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Storage バケット ──────────────────────
-- Supabase Dashboard > Storage > New Bucket で作成する:
--   名前: store-photos
--   Public: OFF（サインイン必須）
--   File size limit: 5MB
--   Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage ポリシー（Storage > Policies タブで設定 or 下記SQLを実行）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-photos',
  'store-photos',
  false,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT DO NOTHING;

CREATE POLICY "users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can read own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'store-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'store-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── マイグレーション: is_public カラム追加 ───────────────────────
-- Supabase Dashboard の SQL Editor で一度だけ実行すること:
-- ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false;

-- ─── 公開シェア用関数 ───────────────────────
-- ログイン不要でIDを指定して店舗情報を取得できる
-- SECURITY DEFINER でRLSをバイパスするが、返すカラムを安全なものに限定
-- is_public = true の店舗のみ返す（シェアボタン押下時に設定される）
CREATE OR REPLACE FUNCTION get_public_store(store_id uuid)
RETURNS TABLE (
  id        uuid,
  name      text,
  address   text,
  lat       float8,
  lng       float8,
  tags      text[],
  rating    smallint,
  place_id  text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT id, name, address, lat, lng, tags, rating, place_id
  FROM stores
  WHERE stores.id = store_id AND stores.is_public = true;
$$;

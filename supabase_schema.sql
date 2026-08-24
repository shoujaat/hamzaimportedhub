-- Run this entire file in your Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New query → paste → Run

CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL,
  condition   TEXT,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Allow anyone to READ products (public store)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read products"
  ON products FOR SELECT
  USING (true);

-- Allow insert from your admin page only (anon key is enough for now)
CREATE POLICY "Anon can insert products"
  ON products FOR INSERT
  WITH CHECK (true);

-- Optional: index for faster category filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

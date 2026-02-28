-- ============================================
-- BOX相場AI — box_top_cards（スニダンAPI連携対応）
-- ============================================

-- brand列
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'pokemon';
CREATE INDEX IF NOT EXISTS idx_boxes_brand ON boxes(brand);

-- TOP5カードテーブル（snkrdunk_id付き → n8nで価格自動取得）
CREATE TABLE IF NOT EXISTS box_top_cards (
  id BIGSERIAL PRIMARY KEY,
  box_id BIGINT REFERENCES boxes(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL DEFAULT 1,
  card_name TEXT NOT NULL,
  rarity TEXT,
  card_price INTEGER NOT NULL DEFAULT 0,
  probability NUMERIC(6,4) NOT NULL DEFAULT 0,
  snkrdunk_id TEXT,                -- スニダンの商品ID（価格自動取得用）
  sales_chart_option_id TEXT,      -- スニダンsales-chart用optionId
  image_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(box_id, rank)
);

ALTER TABLE box_top_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read box_top_cards" ON box_top_cards;
CREATE POLICY "Public read box_top_cards" ON box_top_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "anon insert box_top_cards" ON box_top_cards;
CREATE POLICY "anon insert box_top_cards" ON box_top_cards FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "anon update box_top_cards" ON box_top_cards;
CREATE POLICY "anon update box_top_cards" ON box_top_cards FOR UPDATE USING (true);
DROP POLICY IF EXISTS "anon delete box_top_cards" ON box_top_cards;
CREATE POLICY "anon delete box_top_cards" ON box_top_cards FOR DELETE USING (true);

CREATE INDEX IF NOT EXISTS idx_box_top_cards_box_id ON box_top_cards(box_id);

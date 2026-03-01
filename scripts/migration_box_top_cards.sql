-- ============================================
-- BOX相場AI — box_top_cards
-- featured_cardsの既存データを参照するだけ
-- 価格は featured_cards.price から取る（n8nで自動更新済み）
-- ============================================

ALTER TABLE boxes ADD COLUMN IF NOT EXISTS brand TEXT DEFAULT 'pokemon';
CREATE INDEX IF NOT EXISTS idx_boxes_brand ON boxes(brand);

CREATE TABLE IF NOT EXISTS box_top_cards (
  id BIGSERIAL PRIMARY KEY,
  box_id UUID REFERENCES boxes(id) ON DELETE CASCADE,
  featured_card_id BIGINT REFERENCES featured_cards(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL DEFAULT 1,
  probability NUMERIC(6,4) NOT NULL DEFAULT 0,
  UNIQUE(box_id, rank)
);

ALTER TABLE box_top_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read box_top_cards" ON box_top_cards;
CREATE POLICY "read box_top_cards" ON box_top_cards FOR SELECT USING (true);
DROP POLICY IF EXISTS "write box_top_cards" ON box_top_cards;
CREATE POLICY "write box_top_cards" ON box_top_cards FOR ALL USING (true);

CREATE INDEX IF NOT EXISTS idx_btc_box ON box_top_cards(box_id);
CREATE INDEX IF NOT EXISTS idx_btc_card ON box_top_cards(featured_card_id);

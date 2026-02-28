-- box_top_cards 登録例
-- featured_cards.id を指定 + 封入確率だけ入れる
-- 価格は featured_cards.price から自動で取れる

-- 方法1: カード名で検索して紐付け
INSERT INTO box_top_cards (box_id, featured_card_id, rank, probability) VALUES
  (
    (SELECT id FROM boxes WHERE name = '超電ブレイカー' LIMIT 1),
    (SELECT id FROM featured_cards WHERE name LIKE '%ピカチュウex%SAR%' LIMIT 1),
    1, 0.0051
  )
ON CONFLICT (box_id, rank) DO UPDATE SET
  featured_card_id = EXCLUDED.featured_card_id,
  probability = EXCLUDED.probability;

-- 方法2: UUIDを直接指定（Admin画面等で確認済みの場合）
-- INSERT INTO box_top_cards (box_id, featured_card_id, rank, probability)
-- VALUES (42, 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', 1, 0.0051);

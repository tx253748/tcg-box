-- ============================================
-- BOX相場AI サンプルデータ
-- snkrdunk_idはスニダンの商品ページURLから取得
-- 例: https://snkrdunk.com/trading-cards/XXXXX → XXXXX
--
-- ※ snkrdunk_idが入ってるカードはn8nで価格自動更新される
-- ※ 入ってないカードは手動で card_price を更新
-- ============================================

-- ① 超電ブレイカー (SV7)
INSERT INTO box_top_cards (box_id, rank, card_name, rarity, card_price, probability, snkrdunk_id) VALUES
  ((SELECT id FROM boxes WHERE name = '超電ブレイカー' LIMIT 1), 1, 'ピカチュウex SAR', 'SAR', 48000, 0.0051, NULL),
  ((SELECT id FROM boxes WHERE name = '超電ブレイカー' LIMIT 1), 2, 'N SR', 'SR', 22000, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = '超電ブレイカー' LIMIT 1), 3, 'ジバコイルex SAR', 'SAR', 8500, 0.0051, NULL),
  ((SELECT id FROM boxes WHERE name = '超電ブレイカー' LIMIT 1), 4, 'レントラーex SR', 'SR', 3200, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = '超電ブレイカー' LIMIT 1), 5, 'ピカチュウex UR', 'UR', 12000, 0.0051, NULL)
ON CONFLICT (box_id, rank) DO UPDATE SET
  card_name = EXCLUDED.card_name, rarity = EXCLUDED.rarity,
  card_price = EXCLUDED.card_price, probability = EXCLUDED.probability,
  snkrdunk_id = EXCLUDED.snkrdunk_id, updated_at = now();

-- ② バトルパートナーズ
INSERT INTO box_top_cards (box_id, rank, card_name, rarity, card_price, probability, snkrdunk_id) VALUES
  ((SELECT id FROM boxes WHERE name = 'バトルパートナーズ' LIMIT 1), 1, 'リザードンex SAR', 'SAR', 35000, 0.0051, NULL),
  ((SELECT id FROM boxes WHERE name = 'バトルパートナーズ' LIMIT 1), 2, 'ミュウex SAR', 'SAR', 18000, 0.0051, NULL),
  ((SELECT id FROM boxes WHERE name = 'バトルパートナーズ' LIMIT 1), 3, 'セレナ SR', 'SR', 12000, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = 'バトルパートナーズ' LIMIT 1), 4, 'ルカリオex SR', 'SR', 4800, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = 'バトルパートナーズ' LIMIT 1), 5, 'ガブリアスex RR', 'RR', 1500, 0.0462, NULL)
ON CONFLICT (box_id, rank) DO UPDATE SET
  card_name = EXCLUDED.card_name, rarity = EXCLUDED.rarity,
  card_price = EXCLUDED.card_price, probability = EXCLUDED.probability,
  snkrdunk_id = EXCLUDED.snkrdunk_id, updated_at = now();

-- ③ テラスタルフェスex
INSERT INTO box_top_cards (box_id, rank, card_name, rarity, card_price, probability, snkrdunk_id) VALUES
  ((SELECT id FROM boxes WHERE name = 'テラスタルフェスex' LIMIT 1), 1, 'リザードンex SAR', 'SAR', 85000, 0.0033, NULL),
  ((SELECT id FROM boxes WHERE name = 'テラスタルフェスex' LIMIT 1), 2, 'ピカチュウex SAR', 'SAR', 42000, 0.0033, NULL),
  ((SELECT id FROM boxes WHERE name = 'テラスタルフェスex' LIMIT 1), 3, 'ミュウツーex SAR', 'SAR', 28000, 0.0033, NULL),
  ((SELECT id FROM boxes WHERE name = 'テラスタルフェスex' LIMIT 1), 4, 'サーナイトex SR', 'SR', 8500, 0.0100, NULL),
  ((SELECT id FROM boxes WHERE name = 'テラスタルフェスex' LIMIT 1), 5, 'ルギアex SR', 'SR', 6200, 0.0100, NULL)
ON CONFLICT (box_id, rank) DO UPDATE SET
  card_name = EXCLUDED.card_name, rarity = EXCLUDED.rarity,
  card_price = EXCLUDED.card_price, probability = EXCLUDED.probability,
  snkrdunk_id = EXCLUDED.snkrdunk_id, updated_at = now();

-- ④ ステラミラクル
INSERT INTO box_top_cards (box_id, rank, card_name, rarity, card_price, probability, snkrdunk_id) VALUES
  ((SELECT id FROM boxes WHERE name = 'ステラミラクル' LIMIT 1), 1, 'テラパゴスex SAR', 'SAR', 32000, 0.0051, NULL),
  ((SELECT id FROM boxes WHERE name = 'ステラミラクル' LIMIT 1), 2, 'リーリエの全力 SR', 'SR', 28000, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = 'ステラミラクル' LIMIT 1), 3, 'アセロラの予感 SR', 'SR', 15000, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = 'ステラミラクル' LIMIT 1), 4, 'オーガポンex SR', 'SR', 5500, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = 'ステラミラクル' LIMIT 1), 5, 'テツノカイナex RR', 'RR', 2200, 0.0462, NULL)
ON CONFLICT (box_id, rank) DO UPDATE SET
  card_name = EXCLUDED.card_name, rarity = EXCLUDED.rarity,
  card_price = EXCLUDED.card_price, probability = EXCLUDED.probability,
  snkrdunk_id = EXCLUDED.snkrdunk_id, updated_at = now();

-- ⑤ 黒炎の支配者
INSERT INTO box_top_cards (box_id, rank, card_name, rarity, card_price, probability, snkrdunk_id) VALUES
  ((SELECT id FROM boxes WHERE name = '黒炎の支配者' LIMIT 1), 1, 'リザードンex SAR', 'SAR', 120000, 0.0033, NULL),
  ((SELECT id FROM boxes WHERE name = '黒炎の支配者' LIMIT 1), 2, 'ポピー SR', 'SR', 18000, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = '黒炎の支配者' LIMIT 1), 3, 'パオジアンex SAR', 'SAR', 12000, 0.0051, NULL),
  ((SELECT id FROM boxes WHERE name = '黒炎の支配者' LIMIT 1), 4, 'エンテイV SR', 'SR', 5500, 0.0154, NULL),
  ((SELECT id FROM boxes WHERE name = '黒炎の支配者' LIMIT 1), 5, 'リザードンex UR', 'UR', 25000, 0.0051, NULL)
ON CONFLICT (box_id, rank) DO UPDATE SET
  card_name = EXCLUDED.card_name, rarity = EXCLUDED.rarity,
  card_price = EXCLUDED.card_price, probability = EXCLUDED.probability,
  snkrdunk_id = EXCLUDED.snkrdunk_id, updated_at = now();

-- ============================================
-- snkrdunk_idの埋め方:
-- 1. スニダンで「ピカチュウex SAR SV7」等で検索
-- 2. 商品ページURL: https://snkrdunk.com/trading-cards/XXXXX
-- 3. XXXXXをsnkrdunk_idとしてUPDATE
--
-- UPDATE box_top_cards SET snkrdunk_id = 'XXXXX'
-- WHERE card_name = 'ピカチュウex SAR' AND box_id = (SELECT id FROM boxes WHERE name = '超電ブレイカー');
-- ============================================

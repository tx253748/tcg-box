import { useState, useMemo, useEffect, createContext, useContext } from "react";

/* ════════════════════════════════════════════════════
   BOX相場AI — 専用サイト
   ─ TOP: 販売スケジュール + 上昇率ランキング
   ─ BOX一覧: 価格メイン（既存BoxMarketベース）
   ─ BOX詳細: TOP5カード + 期待値 ← 課金壁
   ════════════════════════════════════════════════════ */

const SB_URL = "https://xuvguqjlijjuhazrhnfc.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dmd1cWpsaWpqdWhhenJobmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MDYzNTMsImV4cCI6MjA4Njk4MjM1M30.Yslfq0jzBhYYn9OuSjzFIfE-iihXFNlV65_shTsUe_E";
const sbFetch = (p) => fetch(`${SB_URL}/rest/v1/${p}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }).then(r => r.json());
const sbFetchAll = async (path) => { let all = [], off = 0; while (true) { const d = await fetch(`${SB_URL}/rest/v1/${path}&limit=1000&offset=${off}`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, Prefer: "count=exact" } }).then(r => r.json()); if (!Array.isArray(d) || !d.length) break; all = all.concat(d); off += d.length; if (d.length < 1000) break; } return all; };

const A8_MERCARI = "4AXJKC+D1R4XM+5LNQ+BW8O2", A8_SNKRDUNK = "";
const buildA8 = (m, u) => m ? `https://px.a8.net/svt/ejp?a8mat=${m}&a8ejpredirect=${encodeURIComponent(u)}` : u;
const snkUrl = (id) => buildA8(A8_SNKRDUNK, `https://snkrdunk.com/trading-cards/${id}`);
const merUrl = (kw) => buildA8(A8_MERCARI, `https://jp.mercari.com/search?keyword=${encodeURIComponent(kw)}&status=on_sale`);

const calcTrend = (pr, days) => { if (!pr || pr.length < 2) return null; const s = [...pr].sort((a, b) => b.date.localeCompare(a.date)); const l = s[0], lm = new Date(l.date).getTime(), tm = days * 864e5; let best = null, bd = Infinity; for (const p of s) { const d = Math.abs((lm - new Date(p.date).getTime()) - tm), a = (lm - new Date(p.date).getTime()) / 864e5; if (a >= days * 0.7 && d < bd) { best = p; bd = d; } } if (!best) return null; return l.price > best.price ? "up" : l.price < best.price ? "down" : "flat"; };
const calcPct = (pr, days) => { if (!pr || pr.length < 2) return null; const s = [...pr].sort((a, b) => b.date.localeCompare(a.date)); const l = s[0], lm = new Date(l.date).getTime(), tm = days * 864e5; let best = null, bd = Infinity; for (const p of s) { const d = Math.abs((lm - new Date(p.date).getTime()) - tm), a = (lm - new Date(p.date).getTime()) / 864e5; if (a >= days * 0.7 && d < bd) { best = p; bd = d; } } if (!best || !best.price) return null; return ((l.price - best.price) / best.price) * 100; };
const buildSpark = (pr) => !pr?.length ? null : [...pr].sort((a, b) => a.date.localeCompare(b.date)).slice(-7).map(p => p.price);

const BRANDS = [{ id: "pokemon", label: "ポケモン", accent: "#EAB308", icon: "⚡" }, { id: "onepiece", label: "ワンピース", accent: "#E23428", icon: "🏴‍☠️" }, { id: "dragonball", label: "ドラゴンボール", accent: "#FF8C00", icon: "🐉" }];

const PremiumCtx = createContext();
const usePremium = () => useContext(PremiumCtx);

const stS = s => ({ "発売前": { c: "#2563eb", b: "#eff6ff", d: "#bfdbfe" }, "販売中": { c: "#16a34a", b: "#f0fdf4", d: "#bbf7d0" }, "販売終了": { c: "#9ca3af", b: "#f9fafb", d: "#e5e7eb" } }[s] || { c: "#888", b: "#f5f5f5", d: "#eee" });
const Tag = ({ children, st }) => <span style={{ fontSize: 11, fontWeight: 500, color: st.c, backgroundColor: st.b, padding: "2px 8px", borderRadius: 10, border: `1px solid ${st.d}`, whiteSpace: "nowrap" }}>{children}</span>;
const TA = ({ d }) => !d ? <span style={{ color: "#ddd", fontSize: 13 }}>—</span> : d === "up" ? <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 700 }}>↑</span> : d === "down" ? <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 700 }}>↓</span> : <span style={{ color: "#aaa", fontSize: 13 }}>→</span>;
const TG = ({ a, b, c, e, pa, pb, pc, pe }) => <div style={{ display: "flex", gap: 3 }}>{[[e, pe], [c, pc], [b, pb], [a, pa]].map(([d, pct], i) => <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 26 }}><TA d={d} />{pct != null && <span style={{ fontSize: 8, color: d === "up" ? "#16a34a" : d === "down" ? "#dc2626" : "#bbb", fontWeight: 600, lineHeight: 1, marginTop: 1 }}>{Math.abs(Math.round(pct))}</span>}</div>)}</div>;
const pill = (a) => ({ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", transition: "all .12s", border: "1px solid", backgroundColor: a ? "#111" : "#fff", color: a ? "#fff" : "#888", borderColor: a ? "#111" : "#eee" });
const rIn = { fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "1px solid #e5e5e5", outline: "none", fontFamily: "inherit", width: 80, boxSizing: "border-box", backgroundColor: "#fff", fontVariantNumeric: "tabular-nums" };
const gP = (b, p) => { if (p === "week") { const pv = b.current - (b.weekDiff || 0); return pv > 0 && b.weekDiff != null ? Math.round((b.weekDiff / pv) * 100) : null; } const k = { "1m": "pct1", "3m": "pct3", "6m": "pct6", "12m": "pct12" }[p]; return b[k] != null ? Math.round(b[k]) : null; };

const Spark = ({ data, w = 80, h = 28, color = "#16a34a" }) => { if (!data || data.length < 2) return null; const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1; const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / rg) * (h - 4) - 2}`).join(" "); return <svg width={w} height={h} style={{ display: "block" }}><polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" /><circle cx={w} cy={h - ((data[data.length - 1] - mn) / rg) * (h - 4) - 2} r={2.5} fill={color} /></svg>; };

const PremiumWall = ({ message, sub = "月額¥500でフルアクセス" }) => <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 16px", backgroundColor: "#fafafa", borderRadius: 10, border: "1px dashed #ddd", marginTop: 8 }}><span style={{ fontSize: 20, marginBottom: 6 }}>🔒</span><div style={{ fontSize: 14, fontWeight: 800, color: "#333", marginBottom: 4 }}>{message}</div><div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>{sub}</div><button style={{ fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: "#111", border: "none", borderRadius: 8, padding: "10px 28px", cursor: "pointer", fontFamily: "inherit" }}>プレミアムに登録</button></div>;

/* ── BOX Detail Sheet (TOP5 + 期待値 = 課金壁) ── */
const BoxDetail = ({ box, brand, onClose }) => {
  const { isPremium } = usePremium();
  const [topCards, setTopCards] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!box) return;
    // box_top_cards → featured_cards をJOINして取得
    sbFetch(`box_top_cards?select=rank,probability,featured_cards(id,name,rarity,price,img_url,pack)&box_id=eq.${box.id}&order=rank`)
      .then(d => {
        if (!Array.isArray(d)) { setTopCards([]); setLoading(false); return; }
        setTopCards(d.map(r => ({
          rank: r.rank,
          probability: parseFloat(r.probability),
          card_name: r.featured_cards?.name || "",
          rarity: r.featured_cards?.rarity || "",
          card_price: r.featured_cards?.price || 0,
          image_url: r.featured_cards?.img_url || null,
        })));
        setLoading(false);
      }).catch(() => { setTopCards([]); setLoading(false); });
  }, [box]);
  if (!box) return null;
  const diff = box.weekDiff || 0, dc = diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#aaa";
  const st = stS(box.status), accent = brand.accent;
  const ev = topCards?.reduce((s, c) => s + (c.card_price * c.probability), 0) || 0;
  const evS = box.current && ev > 0 ? ((ev / box.current - 1) * 100) : null;

  return <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 100, backdropFilter: "blur(2px)" }} />
    <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px", overflow: "auto" }} onClick={onClose}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, maxWidth: 480, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <img src={box.img} alt={box.name} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: "16px 16px 0 0" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,.5)", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{box.name}</div>
            {box.status && <Tag st={st}>{box.status}</Tag>}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 16 }}>{box.release?.replace(/-/g, ".")}</div>

          {/* Price Block */}
          <div style={{ backgroundColor: "#f8f8f8", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginBottom: 4 }}>BOX相場</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{box.current ? `¥${box.current.toLocaleString()}` : "—"}</div>
            {box.weekDiff != null && <div style={{ fontSize: 12, fontWeight: 600, color: dc, marginTop: 4 }}>前週比 {diff > 0 ? "+" : ""}{diff.toLocaleString()}円{(() => { const pv = box.current - diff; return pv > 0 ? ` (${diff > 0 ? "+" : ""}${Math.round((diff / pv) * 100)}%)` : ""; })()}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 8, borderTop: "1px solid #eee" }}>
              {[["12M", box.t12, box.pct12], ["6M", box.t6, box.pct6], ["3M", box.t3, box.pct3], ["1M", box.t1, box.pct1]].map(([l, t, p]) => <div key={l} style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 9, color: "#bbb", marginBottom: 2 }}>{l}</div><TA d={t} />{p != null && <div style={{ fontSize: 9, color: t === "up" ? "#16a34a" : t === "down" ? "#dc2626" : "#bbb", fontWeight: 700 }}>{p > 0 ? "+" : ""}{Math.round(p)}%</div>}</div>)}
            </div>
            {box.spark && <div style={{ marginTop: 8 }}><Spark data={box.spark} w={200} h={32} color={diff >= 0 ? "#16a34a" : "#dc2626"} /></div>}
          </div>

          {/* TOP5 Cards — Premium Wall */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>🏆 TOP 5 高額カード{!isPremium && <span style={{ fontSize: 9, color: "#fff", backgroundColor: "#EAB308", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>PRO</span>}</div>
            {loading ? <div style={{ textAlign: "center", padding: 20, color: "#bbb", fontSize: 12 }}>読み込み中…</div>
              : !isPremium ? <>
                {topCards?.slice(0, 2).map((c, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: accent }}>{c.rank}</div>
                  {c.image_url && <img src={c.image_url} alt="" style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 3, border: "1px solid #eee" }} />}
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600 }}>{c.card_name}</div><div style={{ fontSize: 10, color: "#aaa" }}>{c.rarity}</div></div>
                  <div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>¥{c.card_price?.toLocaleString()}</div>
                </div>)}
                <div style={{ position: "relative" }}><div style={{ filter: "blur(8px)", opacity: .4, pointerEvents: "none" }}>{[3, 4, 5].map(i => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}><div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: "#eee" }} /><div style={{ width: 32, height: 44, borderRadius: 3, backgroundColor: "#eee" }} /><div style={{ flex: 1 }}><div style={{ width: 80, height: 12, backgroundColor: "#eee", borderRadius: 4 }} /></div><div style={{ width: 60, height: 14, backgroundColor: "#eee", borderRadius: 4 }} /></div>)}</div></div>
                <PremiumWall message="TOP5カードと期待値を見る" />
              </>
              : topCards?.length > 0 ? <>
                {topCards.map(c => <div key={c.rank} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, backgroundColor: accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: accent }}>{c.rank}</div>
                  {c.image_url && <img src={c.image_url} alt="" style={{ width: 32, height: 44, objectFit: "cover", borderRadius: 3, border: "1px solid #eee" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.card_name}</div><div style={{ fontSize: 10, color: "#aaa" }}>{c.rarity} ・ 封入率 {(c.probability * 100).toFixed(1)}%</div></div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>¥{c.card_price?.toLocaleString()}</div><div style={{ fontSize: 9, color: "#16a34a", fontWeight: 600 }}>EV ¥{Math.round(c.card_price * c.probability).toLocaleString()}</div></div>
                </div>)}
                <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, backgroundColor: evS > 0 ? "rgba(22,163,74,.06)" : "rgba(220,38,38,.06)", border: `1px solid ${evS > 0 ? "rgba(22,163,74,.15)" : "rgba(220,38,38,.15)"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div><div style={{ fontSize: 10, color: "#888", fontWeight: 600 }}>TOP5期待値 (EV)</div><div style={{ fontSize: 22, fontWeight: 900, color: evS > 0 ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>¥{Math.round(ev).toLocaleString()}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 10, color: "#888" }}>vs BOX価格</div><div style={{ fontSize: 16, fontWeight: 800, color: evS > 0 ? "#16a34a" : "#dc2626" }}>{evS != null ? `${evS > 0 ? "+" : ""}${evS.toFixed(1)}%` : "—"}</div></div>
                  </div>
                </div>
              </> : <div style={{ textAlign: "center", padding: 20, color: "#ccc", fontSize: 12 }}>カードデータ準備中</div>}
          </div>

          {/* Buy Links */}
          <div style={{ display: "flex", gap: 8 }}>
            {box.buyLinks?.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "11px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: "none", ...(i === 0 ? { backgroundColor: "#111", color: "#fff" } : { backgroundColor: "#fff", color: "#111", border: "1px solid #e5e5e5" }) }}>{l.name === "スニダン" ? "👟" : "🔴"} {l.name}</a>)}
          </div>
        </div>
      </div>
    </div>
  </>;
};

/* ── Grid Card ── */
const BoxGridCard = ({ b, onSelect }) => {
  const st = stS(b.status), wc = b.weekDiff > 0 ? "#16a34a" : b.weekDiff < 0 ? "#dc2626" : "#aaa";
  return <div onClick={() => onSelect(b)} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", transition: "box-shadow .2s, transform .2s", backgroundColor: "#fff", cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
    <div style={{ position: "relative" }}><img src={b.img} alt={b.name} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />{b.status && b.status !== "—" && <div style={{ position: "absolute", top: 6, left: 6 }}><Tag st={st}>{b.status}</Tag></div>}</div>
    <div style={{ padding: "10px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#222", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
      <div style={{ fontSize: 10, color: "#ccc", marginBottom: 8 }}>{b.release?.replace(/-/g, ".") || ""}</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 6 }}>{[["12M", b.t12, b.pct12], ["6M", b.t6, b.pct6], ["3M", b.t3, b.pct3], ["1M", b.t1, b.pct1]].map(([l, t, p]) => <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30 }}><span style={{ fontSize: 9, color: "#ccc" }}>{l}</span><TA d={t} />{p != null && <span style={{ fontSize: 8, color: t === "up" ? "#16a34a" : t === "down" ? "#dc2626" : "#bbb", fontWeight: 600 }}>{Math.abs(Math.round(p))}</span>}</div>)}</div>
      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 6, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{b.current ? `¥${b.current.toLocaleString()}` : "—"}</div>
        {b.weekDiff != null && (() => { const pv = b.current - b.weekDiff, pc = pv > 0 ? Math.round((b.weekDiff / pv) * 100) : 0; return <div style={{ fontSize: 10, fontWeight: 600, color: wc, fontVariantNumeric: "tabular-nums" }}>前週比 {b.weekDiff > 0 ? "+" : ""}{b.weekDiff.toLocaleString()} ({pc > 0 ? "+" : ""}{pc}%)</div>; })()}
      </div>
    </div>
  </div>;
};

/* ── List Row ── */
const BoxRow = ({ b, isLast, onSelect }) => {
  const [hov, setHov] = useState(false);
  const st = stS(b.status), hv = b.current >= 15000;
  return <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => onSelect(b)}
    style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #f5f5f5", borderRadius: hv ? 8 : 0, backgroundColor: hov ? "#fafafa" : hv ? "#f9f9f9" : "transparent", cursor: "pointer", transition: "background-color .12s" }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <img src={b.img} alt={b.name} style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</span>{b.status && b.status !== "—" && <Tag st={st}>{b.status}</Tag>}</div><div style={{ fontSize: 11, color: "#ccc", fontVariantNumeric: "tabular-nums", marginTop: 1 }}>{b.release?.replace(/-/g, ".") || ""}</div></div>
      </div>
      <div style={{ flexShrink: 0 }}><TG a={b.t1} b={b.t3} c={b.t6} e={b.t12} pa={b.pct1} pb={b.pct3} pc={b.pct6} pe={b.pct12} /></div>
      <div style={{ width: 80, textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: b.weekDiff != null ? (b.weekDiff > 0 ? "#16a34a" : b.weekDiff < 0 ? "#dc2626" : "#111") : "#111", fontVariantNumeric: "tabular-nums" }}>{b.current ? `¥${b.current.toLocaleString()}` : "—"}</div>
        {b.weekDiff != null && <div style={{ fontSize: 10, fontWeight: 600, color: b.weekDiff > 0 ? "#16a34a" : b.weekDiff < 0 ? "#dc2626" : "#aaa", fontVariantNumeric: "tabular-nums" }}>{b.weekDiff > 0 ? "+" : ""}{b.weekDiff.toLocaleString()}</div>}
      </div>
      <div style={{ width: 18, flexShrink: 0, textAlign: "center" }}><span style={{ color: hov ? "#999" : "#ddd", fontSize: 12 }}>›</span></div>
    </div>
  </div>;
};

const ListHeader = () => <div style={{ display: "flex", alignItems: "center", padding: "0 12px 6px", borderBottom: "1px solid #f0f0f0", marginBottom: 2, position: "sticky", top: 96, backgroundColor: "#fff", zIndex: 5 }}><span style={{ fontSize: 11, color: "#bbb", flex: 1 }}>商品名</span><div style={{ display: "flex", gap: 3, flexShrink: 0 }}>{["12M", "6M", "3M", "1M"].map(l => <span key={l} style={{ fontSize: 10, color: "#ccc", width: 26, textAlign: "center" }}>{l}</span>)}</div><div style={{ width: 80, textAlign: "right", flexShrink: 0 }}><span style={{ fontSize: 11, color: "#bbb" }}>価格</span></div><span style={{ width: 18 }} /></div>;

/* ── useBoxData ── */
const useBoxData = (brand) => {
  const [boxes, setBoxes] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true); setBoxes(null);
    (async () => {
      try {
        const bf = brand !== "pokemon" ? `&brand=eq.${brand}` : "";
        const [raw, prices] = await Promise.all([sbFetch(`boxes?select=id,name,snkrdunk_id,status,image_url,release_date,is_hidden,manual_price,brand&snkrdunk_id=not.is.null&order=release_date.desc.nullslast${bf}`), (() => { const d = new Date(); d.setDate(d.getDate() - 400); return sbFetchAll(`box_prices?select=box_id,date,price&date=gte.${d.toISOString().split('T')[0]}&order=date.desc`); })()]);
        if (!Array.isArray(raw)) { setBoxes([]); setLoading(false); return; }
        const pm = {}; prices.forEach(p => { if (!pm[p.box_id]) pm[p.box_id] = []; pm[p.box_id].push(p); });
        setBoxes(raw.filter(b => !b.is_hidden).map(b => {
          const bp = pm[b.id] || [], so = [...bp].sort((a, c) => c.date.localeCompare(a.date));
          const cur = b.manual_price || so[0]?.price || null, ld = so[0]?.date || null;
          const wa = new Date(); wa.setDate(wa.getDate() - 7); const wp = so.find(p => new Date(p.date) <= wa);
          const wd = (cur && wp) ? cur - wp.price : null;
          return { id: b.id, name: b.name, release: b.release_date || "", status: b.status || null, current: cur, lastDate: ld, t12: calcTrend(bp, 365), t6: calcTrend(bp, 180), t3: calcTrend(bp, 90), t1: calcTrend(bp, 30), pct12: calcPct(bp, 365), pct6: calcPct(bp, 180), pct3: calcPct(bp, 90), pct1: calcPct(bp, 30), weekDiff: wd, spark: buildSpark(bp), img: b.image_url || `https://placehold.co/44x44/888/fff?text=${encodeURIComponent(b.name.slice(0, 2))}`, snkrdunk_id: b.snkrdunk_id, buyLinks: [{ name: "スニダン", url: snkUrl(b.snkrdunk_id), note: cur ? `¥${cur.toLocaleString()}` : "—" }, { name: "メルカリ", url: merUrl(`${b.name} BOX 未開封`), note: "検索" }], sellLinks: [{ name: "スニダン", url: snkUrl(b.snkrdunk_id), note: "出品" }, { name: "メルカリ", url: merUrl(`${b.name} BOX 未開封`), note: "出品" }] };
        }));
      } catch (e) { console.error(e); setBoxes([]); }
      setLoading(false);
    })();
  }, [brand]);
  return { boxes, loading };
};

/* ── TOP Section ── */
const TopSection = ({ boxes, brand, onSelect }) => {
  const risers = useMemo(() => {
    if (!boxes) return [];
    return [...boxes].filter(b => b.current && b.weekDiff != null && b.weekDiff !== 0)
      .sort((a, c) => { const pa = (a.current - a.weekDiff) > 0 ? a.weekDiff / (a.current - a.weekDiff) : 0; const pc = (c.current - c.weekDiff) > 0 ? c.weekDiff / (c.current - c.weekDiff) : 0; return pc - pa; }).slice(0, 5);
  }, [boxes]);
  const schedule = useMemo(() => boxes ? boxes.filter(b => b.status === "発売前" || b.status === "販売中").sort((a, c) => (a.release || "").localeCompare(c.release || "")).slice(0, 6) : [], [boxes]);

  return <div style={{ marginBottom: 20 }}>
    {risers.length > 0 && <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>🔥 週間上昇率 TOP</div>
      {risers.map((b, i) => { const pv = b.current - b.weekDiff, pc = pv > 0 ? Math.round((b.weekDiff / pv) * 100) : 0, up = b.weekDiff > 0;
        return <div key={b.id} onClick={() => onSelect(b)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 4px", borderTop: i > 0 ? "1px solid #f5f5f5" : "none", cursor: "pointer", borderRadius: 6, transition: "background-color .1s" }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#fafafa"} onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}>
          <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: i === 0 ? brand.accent + "20" : "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? brand.accent : "#aaa", flexShrink: 0 }}>{i + 1}</div>
          <img src={b.img} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div><div style={{ fontSize: 10, color: "#aaa" }}>¥{b.current?.toLocaleString()}</div></div>
          <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 14, fontWeight: 800, color: up ? "#16a34a" : "#dc2626", fontVariantNumeric: "tabular-nums" }}>{up ? "+" : ""}{pc}%</div><div style={{ fontSize: 10, color: up ? "#16a34a" : "#dc2626" }}>{up ? "+" : ""}¥{b.weekDiff.toLocaleString()}</div></div>
        </div>; })}
    </div>}
    {schedule.length > 0 && <div style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #eee", padding: "14px 16px" }}>
      <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>📅 販売スケジュール</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
        {schedule.map(b => { const s = stS(b.status); return <div key={b.id} onClick={() => onSelect(b)} style={{ border: "1px solid #f0f0f0", borderRadius: 8, overflow: "hidden", cursor: "pointer", transition: "box-shadow .15s" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.06)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
          <img src={b.img} alt="" style={{ width: "100%", height: 80, objectFit: "cover", display: "block" }} />
          <div style={{ padding: "6px 8px" }}><div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{b.name}</div><div style={{ display: "flex", alignItems: "center", gap: 4 }}><Tag st={s}>{b.status}</Tag><span style={{ fontSize: 9, color: "#aaa" }}>{b.release?.replace(/-/g, "/")}</span></div></div>
        </div>; })}
      </div>
    </div>}
  </div>;
};

/* ══════ Main ══════ */
export default function BoxSoubaApp() {
  const [isPremium, setIsPremium] = useState(false);
  const [brandId, setBrandId] = useState("pokemon");
  const [page, setPage] = useState("top");
  const [sel, setSel] = useState(null);
  const brand = BRANDS.find(b => b.id === brandId);
  const { boxes: live, loading } = useBoxData(brandId);
  const all = live || [];

  const [q, setQ] = useState(""), [view, setView] = useState("grid"), [fOpen, setFOpen] = useState(false);
  const [period, setPeriod] = useState("week"), [dir, setDir] = useState("all"), [sort, setSort] = useState("change");
  const [pMin, setPMin] = useState(""), [pMax, setPMax] = useState(""), [yMin, setYMin] = useState(""), [yMax, setYMax] = useState(""), [hideNP, setHideNP] = useState(true);

  useEffect(() => { setQ(""); setFOpen(false); setDir("all"); setPMin(""); setPMax(""); setYMin(""); setYMax(""); setPage("top"); }, [brandId]);

  const lastUp = useMemo(() => { let l = null; all.forEach(b => { if (b.lastDate && (!l || b.lastDate > l)) l = b.lastDate; }); return l; }, [all]);
  const hasF = dir !== "all" || pMin || pMax || yMin || yMax;
  const fCnt = [dir !== "all", !!pMin || !!pMax, !!yMin || !!yMax].filter(Boolean).length;

  const filtered = useMemo(() => {
    let list = [...all]; if (hideNP) list = list.filter(b => b.current); if (q.trim()) { const lw = q.trim().toLowerCase(); list = list.filter(b => b.name.toLowerCase().includes(lw)); }
    const pc = b => gP(b, period);
    if (dir === "up") list = list.filter(b => (pc(b) || 0) > 0); if (dir === "down") list = list.filter(b => (pc(b) || 0) < 0);
    if (pMin) list = list.filter(b => b.current >= parseInt(pMin)); if (pMax) list = list.filter(b => b.current <= parseInt(pMax));
    if (yMin) list = list.filter(b => b.release?.slice(0, 4) >= yMin); if (yMax) list = list.filter(b => b.release?.slice(0, 4) <= yMax);
    if (sort === "change") list.sort((a, c) => Math.abs(pc(c) || 0) - Math.abs(pc(a) || 0));
    else if (sort === "price") list.sort((a, c) => (c.current || 0) - (a.current || 0));
    else list.sort((a, c) => (c.release || "").localeCompare(a.release || ""));
    return list;
  }, [all, q, period, dir, sort, pMin, pMax, yMin, yMax, hideNP]);

  const clearF = () => { setDir("all"); setPMin(""); setPMax(""); setYMin(""); setYMax(""); };

  return <PremiumCtx.Provider value={{ isPremium, setIsPremium }}>
    <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", fontFamily: "'Noto Sans JP','Helvetica Neue',-apple-system,sans-serif", color: "#111" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0}@media(max-width:500px){.box-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>

      {/* Header */}
      <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 48 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-.5px", cursor: "pointer" }} onClick={() => setPage("top")}>📦 BOX相場AI</span><span style={{ fontSize: 9, fontWeight: 700, color: "#fff", backgroundColor: brand.accent, padding: "2px 6px", borderRadius: 4 }}>BETA</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>{lastUp && <span style={{ fontSize: 10, color: "#bbb" }}>更新 {lastUp.replace(/-/g, "/")}</span>}<button onClick={() => setIsPremium(!isPremium)} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "1px solid #eee", backgroundColor: isPremium ? "#111" : "#fff", color: isPremium ? "#fff" : "#aaa", cursor: "pointer", fontFamily: "inherit" }}>{isPremium ? "PRO" : "FREE"}</button></div>
          </div>
          <div style={{ display: "flex" }}>{BRANDS.map(b => <button key={b.id} onClick={() => setBrandId(b.id)} style={{ flex: 1, padding: "9px 0", fontSize: 12, fontWeight: brandId === b.id ? 800 : 500, color: brandId === b.id ? b.accent : "#9ca3af", backgroundColor: "transparent", border: "none", cursor: "pointer", borderBottom: brandId === b.id ? `2.5px solid ${b.accent}` : "2.5px solid transparent", transition: "all .15s", fontFamily: "inherit" }}><span style={{ marginRight: 4 }}>{b.icon}</span>{b.label}</button>)}</div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 80px", width: "100%" }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 14 }}><button onClick={() => setPage("top")} style={{ ...pill(page === "top"), padding: "6px 16px", fontSize: 12 }}>🏠 トップ</button><button onClick={() => setPage("list")} style={{ ...pill(page === "list"), padding: "6px 16px", fontSize: 12 }}>📦 BOX一覧</button></div>

        {loading && <div style={{ textAlign: "center", padding: "48px 16px", color: "#aaa", fontSize: 13 }}>📦 読み込み中…</div>}

        {/* TOP */}
        {!loading && page === "top" && <TopSection boxes={all} brand={brand} onSelect={setSel} />}
        {!loading && page === "top" && !all.length && <div style={{ textAlign: "center", padding: "40px 16px", backgroundColor: "#fff", borderRadius: 12, border: "1px dashed #ddd" }}><div style={{ fontSize: 32 }}>{brand.icon}</div><div style={{ fontSize: 14, fontWeight: 700, color: "#555", marginTop: 8 }}>{brand.label} データ準備中</div></div>}

        {/* LIST */}
        {!loading && page === "list" && <>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <div style={{ flex: 1, position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#bbb" }}>🔍</span><input value={q} onChange={e => setQ(e.target.value)} placeholder="BOX名で検索…" style={{ fontSize: 12, padding: "7px 8px 7px 30px", borderRadius: 6, border: "1px solid #eee", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />{q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#bbb" }}>✕</button>}</div>
            <button onClick={() => setFOpen(!fOpen)} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", border: "1px solid", flexShrink: 0, backgroundColor: hasF ? "#111" : "#fff", color: hasF ? "#fff" : "#666", borderColor: hasF ? "#111" : "#eee" }}>絞り込み{fCnt > 0 ? ` (${fCnt})` : ""} <span style={{ transform: fOpen ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>▾</span></button>
          </div>
          {fOpen && <div style={{ padding: "10px 12px", backgroundColor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 8, marginBottom: 6 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
              <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>期間</div><div style={{ display: "flex", gap: 3 }}>{[["week", "前週比"], ["1m", "1M"], ["3m", "3M"], ["6m", "6M"], ["12m", "12M"]].map(([k, l]) => <button key={k} onClick={() => setPeriod(k)} style={pill(period === k)}>{l}</button>)}</div></div>
              <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>方向</div><div style={{ display: "flex", gap: 3 }}>{[["all", "全て"], ["up", "↑ 上昇"], ["down", "↓ 下落"]].map(([k, l]) => <button key={k} onClick={() => setDir(k)} style={pill(dir === k)}>{l}</button>)}</div></div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>価格</div><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input value={pMin} onChange={e => setPMin(e.target.value.replace(/\D/g, ""))} placeholder="¥ 下限" style={rIn} /><span style={{ fontSize: 11, color: "#ccc" }}>〜</span><input value={pMax} onChange={e => setPMax(e.target.value.replace(/\D/g, ""))} placeholder="¥ 上限" style={rIn} /></div></div>
              <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>発売年</div><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input value={yMin} onChange={e => setYMin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2023" style={{ ...rIn, width: 68 }} /><span style={{ fontSize: 11, color: "#ccc" }}>〜</span><input value={yMax} onChange={e => setYMax(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2026" style={{ ...rIn, width: 68 }} /></div></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><input type="checkbox" checked={hideNP} onChange={e => setHideNP(e.target.checked)} style={{ accentColor: "#111" }} /><span style={{ fontSize: 11, color: "#888" }}>価格なし非表示</span></label><div style={{ display: "flex", alignItems: "center", gap: 8 }}>{hasF && <button onClick={clearF} style={{ fontSize: 10, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>× リセット</button>}<span style={{ fontSize: 11, color: "#bbb" }}>{filtered.length}件</span></div></div>
          </div>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, color: "#aaa", fontWeight: 700 }}>並び替え</span><div style={{ display: "flex", gap: 3 }}>{[["change", "変動率"], ["price", "価格"], ["release_date", "発売日"]].map(([k, l]) => <button key={k} onClick={() => setSort(k)} style={pill(sort === k)}>{l}</button>)}</div></div>
            <div style={{ display: "flex", gap: 2 }}><button onClick={() => setView("list")} style={{ width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: view === "list" ? "#111" : "#fff", color: view === "list" ? "#fff" : "#aaa", borderColor: view === "list" ? "#111" : "#eee" }}>☰</button><button onClick={() => setView("grid")} style={{ width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: view === "grid" ? "#111" : "#fff", color: view === "grid" ? "#fff" : "#aaa", borderColor: view === "grid" ? "#111" : "#eee" }}>⊞</button></div>
          </div>
          {view === "grid" ? <div className="box-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>{filtered.map(b => <BoxGridCard key={b.id} b={b} onSelect={setSel} />)}</div>
            : <><ListHeader />{filtered.map((b, i) => <BoxRow key={b.id} b={b} isLast={i === filtered.length - 1} onSelect={setSel} />)}</>}
          {!filtered.length && <div style={{ textAlign: "center", padding: "32px 16px", color: "#ccc", fontSize: 13 }}>{!all.length ? <><div style={{ fontSize: 32 }}>{brand.icon}</div><div style={{ fontWeight: 700, color: "#888", marginTop: 8 }}>{brand.label} データ準備中</div></> : "該当するBOXが見つかりません"}</div>}
        </>}
      </div>

      <footer style={{ borderTop: "1px solid #eee", padding: "20px 0", textAlign: "center", backgroundColor: "#fff" }}><div style={{ fontSize: 10, color: "#bbb" }}>※ 価格はスニダンの取引相場を参考にしています</div><div style={{ fontSize: 10, color: "#ccc", marginTop: 4 }}>BOX相場AI © 2025</div></footer>

      {sel && <BoxDetail box={sel} brand={brand} onClose={() => setSel(null)} />}
    </div>
  </PremiumCtx.Provider>;
}

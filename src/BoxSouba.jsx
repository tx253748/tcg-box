import { useState, useMemo, useEffect } from "react";

const SB = "https://xuvguqjlijjuhazrhnfc.supabase.co";
const AK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1dmd1cWpsaWpqdWhhenJobmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MDYzNTMsImV4cCI6MjA4Njk4MjM1M30.Yslfq0jzBhYYn9OuSjzFIfE-iihXFNlV65_shTsUe_E";
const H = { apikey: AK, Authorization: `Bearer ${AK}` };
const sbGet = (p) => fetch(`${SB}/rest/v1/${p}`, { headers: H }).then(r => r.json());
const sbGetAll = async (path) => { let a = [], o = 0; while (true) { const d = await fetch(`${SB}/rest/v1/${path}&limit=1000&offset=${o}`, { headers: { ...H, Prefer: "count=exact" } }).then(r => r.json()); if (!Array.isArray(d) || !d.length) break; a = a.concat(d); o += d.length; if (d.length < 1000) break; } return a; };
const sbPost = (p, body) => fetch(`${SB}/rest/v1/${p}`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation" }, body: JSON.stringify(body) }).then(r => r.json());
const sbDel = (p) => fetch(`${SB}/rest/v1/${p}`, { method: "DELETE", headers: H });
const sbUpsert = (p, body) => fetch(`${SB}/rest/v1/${p}`, { method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "return=representation,resolution=merge-duplicates" }, body: JSON.stringify(body) }).then(r => r.json());

const A8M = "4AXJKC+D1R4XM+5LNQ+BW8O2";
const a8 = (m, u) => m ? `https://px.a8.net/svt/ejp?a8mat=${m}&a8ejpredirect=${encodeURIComponent(u)}` : u;
const snkUrl = id => a8("", `https://snkrdunk.com/trading-cards/${id}`);
const merUrl = kw => a8(A8M, `https://jp.mercari.com/search?keyword=${encodeURIComponent(kw)}&status=on_sale`);

const calcTrend = (pr, days) => { if (!pr || pr.length < 2) return null; const s = [...pr].sort((a, b) => b.date.localeCompare(a.date)); const l = s[0], lm = new Date(l.date).getTime(), tm = days * 864e5; let best = null, bd = Infinity; for (const p of s) { const d = Math.abs((lm - new Date(p.date).getTime()) - tm), ac = (lm - new Date(p.date).getTime()) / 864e5; if (ac >= days * 0.7 && d < bd) { best = p; bd = d; } } if (!best) return null; return l.price > best.price ? "up" : l.price < best.price ? "down" : "flat"; };
const calcPct = (pr, days) => { if (!pr || pr.length < 2) return null; const s = [...pr].sort((a, b) => b.date.localeCompare(a.date)); const l = s[0], lm = new Date(l.date).getTime(), tm = days * 864e5; let best = null, bd = Infinity; for (const p of s) { const d = Math.abs((lm - new Date(p.date).getTime()) - tm), ac = (lm - new Date(p.date).getTime()) / 864e5; if (ac >= days * 0.7 && d < bd) { best = p; bd = d; } } if (!best || !best.price) return null; return ((l.price - best.price) / best.price) * 100; };
const buildSpark = (pr) => !pr?.length ? null : [...pr].sort((a, b) => a.date.localeCompare(b.date)).map(p => p.price);

const stS = s => ({ "\u767a\u58f2\u524d": { c: "#2563eb", b: "#eff6ff", d: "#bfdbfe" }, "\u8ca9\u58f2\u4e2d": { c: "#16a34a", b: "#f0fdf4", d: "#bbf7d0" }, "\u8ca9\u58f2\u7d42\u4e86": { c: "#9ca3af", b: "#f9fafb", d: "#e5e7eb" } }[s] || { c: "#888", b: "#f5f5f5", d: "#eee" });
const Tag = ({ children, st }) => <span style={{ fontSize: 11, fontWeight: 500, color: st.c, backgroundColor: st.b, padding: "2px 8px", borderRadius: 10, border: `1px solid ${st.d}`, whiteSpace: "nowrap" }}>{children}</span>;
const TA = ({ d }) => !d ? <span style={{ color: "#ddd", fontSize: 13 }}>—</span> : d === "up" ? <span style={{ color: "#16a34a", fontSize: 13, fontWeight: 700 }}>↗</span> : d === "down" ? <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 700 }}>↘</span> : <span style={{ color: "#aaa", fontSize: 13 }}>→</span>;
const TG = ({ a, b, c, e, pa, pb, pc, pe }) => <div style={{ display: "flex", gap: 3 }}>{[[e, pe], [c, pc], [b, pb], [a, pa]].map(([d, pct], i) => <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 26 }}><TA d={d} />{pct != null && <span style={{ fontSize: 8, color: d === "up" ? "#16a34a" : d === "down" ? "#dc2626" : "#bbb", fontWeight: 600, lineHeight: 1, marginTop: 1 }}>{Math.abs(Math.round(pct))}</span>}</div>)}</div>;
const pill = (a) => ({ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", transition: "all .12s", border: "1px solid", backgroundColor: a ? "#111" : "#fff", color: a ? "#fff" : "#888", borderColor: a ? "#111" : "#eee" });
const rIn = { fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "1px solid #e5e5e5", outline: "none", fontFamily: "inherit", width: 80, boxSizing: "border-box", backgroundColor: "#fff", fontVariantNumeric: "tabular-nums" };
const gP = (b, p) => { if (p === "week") { const pv = b.current - (b.weekDiff || 0); return pv > 0 && b.weekDiff != null ? Math.round((b.weekDiff / pv) * 100) : null; } const k = { "1m": "pct1", "3m": "pct3", "6m": "pct6", "12m": "pct12" }[p]; return b[k] != null ? Math.round(b[k]) : null; };

const Spark = ({ data, h = 40, color = "#16a34a" }) => {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), rg = mx - mn || 1;
  const w = 1000, pad = 4;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * (w - pad * 2) + pad},${h - pad - ((v - mn) / rg) * (h - pad * 2)}`).join(" ");
  const lastX = w - pad, lastY = h - pad - ((data[data.length - 1] - mn) / rg) * (h - pad * 2);
  return <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block", width: "100%", height: h }}><polyline points={pts} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" /><circle cx={lastX} cy={lastY} r={5} fill={color} /></svg>;
};

const BoxDetail = ({ box, onClose }) => {
  const [topCards, setTopCards] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!box) return;
    sbGet(`box_top_cards?select=id,rank,probability,featured_card_id&box_id=eq.${box.id}&order=rank`)
      .then(async d => {
        if (!Array.isArray(d) || !d.length) { setTopCards([]); setLoading(false); return; }
        const ids = d.map(r => r.featured_card_id).filter(Boolean);
        const [cardsData, pricesData] = await Promise.all([
          ids.length ? sbGet(`featured_cards?select=id,name,rarity,price,img_url,pack&id=in.(${ids.join(",")})`) : [],
          ids.length ? sbGet(`featured_card_prices?select=card_id,price_raw&card_id=in.(${ids.join(",")})&order=fetched_date.desc`) : [],
        ]);
        const cm = {}; (Array.isArray(cardsData) ? cardsData : []).forEach(c => { cm[c.id] = c; });
        // 最新価格をカードIDごとに1件だけ取る
        const pm = {}; (Array.isArray(pricesData) ? pricesData : []).forEach(p => { if (!pm[p.card_id] && p.price_raw) pm[p.card_id] = p.price_raw; });
        setTopCards(d.map(r => {
          const fc = cm[r.featured_card_id] || {};
          const livePrice = pm[r.featured_card_id] || fc.price || 0;
          return { rank: r.rank, probability: parseFloat(r.probability), card_name: fc.name || "", rarity: fc.rarity || "", card_price: livePrice, image_url: fc.img_url || null };
        }));
        setLoading(false);
      }).catch(() => { setTopCards([]); setLoading(false); });
  }, [box]);
  if (!box) return null;
  const diff = box.weekDiff || 0, dc = diff > 0 ? "#16a34a" : diff < 0 ? "#dc2626" : "#aaa";
  const st = stS(box.status);


  return <>
    <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 100, backdropFilter: "blur(2px)" }} />
    <div style={{ position: "fixed", inset: 0, zIndex: 101, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px", overflow: "auto" }} onClick={onClose}>
      <div style={{ backgroundColor: "#fff", borderRadius: 16, maxWidth: 480, width: "100%", boxShadow: "0 16px 48px rgba(0,0,0,.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ position: "relative" }}>
          <img src={box.img} alt={box.name} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: "16px 16px 0 0" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(0,0,0,.5)", border: "none", color: "#fff", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{"\u2715"}</button>
        </div>
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{box.name}</div>
            {box.status && <Tag st={st}>{box.status}</Tag>}
          </div>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 16 }}>{box.release?.replace(/-/g, ".")}</div>
          <div style={{ backgroundColor: "#f8f8f8", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginBottom: 4 }}>BOX{"\u76f8\u5834"}</div>
            <div style={{ fontSize: 26, fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{box.current ? `\u00a5${box.current.toLocaleString()}` : "\u2014"}</div>
            {box.weekDiff != null && <div style={{ fontSize: 12, fontWeight: 600, color: dc, marginTop: 4 }}>{"\u524d\u9031\u6bd4"} {diff > 0 ? "+" : ""}{diff.toLocaleString()}{"\u5186"}{(() => { const pv = box.current - diff; return pv > 0 ? ` (${diff > 0 ? "+" : ""}${Math.round((diff / pv) * 100)}%)` : ""; })()}</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 10, paddingTop: 8, borderTop: "1px solid #eee" }}>
              {[["12M", box.t12, box.pct12], ["6M", box.t6, box.pct6], ["3M", box.t3, box.pct3], ["1M", box.t1, box.pct1]].map(([l, t, p]) => <div key={l} style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 9, color: "#bbb", marginBottom: 2 }}>{l}</div><TA d={t} />{p != null && <div style={{ fontSize: 9, color: t === "up" ? "#16a34a" : t === "down" ? "#dc2626" : "#bbb", fontWeight: 700 }}>{p > 0 ? "+" : ""}{Math.round(p)}%</div>}</div>)}
            </div>
            {box.spark && <div style={{ marginTop: 10 }}><Spark data={box.spark} h={48} color={diff >= 0 ? "#16a34a" : "#dc2626"} /></div>}
          </div>
          {/* 収録カード相場 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#333" }}>収録カード相場</div>
              <div style={{ fontSize: 10, color: "#bbb" }}>相場順</div>
            </div>
            {loading ? <div style={{ textAlign: "center", padding: 20, color: "#bbb", fontSize: 12 }}>読み込み中…</div>
              : topCards?.length > 0 ? <>
                {topCards.map((c, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < topCards.length - 1 ? "1px solid #f0f0f0" : "none", minHeight: 48 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0, border: "1px solid #eee", backgroundColor: "#f9f9f9" }}>
                    {c.image_url ? <img src={c.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#ccc", fontWeight: 700 }}>{c.rarity}</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>{c.card_name}</div>
                    <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{c.rarity} · 封入率{(c.probability * 100).toFixed(1)}%</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.3 }}>¥{c.card_price?.toLocaleString()}</div>
                  </div>
                </div>)}
              </> : <div style={{ textAlign: "center", padding: 20, color: "#ccc", fontSize: 12 }}>カードデータ未登録</div>}
          </div>

          {/* Buy — 軽いテキストリンク */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", padding: "8px 0" }}>
            {box.buyLinks?.map((l, i) => <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, fontWeight: 600, color: "#888", textDecoration: "none", display: "flex", alignItems: "center", gap: 3 }}>{l.name} <span style={{ fontSize: 11 }}>↗</span></a>)}
          </div>
        </div>
      </div>
    </div>
  </>;
};

const BoxGridCard = ({ b, onSelect }) => {
  const st = stS(b.status), wc = b.weekDiff > 0 ? "#16a34a" : b.weekDiff < 0 ? "#dc2626" : "#aaa";
  return <div onClick={() => onSelect(b)} style={{ border: "1px solid #eee", borderRadius: 10, overflow: "hidden", transition: "box-shadow .2s, transform .2s", backgroundColor: "#fff", cursor: "pointer" }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.06)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
    <div style={{ position: "relative" }}><img src={b.img} alt={b.name} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />{b.status && b.status !== "\u2014" && <div style={{ position: "absolute", top: 6, left: 6 }}><Tag st={st}>{b.status}</Tag></div>}</div>
    <div style={{ padding: "10px 12px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#222", lineHeight: 1.3, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
      <div style={{ fontSize: 10, color: "#ccc", marginBottom: 8 }}>{b.release?.replace(/-/g, ".") || ""}</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 6 }}>{[["12M", b.t12, b.pct12], ["6M", b.t6, b.pct6], ["3M", b.t3, b.pct3], ["1M", b.t1, b.pct1]].map(([l, t, p]) => <div key={l} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 30 }}><span style={{ fontSize: 9, color: "#ccc" }}>{l}</span><TA d={t} />{p != null && <span style={{ fontSize: 8, color: t === "up" ? "#16a34a" : t === "down" ? "#dc2626" : "#bbb", fontWeight: 600 }}>{Math.abs(Math.round(p))}</span>}</div>)}</div>
      <div style={{ borderTop: "1px solid #f0f0f0", paddingTop: 6, textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{b.current ? `\u00a5${b.current.toLocaleString()}` : "\u2014"}</div>
        {b.weekDiff != null && (() => { const pv = b.current - b.weekDiff, pc = pv > 0 ? Math.round((b.weekDiff / pv) * 100) : 0; return <div style={{ fontSize: 10, fontWeight: 600, color: wc, fontVariantNumeric: "tabular-nums" }}>{"\u524d\u9031\u6bd4"} {b.weekDiff > 0 ? "+" : ""}{b.weekDiff.toLocaleString()} ({pc > 0 ? "+" : ""}{pc}%)</div>; })()}
      </div>
    </div>
  </div>;
};

const BoxRow = ({ b, isLast, onSelect }) => {
  const [hov, setHov] = useState(false);
  const st = stS(b.status), hv = b.current >= 15000;
  return <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onClick={() => onSelect(b)}
    style={{ padding: "10px 12px", borderBottom: isLast ? "none" : "1px solid #f5f5f5", borderRadius: hv ? 8 : 0, backgroundColor: hov ? "#fafafa" : hv ? "#f9f9f9" : "transparent", cursor: "pointer", transition: "background-color .12s" }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <img src={b.img} alt={b.name} style={{ width: 38, height: 38, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}><div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</span>{b.status && b.status !== "\u2014" && <Tag st={st}>{b.status}</Tag>}</div><div style={{ fontSize: 11, color: "#ccc", fontVariantNumeric: "tabular-nums", marginTop: 1 }}>{b.release?.replace(/-/g, ".") || ""}</div></div>
      </div>
      <div style={{ flexShrink: 0 }}><TG a={b.t1} b={b.t3} c={b.t6} e={b.t12} pa={b.pct1} pb={b.pct3} pc={b.pct6} pe={b.pct12} /></div>
      <div style={{ width: 80, textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: b.weekDiff != null ? (b.weekDiff > 0 ? "#16a34a" : b.weekDiff < 0 ? "#dc2626" : "#111") : "#111", fontVariantNumeric: "tabular-nums" }}>{b.current ? `\u00a5${b.current.toLocaleString()}` : "\u2014"}</div>
        {b.weekDiff != null && <div style={{ fontSize: 10, fontWeight: 600, color: b.weekDiff > 0 ? "#16a34a" : b.weekDiff < 0 ? "#dc2626" : "#aaa", fontVariantNumeric: "tabular-nums" }}>{b.weekDiff > 0 ? "+" : ""}{b.weekDiff.toLocaleString()}</div>}
      </div>
      <div style={{ width: 18, flexShrink: 0, textAlign: "center" }}><span style={{ color: hov ? "#999" : "#ddd", fontSize: 12 }}>{"\u203a"}</span></div>
    </div>
  </div>;
};

const ListHeader = () => <div style={{ display: "flex", alignItems: "center", padding: "0 12px 6px", borderBottom: "1px solid #f0f0f0", marginBottom: 2, position: "sticky", top: 48, backgroundColor: "#fff", zIndex: 5 }}><span style={{ fontSize: 11, color: "#bbb", flex: 1 }}>{"\u5546\u54c1\u540d"}</span><div style={{ display: "flex", gap: 3, flexShrink: 0 }}>{["12M", "6M", "3M", "1M"].map(l => <span key={l} style={{ fontSize: 10, color: "#ccc", width: 26, textAlign: "center" }}>{l}</span>)}</div><div style={{ width: 80, textAlign: "right", flexShrink: 0 }}><span style={{ fontSize: 11, color: "#bbb" }}>{"\u4fa1\u683c"}</span></div><span style={{ width: 18 }} /></div>;

const useBoxData = () => {
  const [boxes, setBoxes] = useState(null), [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const [raw, prices] = await Promise.all([
          sbGet("boxes?select=id,name,snkrdunk_id,status,image_url,release_date,is_hidden,manual_price&snkrdunk_id=not.is.null&order=release_date.desc.nullslast"),
          (() => { const d = new Date(); d.setDate(d.getDate() - 400); return sbGetAll(`box_prices?select=box_id,date,price&date=gte.${d.toISOString().split('T')[0]}&order=date.desc`); })(),
        ]);
        if (!Array.isArray(raw)) { setBoxes([]); setLoading(false); return; }
        const pm = {}; prices.forEach(p => { if (!pm[p.box_id]) pm[p.box_id] = []; pm[p.box_id].push(p); });
        setBoxes(raw.filter(b => !b.is_hidden).map(b => {
          const bp = pm[b.id] || [], so = [...bp].sort((a, c) => c.date.localeCompare(a.date));
          const cur = b.manual_price || so[0]?.price || null;
          const wa = new Date(); wa.setDate(wa.getDate() - 7); const wp = so.find(p => new Date(p.date) <= wa);
          const wd = (cur && wp) ? cur - wp.price : null;
          return { id: b.id, name: b.name, release: b.release_date || "", status: b.status || null, current: cur, lastDate: so[0]?.date || null, t12: calcTrend(bp, 365), t6: calcTrend(bp, 180), t3: calcTrend(bp, 90), t1: calcTrend(bp, 30), pct12: calcPct(bp, 365), pct6: calcPct(bp, 180), pct3: calcPct(bp, 90), pct1: calcPct(bp, 30), weekDiff: wd, spark: buildSpark(bp), img: b.image_url || `https://placehold.co/44x44/888/fff?text=${encodeURIComponent(b.name.slice(0, 2))}`, snkrdunk_id: b.snkrdunk_id, buyLinks: [{ name: "\u30b9\u30cb\u30c0\u30f3", url: snkUrl(b.snkrdunk_id) }, { name: "\u30e1\u30eb\u30ab\u30ea", url: merUrl(`${b.name} BOX \u672a\u958b\u5c01`) }] };
        }));
      } catch (e) { console.error(e); setBoxes([]); }
      setLoading(false);
    })();
  }, []);
  return { boxes, loading };
};

/* Admin */
const AdminPage = ({ onBack }) => {
  const [boxes, setBoxes] = useState([]);
  const [cards, setCards] = useState([]);
  const [selBox, setSelBox] = useState(null);
  const [topCards, setTopCards] = useState([]);
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState("top");
  const [newName, setNewName] = useState("");
  const [newSnkId, setNewSnkId] = useState("");

  useEffect(() => {
    sbGet("boxes?select=id,name,snkrdunk_id,release_date&order=release_date.desc.nullslast&limit=500").then(d => Array.isArray(d) && setBoxes(d));
    sbGet("featured_cards?select=id,name,rarity,price,pack,img_url&is_active=eq.true&order=sort_order&limit=500").then(d => Array.isArray(d) && setCards(d));
  }, []);

  const loadTopCards = async (boxId) => {
    const rows = await sbGet(`box_top_cards?select=id,rank,probability,featured_card_id&box_id=eq.${boxId}&order=rank`);
    if (!Array.isArray(rows) || !rows.length) { setTopCards([]); return; }
    const ids = rows.map(r => r.featured_card_id).filter(Boolean);
    const [cardsData, pricesData] = await Promise.all([
      ids.length ? sbGet(`featured_cards?select=id,name,rarity,price,img_url&id=in.(${ids.join(",")})`) : [],
      ids.length ? sbGet(`featured_card_prices?select=card_id,price_raw&card_id=in.(${ids.join(",")})&order=fetched_date.desc`) : [],
    ]);
    const cm = {}; (Array.isArray(cardsData) ? cardsData : []).forEach(c => { cm[c.id] = c; });
    const pm = {}; (Array.isArray(pricesData) ? pricesData : []).forEach(p => { if (!pm[p.card_id] && p.price_raw) pm[p.card_id] = p.price_raw; });
    setTopCards(rows.map(r => {
      const fc = cm[r.featured_card_id] || {};
      return { ...r, featured_cards: { ...fc, price: pm[r.featured_card_id] || fc.price || 0 } };
    }));
  };
  const selectBox = (b) => { setSelBox(b); loadTopCards(b.id); };

  const saveTopCard = async (rank, cardId, probability) => {
    if (!selBox || !cardId) return;
    setMsg("\u4fdd\u5b58\u4e2d\u2026");
    await sbUpsert("box_top_cards", { box_id: selBox.id, rank, featured_card_id: cardId, probability: parseFloat(probability) || 0 });
    loadTopCards(selBox.id);
    setMsg("\u2713 \u4fdd\u5b58\u3057\u307e\u3057\u305f"); setTimeout(() => setMsg(""), 2000);
  };

  const deleteTopCard = async (id) => {
    if (!confirm("\u524a\u9664\u3057\u307e\u3059\u304b\uff1f")) return;
    await sbDel(`box_top_cards?id=eq.${id}`);
    loadTopCards(selBox.id);
    setMsg("\u2713 \u524a\u9664\u3057\u307e\u3057\u305f"); setTimeout(() => setMsg(""), 2000);
  };

  const addBox = async () => {
    if (!newName.trim() || !newSnkId.trim()) { setMsg("BOX\u540d\u3068\u30b9\u30cb\u30c0\u30f3ID\u3092\u5165\u529b"); return; }
    setMsg("\u767b\u9332\u4e2d\u2026");
    const res = await sbPost("boxes", { name: newName.trim(), snkrdunk_id: newSnkId.trim() });
    if (Array.isArray(res) && res[0]) { setBoxes(prev => [res[0], ...prev]); setNewName(""); setNewSnkId(""); setMsg("\u2713 BOX\u767b\u9332\u3057\u307e\u3057\u305f"); }
    else setMsg("Error: " + JSON.stringify(res));
    setTimeout(() => setMsg(""), 3000);
  };

  const S = { label: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 3, display: "block" }, input: { fontSize: 13, padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }, card: { backgroundColor: "#fff", borderRadius: 10, border: "1px solid #eee", padding: 16, marginBottom: 12 } };

  return <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", fontFamily: "'Noto Sans JP',sans-serif" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0}`}</style>
    <div style={{ backgroundColor: "#111", color: "#fff", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 15, fontWeight: 800 }}>{"\u2699\ufe0f"} BOX{"\u76f8\u5834"}AI {"\u7ba1\u7406"}</span>
      <button onClick={onBack} style={{ fontSize: 12, color: "#aaa", background: "none", border: "1px solid #555", borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontFamily: "inherit" }}>{"\u2190"} {"\u30b5\u30a4\u30c8\u306b\u623b\u308b"}</button>
    </div>
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 20px" }}>
      {msg && <div style={{ padding: "8px 12px", borderRadius: 6, backgroundColor: msg.startsWith("\u2713") ? "#f0fdf4" : "#fef2f2", border: `1px solid ${msg.startsWith("\u2713") ? "#bbf7d0" : "#fecaca"}`, marginBottom: 12, fontSize: 12, fontWeight: 600, color: msg.startsWith("\u2713") ? "#16a34a" : "#dc2626" }}>{msg}</div>}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        <button onClick={() => setTab("top")} style={{ ...pill(tab === "top"), padding: "8px 20px", fontSize: 13 }}>{"\ud83c\udfc6"} TOP{"\u30ab\u30fc\u30c9\u7ba1\u7406"}</button>
        <button onClick={() => setTab("box")} style={{ ...pill(tab === "box"), padding: "8px 20px", fontSize: 13 }}>{"\ud83d\udce6"} BOX{"\u767b\u9332"}</button>
      </div>

      {tab === "box" && <div style={S.card}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{"\ud83d\udce6"} BOX{"\u65b0\u898f\u767b\u9332"}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 2 }}><label style={S.label}>BOX{"\u540d"}</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="\u8d85\u96fb\u30d6\u30ec\u30a4\u30ab\u30fc" style={S.input} /></div>
          <div style={{ flex: 1 }}><label style={S.label}>{"\u30b9\u30cb\u30c0\u30f3"}ID</label><input value={newSnkId} onChange={e => setNewSnkId(e.target.value)} placeholder="12345" style={S.input} /></div>
        </div>
        <div style={{ fontSize: 10, color: "#aaa", marginBottom: 8 }}>{"\u30b9\u30cb\u30c0\u30f3"}ID = https://snkrdunk.com/trading-cards/<b>XXXXX</b></div>
        <button onClick={addBox} style={{ fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: "#111", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontFamily: "inherit" }}>{"\u767b\u9332"}</button>
        <div style={{ marginTop: 16, fontSize: 13, fontWeight: 700, color: "#555" }}>{"\u767b\u9332\u6e08"}BOX ({boxes.length}{"\u4ef6"})</div>
        <div style={{ maxHeight: 300, overflow: "auto", marginTop: 8 }}>
          {boxes.map(b => <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
            <span style={{ color: "#aaa", width: 40, flexShrink: 0 }}>#{b.id}</span>
            <span style={{ flex: 1, fontWeight: 600 }}>{b.name}</span>
            <span style={{ color: "#bbb", fontSize: 11 }}>snk:{b.snkrdunk_id}</span>
          </div>)}
        </div>
      </div>}

      {tab === "top" && <>
        <div style={S.card}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{"\u2460"} BOX{"\u9078\u629e"}</div>
          <select value={selBox?.id || ""} onChange={e => { const b = boxes.find(x => x.id == e.target.value); if (b) selectBox(b); }} style={{ ...S.input, fontSize: 13 }}>
            <option value="">-- BOX{"\u3092\u9078\u629e"} --</option>
            {boxes.map(b => <option key={b.id} value={b.id}>{b.name} (ID:{b.id})</option>)}
          </select>
        </div>
        {selBox && <>
          <div style={S.card}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{"\u2461"} {"\u73fe\u5728"}TOP{"\u30ab\u30fc\u30c9"} {"\u2014"} {selBox.name}</div>
            {topCards.length > 0 ? topCards.map(tc => <div key={tc.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f5f5f5" }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, backgroundColor: "#EAB30815", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#EAB308" }}>{tc.rank}</div>
              {tc.featured_cards?.img_url && <img src={tc.featured_cards.img_url} alt="" style={{ width: 28, height: 38, borderRadius: 3, objectFit: "cover" }} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{tc.featured_cards?.name || "?"}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>{tc.featured_cards?.rarity} {"\u30fb"} {"\u5c01\u5165\u7387"} {(tc.probability * 100).toFixed(1)}% {"\u30fb"} {"\u00a5"}{tc.featured_cards?.price?.toLocaleString()}</div>
              </div>
              <button onClick={() => deleteTopCard(tc.id)} style={{ fontSize: 10, color: "#dc2626", background: "none", border: "1px solid #fecaca", borderRadius: 4, padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}>{"\u524a\u9664"}</button>
            </div>) : <div style={{ fontSize: 12, color: "#bbb", padding: 8 }}>{"\u672a\u767b\u9332"}</div>}
          </div>
          <TopCardAdder boxId={selBox.id} cards={cards} onSave={saveTopCard} existingRanks={topCards.map(t => t.rank)} />
        </>}
      </>}
    </div>
  </div>;
};

const TopCardAdder = ({ boxId, cards, onSave, existingRanks }) => {
  const [rank, setRank] = useState("");
  const [cardId, setCardId] = useState("");
  const [prob, setProb] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return cards.slice(0, 20);
    const lw = search.toLowerCase();
    return cards.filter(c => c.name.toLowerCase().includes(lw) || (c.pack || "").toLowerCase().includes(lw)).slice(0, 30);
  }, [cards, search]);

  const selectedCard = cards.find(c => c.id === cardId);
  const nextRank = existingRanks.length > 0 ? Math.max(...existingRanks) + 1 : 1;
  const S = { label: { fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 3, display: "block" }, input: { fontSize: 13, padding: "8px 10px", borderRadius: 6, border: "1px solid #ddd", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }, card: { backgroundColor: "#fff", borderRadius: 10, border: "1px solid #eee", padding: 16, marginBottom: 12 } };

  return <div style={S.card}>
    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{"\u2462"} TOP{"\u30ab\u30fc\u30c9\u8ffd\u52a0"}</div>
    <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
      <div style={{ width: 70 }}><label style={S.label}>{"\u9806\u4f4d"}</label><input value={rank || nextRank} onChange={e => setRank(e.target.value.replace(/\D/g, ""))} style={S.input} /></div>
      <div style={{ width: 100 }}><label style={S.label}>{"\u5c01\u5165\u7387"} (%)</label><input value={prob} onChange={e => setProb(e.target.value)} placeholder="0.51" style={S.input} /></div>
    </div>
    <label style={S.label}>{"\u30ab\u30fc\u30c9\u691c\u7d22"}</label>
    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={"\u30ab\u30fc\u30c9\u540d or \u30d1\u30c3\u30af\u540d\u3067\u691c\u7d22\u2026"} style={{ ...S.input, marginBottom: 8 }} />
    {selectedCard && <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", backgroundColor: "#f0fdf4", borderRadius: 6, border: "1px solid #bbf7d0", marginBottom: 8 }}>
      <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 700 }}>{"\u2713"} {"\u9078\u629e\u4e2d"}:</span>
      {selectedCard.img_url && <img src={selectedCard.img_url} alt="" style={{ width: 24, height: 32, borderRadius: 2, objectFit: "cover" }} />}
      <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedCard.name}</span>
      <span style={{ fontSize: 10, color: "#888" }}>{selectedCard.rarity} {"\u30fb"} {"\u00a5"}{selectedCard.price?.toLocaleString()}</span>
      <button onClick={() => setCardId("")} style={{ marginLeft: "auto", fontSize: 10, color: "#888", background: "none", border: "none", cursor: "pointer" }}>{"\u2715"}</button>
    </div>}
    <div style={{ maxHeight: 200, overflow: "auto", border: "1px solid #f0f0f0", borderRadius: 6 }}>
      {filtered.map(c => <div key={c.id} onClick={() => setCardId(c.id)}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", cursor: "pointer", backgroundColor: c.id === cardId ? "#eff6ff" : "transparent", borderBottom: "1px solid #f9f9f9" }}
        onMouseEnter={e => { if (c.id !== cardId) e.currentTarget.style.backgroundColor = "#fafafa"; }}
        onMouseLeave={e => { if (c.id !== cardId) e.currentTarget.style.backgroundColor = "transparent"; }}>
        {c.img_url && <img src={c.img_url} alt="" style={{ width: 22, height: 30, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>{c.pack} {"\u30fb"} {c.rarity}</div>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{"\u00a5"}{c.price?.toLocaleString()}</div>
      </div>)}
    </div>
    <button onClick={() => { onSave(parseInt(rank) || nextRank, cardId, (parseFloat(prob) || 0) / 100); setRank(""); setProb(""); setCardId(""); setSearch(""); }}
      disabled={!cardId} style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "#fff", backgroundColor: cardId ? "#111" : "#ccc", border: "none", borderRadius: 8, padding: "10px 24px", cursor: cardId ? "pointer" : "default", fontFamily: "inherit" }}>
      TOP{"\u30ab\u30fc\u30c9\u3092\u8ffd\u52a0"}
    </button>
  </div>;
};

export default function BoxSoubaApp() {
  const [page, setPage] = useState("main");
  const [sel, setSel] = useState(null);
  const { boxes: live, loading } = useBoxData();
  const all = live || [];
  const [q, setQ] = useState(""), [view, setView] = useState("grid"), [fOpen, setFOpen] = useState(false);
  const [period, setPeriod] = useState("week"), [dir, setDir] = useState("all"), [sort, setSort] = useState("change");
  const [pMin, setPMin] = useState(""), [pMax, setPMax] = useState(""), [yMin, setYMin] = useState(""), [yMax, setYMax] = useState(""), [hideNP, setHideNP] = useState(true);
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

  if (page === "admin") return <AdminPage onBack={() => setPage("main")} />;

  return <div style={{ minHeight: "100vh", backgroundColor: "#f8f9fa", fontFamily: "'Noto Sans JP','Helvetica Neue',-apple-system,sans-serif", color: "#111" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}body{margin:0}@media(max-width:500px){.box-grid{grid-template-columns:repeat(2,1fr)!important}}`}</style>
    <header style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 17, fontWeight: 900, letterSpacing: "-.5px" }}>{"\ud83d\udce6"} BOX{"\u76f8\u5834"}AI</span><span style={{ fontSize: 9, fontWeight: 700, color: "#fff", backgroundColor: "#EAB308", padding: "2px 6px", borderRadius: 4 }}>BETA</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {lastUp && <span style={{ fontSize: 10, color: "#bbb" }}>{"\u66f4\u65b0"} {lastUp.replace(/-/g, "/")}</span>}
          <button onClick={() => setPage("admin")} style={{ fontSize: 9, padding: "3px 8px", borderRadius: 4, border: "1px solid #eee", backgroundColor: "#fff", color: "#aaa", cursor: "pointer", fontFamily: "inherit" }}>{"\u2699\ufe0f"}</button>
        </div>
      </div>
    </header>
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 20px 80px", width: "100%" }}>
      {loading && <div style={{ textAlign: "center", padding: "48px 16px", color: "#aaa", fontSize: 13 }}>{"\ud83d\udce6"} {"\u8aad\u307f\u8fbc\u307f\u4e2d\u2026"}</div>}
      {!loading && <>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <div style={{ flex: 1, position: "relative" }}><span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#bbb" }}>{"\ud83d\udd0d"}</span><input value={q} onChange={e => setQ(e.target.value)} placeholder={"BOX\u540d\u3067\u691c\u7d22\u2026"} style={{ fontSize: 12, padding: "7px 8px 7px 30px", borderRadius: 6, border: "1px solid #eee", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />{q && <button onClick={() => setQ("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#bbb" }}>{"\u2715"}</button>}</div>
          <button onClick={() => setFOpen(!fOpen)} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", border: "1px solid", flexShrink: 0, backgroundColor: hasF ? "#111" : "#fff", color: hasF ? "#fff" : "#666", borderColor: hasF ? "#111" : "#eee" }}>{"\u7d5e\u308a\u8fbc\u307f"}{fCnt > 0 ? ` (${fCnt})` : ""} <span style={{ transform: fOpen ? "rotate(180deg)" : "none", transition: "transform .2s", display: "inline-block" }}>{"\u25be"}</span></button>
        </div>
        {fOpen && <div style={{ padding: "10px 12px", backgroundColor: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 8, marginBottom: 6 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
            <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{"\u671f\u9593"}</div><div style={{ display: "flex", gap: 3 }}>{[["week", "\u524d\u9031\u6bd4"], ["1m", "1M"], ["3m", "3M"], ["6m", "6M"], ["12m", "12M"]].map(([k, l]) => <button key={k} onClick={() => setPeriod(k)} style={pill(period === k)}>{l}</button>)}</div></div>
            <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{"\u65b9\u5411"}</div><div style={{ display: "flex", gap: 3 }}>{[["all", "\u5168\u3066"], ["up", "\u2191 \u4e0a\u6607"], ["down", "\u2193 \u4e0b\u843d"]].map(([k, l]) => <button key={k} onClick={() => setDir(k)} style={pill(dir === k)}>{l}</button>)}</div></div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
            <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{"\u4fa1\u683c"}</div><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input value={pMin} onChange={e => setPMin(e.target.value.replace(/\D/g, ""))} placeholder={"\u00a5 \u4e0b\u9650"} style={rIn} /><span style={{ fontSize: 11, color: "#ccc" }}>{"\u301c"}</span><input value={pMax} onChange={e => setPMax(e.target.value.replace(/\D/g, ""))} placeholder={"\u00a5 \u4e0a\u9650"} style={rIn} /></div></div>
            <div><div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{"\u767a\u58f2\u5e74"}</div><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input value={yMin} onChange={e => setYMin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2023" style={{ ...rIn, width: 68 }} /><span style={{ fontSize: 11, color: "#ccc" }}>{"\u301c"}</span><input value={yMax} onChange={e => setYMax(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2026" style={{ ...rIn, width: 68 }} /></div></div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}><input type="checkbox" checked={hideNP} onChange={e => setHideNP(e.target.checked)} style={{ accentColor: "#111" }} /><span style={{ fontSize: 11, color: "#888" }}>{"\u4fa1\u683c\u306a\u3057\u975e\u8868\u793a"}</span></label><div style={{ display: "flex", alignItems: "center", gap: 8 }}>{hasF && <button onClick={clearF} style={{ fontSize: 10, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{"\u00d7"} {"\u30ea\u30bb\u30c3\u30c8"}</button>}<span style={{ fontSize: 11, color: "#bbb" }}>{filtered.length}{"\u4ef6"}</span></div></div>
        </div>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 0", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, color: "#aaa", fontWeight: 700 }}>{"\u4e26\u3073\u66ff\u3048"}</span><div style={{ display: "flex", gap: 3 }}>{[["change", "\u5909\u52d5\u7387"], ["price", "\u4fa1\u683c"], ["release_date", "\u767a\u58f2\u65e5"]].map(([k, l]) => <button key={k} onClick={() => setSort(k)} style={pill(sort === k)}>{l}</button>)}</div></div>
          <div style={{ display: "flex", gap: 2 }}><button onClick={() => setView("list")} style={{ width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: view === "list" ? "#111" : "#fff", color: view === "list" ? "#fff" : "#aaa", borderColor: view === "list" ? "#111" : "#eee" }}>{"\u2630"}</button><button onClick={() => setView("grid")} style={{ width: 28, height: 28, borderRadius: 6, cursor: "pointer", border: "1px solid", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: view === "grid" ? "#111" : "#fff", color: view === "grid" ? "#fff" : "#aaa", borderColor: view === "grid" ? "#111" : "#eee" }}>{"\u229e"}</button></div>
        </div>
        {view === "grid" ? <div className="box-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>{filtered.map(b => <BoxGridCard key={b.id} b={b} onSelect={setSel} />)}</div>
          : <><ListHeader />{filtered.map((b, i) => <BoxRow key={b.id} b={b} isLast={i === filtered.length - 1} onSelect={setSel} />)}</>}
        {!filtered.length && <div style={{ textAlign: "center", padding: "32px 16px", color: "#ccc", fontSize: 13 }}>{"\u8a72\u5f53\u3059\u308bBOX\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093"}</div>}
      </>}
    </div>
    <footer style={{ borderTop: "1px solid #eee", padding: "20px 0", textAlign: "center", backgroundColor: "#fff" }}><div style={{ fontSize: 10, color: "#bbb" }}>{"\u203b"} {"\u4fa1\u683c\u306f\u30b9\u30cb\u30c0\u30f3\u306e\u53d6\u5f15\u76f8\u5834\u3092\u53c2\u8003\u306b\u3057\u3066\u3044\u307e\u3059"}</div><div style={{ fontSize: 10, color: "#ccc", marginTop: 4 }}>BOX{"\u76f8\u5834"}AI {"\u00a9"} 2025</div></footer>
    {sel && <BoxDetail box={sel} onClose={() => setSel(null)} />}
  </div>;
}

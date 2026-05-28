// ════════════════════════════════════════════════════════════════
// EVIDENCE VAULT — full-bleed desktop view: chain timeline, detail,
// export pack, public verifier, tamper demo.
// ════════════════════════════════════════════════════════════════
import { useState } from "react";
import { BB, FONT_MONO, FONT_SANS } from "../theme.js";
import { SITES, SITE_COLOR, GEO, TYPES, pseudoHash, hhmm, summarize } from "../data.js";
import {
  Mono, Chip, HashChip, SecLabel, Card, StripedPlaceholder, KV, ModalShell,
  btnPriV, btnSecV,
} from "../components/atoms.jsx";
import { toast } from "../components/Toast.jsx";

export function EvidenceVault({ chain, onBackToField, backLabel = "← Back", accentColor = BB.orange, chainVisibility = "visible" }) {
  const [selectedId, setSelectedId] = useState(null);
  const [siteFilter, setSiteFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [dateRange, setDateRange] = useState("today");
  const [search, setSearch] = useState("");
  const [showExport, setShowExport] = useState(false);
  const [showVerifier, setShowVerifier] = useState(false);
  const [showTamper, setShowTamper] = useState(false);

  const filtered = chain.filter(e => {
    if (siteFilter && e.site !== siteFilter) return false;
    if (typeFilter && e.type !== typeFilter) return false;
    if (search) {
      const blob = JSON.stringify(e).toLowerCase();
      if (!blob.includes(search.toLowerCase())) return false;
    }
    return true;
  });
  const selected = chain.find(e => e.id === selectedId) || filtered[0];

  const sealedFrom = chain[0]?.sealed;
  const sealedTo = chain[chain.length - 1]?.sealed;

  return (
    <div style={{
      minHeight: "100vh", background: BB.bg, color: BB.text,
      display: "grid", gridTemplateRows: "auto 1fr", overflow: "hidden",
    }}>
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "12px 20px", background: BB.bg2,
        borderBottom: `1px solid ${BB.border}`,
      }}>
        <button onClick={onBackToField} style={{
          background: BB.card2, color: BB.muted, border: `1px solid ${BB.border2}`,
          padding: "7px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        }}>{backLabel}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Mono style={{ fontSize: 18, fontWeight: 800, color: BB.text, letterSpacing: -0.5 }}>
            SITE<span style={{ color: accentColor }}>OPS</span>
          </Mono>
          <Mono style={{ fontSize: 10, color: BB.muted, letterSpacing: 1.5 }}>EVIDENCE VAULT</Mono>
        </div>
        <div style={{ height: 22, width: 1, background: BB.border2 }} />
        <Chip color={BB.green} dot mono>CHAIN INTEGRITY OK</Chip>
        <Mono style={{ fontSize: 10, color: BB.muted }}>
          {chain.length} entries · genesis {chain[0]?.hash.slice(0,8)} → head {chain[chain.length-1]?.hash.slice(0,8)}
        </Mono>
        <div style={{ flex: 1 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 search entries, hashes, names…" style={{
          width: 320, padding: "7px 12px", background: BB.card, color: BB.text,
          border: `1px solid ${BB.border2}`, borderRadius: 6, fontSize: 12,
          fontFamily: FONT_SANS, outline: "none",
        }} />
        <button onClick={() => setShowTamper(true)} style={{
          background: BB.card2, color: BB.muted, border: `1px solid ${BB.border2}`,
          padding: "7px 11px", borderRadius: 6, fontSize: 11, fontWeight: 600,
        }}>🧪 Demo tamper</button>
        <button onClick={() => setShowVerifier(true)} style={{
          background: BB.card2, color: BB.cyan, border: `1px solid ${BB.cyan}33`,
          padding: "7px 11px", borderRadius: 6, fontSize: 11, fontWeight: 700,
        }}>🌐 Public verifier</button>
        <button onClick={() => setShowExport(true)} style={{
          background: accentColor, color: "#000", border: "none",
          padding: "8px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700,
        }}>📦 Export evidence pack</button>
      </div>

      {/* ── 3-COLUMN LAYOUT ─────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 420px", minHeight: 0 }}>
        {/* LEFT — filters */}
        <div style={{
          background: BB.bg2, borderRight: `1px solid ${BB.border}`,
          padding: 16, overflowY: "auto",
        }}>
          <SecLabel style={{ marginBottom: 10 }}>Date range</SecLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 16 }}>
            <FilterRow active={dateRange === "today"}  onClick={() => setDateRange("today")} label="Today" count={chain.length} color={accentColor} />
            <FilterRow active={dateRange === "week"}   onClick={() => { setDateRange("week"); toast("Demo · showing today only · 1,847 entries archived", "info"); }} label="This week" count={chain.length * 5} />
            <FilterRow active={dateRange === "month"}  onClick={() => { setDateRange("month"); toast("Demo · showing today only · 8,920 entries archived", "info"); }} label="This month" count={chain.length * 22} />
            <FilterRow active={dateRange === "custom"} onClick={() => { setDateRange("custom"); toast("Demo · date picker not wired", "info"); }} label="Custom range…" count="" />
          </div>

          <SecLabel style={{ marginBottom: 10 }}>Sites</SecLabel>
          <FilterRow active={!siteFilter} onClick={() => setSiteFilter(null)} label="All sites" count={chain.length} color={BB.text2} />
          {SITES.map(s => (
            <FilterRow key={s.id} active={siteFilter === s.id} onClick={() => setSiteFilter(siteFilter === s.id ? null : s.id)}
              label={s.name} count={chain.filter(e => e.site === s.id).length} color={SITE_COLOR[s.id]} />
          ))}

          <SecLabel style={{ marginTop: 16, marginBottom: 10 }}>Entry type</SecLabel>
          <FilterRow active={!typeFilter} onClick={() => setTypeFilter(null)} label="All types" count={chain.length} color={BB.text2} />
          {Object.entries(TYPES).filter(([k]) => chain.some(e => e.type === k)).map(([k, t]) => (
            <FilterRow key={k} active={typeFilter === k} onClick={() => setTypeFilter(typeFilter === k ? null : k)}
              label={`${t.icon} ${t.label}`} count={chain.filter(e => e.type === k).length} color={t.color} />
          ))}
        </div>

        {/* CENTER — timeline */}
        <div style={{ overflowY: "auto", padding: "18px 22px" }}>
          {/* chain integrity strip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            background: BB.green + "08", border: `1px solid ${BB.green}33`,
            borderRadius: 9, marginBottom: 16,
          }}>
            <div style={{ fontSize: 20 }}>⛓</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BB.green }}>Chain integrity verified · all {chain.length} entries sealed</div>
              <Mono style={{ fontSize: 10, color: BB.muted, marginTop: 2 }}>
                Sealed from {new Date(sealedFrom).toISOString().slice(0,16)}Z to {new Date(sealedTo).toISOString().slice(0,16)}Z · 0 breaks · 0 redactions
              </Mono>
            </div>
            <Mono style={{ fontSize: 9, color: BB.muted, textAlign: "right" }}>
              <div>Genesis: {chain[0]?.hash.slice(0,16)}</div>
              <div>Head: {chain[chain.length-1]?.hash.slice(0,16)}</div>
            </Mono>
          </div>

          <SecLabel style={{ marginBottom: 12 }}>Timeline · {filtered.length} entries · chronological</SecLabel>

          <ChainTimeline entries={filtered} selectedId={selected?.id} onSelect={setSelectedId} accent={accentColor} chainVisibility={chainVisibility} />
        </div>

        {/* RIGHT — selected entry detail */}
        <div style={{
          background: BB.bg2, borderLeft: `1px solid ${BB.border}`,
          padding: 18, overflowY: "auto",
        }}>
          {selected ? (
            <VaultEntryDetail entry={selected} chain={chain} accent={accentColor} onOpenVerifier={() => setShowVerifier(true)} />
          ) : (
            <div style={{ color: BB.muted, fontSize: 13, textAlign: "center", padding: 40 }}>
              Select an entry to view its chain proof.
            </div>
          )}
        </div>
      </div>

      {showExport && <ExportPackModal chain={filtered} onClose={() => setShowExport(false)} accent={accentColor} />}
      {showVerifier && <PublicVerifierModal entry={selected} chain={chain} onClose={() => setShowVerifier(false)} accent={accentColor} />}
      {showTamper && <TamperDemoModal chain={chain} onClose={() => setShowTamper(false)} />}
    </div>
  );
}

// ── Filter row sidebar ─────────────────────────────────────────
function FilterRow({ active, label, count, color = BB.text2, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "7px 10px", borderRadius: 6,
      background: active ? color + "12" : "transparent",
      border: `1px solid ${active ? color + "44" : "transparent"}`,
      cursor: onClick ? "pointer" : "default", marginBottom: 3,
    }}>
      <div style={{ fontSize: 12, color: active ? color : BB.text2, fontWeight: active ? 700 : 500 }}>{label}</div>
      <Mono style={{ fontSize: 10, color: BB.muted }}>{count}</Mono>
    </div>
  );
}

// ── Chain timeline (the hero of the vault) ─────────────────────
function ChainTimeline({ entries, selectedId, onSelect, accent, chainVisibility }) {
  return (
    <div style={{ position: "relative" }}>
      {entries.map((e, i) => {
        const t = TYPES[e.type];
        const isSelected = e.id === selectedId;
        const isLast = i === entries.length - 1;
        return (
          <div key={e.id} style={{ display: "flex", gap: 14, position: "relative" }}>
            {/* spine */}
            <div style={{ width: 36, display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: t.color + "1c",
                border: `1px solid ${t.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                position: "relative", zIndex: 2,
              }}>{t.icon}</div>
              {!isLast && (
                <div style={{ width: 2, flex: 1, background: BB.border2, marginTop: 2, marginBottom: 2, position: "relative" }}>
                  {chainVisibility !== "hidden" && (
                    <div style={{
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                      fontFamily: FONT_MONO, fontSize: 8, color: BB.muted, background: BB.bg,
                      padding: "0 4px", whiteSpace: "nowrap",
                    }}>⛓ {e.hash.slice(0, 6)}</div>
                  )}
                </div>
              )}
            </div>

            {/* card */}
            <div onClick={() => onSelect(e.id)} style={{
              flex: 1, marginBottom: 12,
              background: isSelected ? BB.card3 : BB.card,
              border: `1px solid ${isSelected ? accent + "55" : BB.border}`,
              borderLeft: `3px solid ${t.color}`,
              borderRadius: 8, padding: 14, cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Mono style={{ fontSize: 11, color: BB.muted }}>{hhmm(e.t)}</Mono>
                    <Mono style={{ fontSize: 10, color: BB.muted }}>·</Mono>
                    <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.label}</span>
                    <Chip color={SITE_COLOR[e.site]} dot>{SITES.find(s => s.id === e.site).name}</Chip>
                  </div>
                  <div style={{ fontSize: 13, color: BB.text, marginTop: 5, lineHeight: 1.5 }}>{summarize(e)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <HashChip hash={e.hash} />
                  <Mono style={{ fontSize: 9, color: BB.muted }}>{e.id}</Mono>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, fontSize: 10, color: BB.muted }}>
                <Mono>👤 {e.by}</Mono>
                <Mono>📱 {e.device}</Mono>
                {e.witnesses?.length > 0 && <Mono>👥 +{e.witnesses.length} witness{e.witnesses.length > 1 ? "es" : ""}</Mono>}
                {e.payload?.placeholder && <Mono>📎 attached</Mono>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Selected-entry detail (right pane) ─────────────────────────
function VaultEntryDetail({ entry, chain, accent, onOpenVerifier }) {
  const t = TYPES[entry.type];
  const p = entry.payload || {};

  return (
    <div>
      <SecLabel style={{ marginBottom: 10 }}>Selected entry</SecLabel>
      <div style={{
        background: BB.card, borderRadius: 10, padding: 14,
        border: `1px solid ${t.color}33`, borderLeft: `3px solid ${t.color}`,
        marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8, background: t.color + "1c",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{t.label}</div>
            <Mono style={{ fontSize: 10, color: BB.muted }}>{entry.id} · {hhmm(entry.t)}</Mono>
          </div>
          <HashChip hash={entry.hash} />
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.55, color: BB.text2 }}>{summarize(entry)}</div>
      </div>

      {p.placeholder && <StripedPlaceholder label={p.placeholder} color={t.color} h={160} style={{ marginBottom: 12 }} />}

      {p.transcript && (
        <div style={{ marginBottom: 12 }}>
          <SecLabel style={{ marginBottom: 6 }}>Transcript</SecLabel>
          <div style={{ padding: 11, background: BB.card, borderRadius: 7,
            border: `1px solid ${BB.border}`, fontSize: 12.5, lineHeight: 1.6 }}>
            "{p.transcript}"
          </div>
        </div>
      )}

      <div style={{ marginBottom: 12 }}>
        <SecLabel style={{ marginBottom: 6 }}>Payload</SecLabel>
        <div style={{ background: BB.card, border: `1px solid ${BB.border}`, borderRadius: 7,
          padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {Object.entries(p).filter(([k]) => !["placeholder","transcript"].includes(k)).map(([k, v]) => (
            <KV key={k} k={k} v={Array.isArray(v) ? v.join(", ") : String(v)} />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <SecLabel style={{ marginBottom: 6, color: BB.green }}>Cryptographic proof</SecLabel>
        <div style={{ background: BB.card, border: `1px solid ${BB.green}33`, borderRadius: 7,
          padding: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          <KV k="Recorded"  v={entry.t} />
          <KV k="Sealed at" v={entry.sealed} />
          <KV k="Signed by" v={entry.by} />
          <KV k="Device"    v={entry.device} />
          <KV k="GPS"       v={`${GEO[entry.site].lat.toFixed(5)}, ${GEO[entry.site].lng.toFixed(5)} ±3m`} />
          <KV k="Algorithm" v="SHA-256 / Ed25519" />
          <div style={{ height: 1, background: BB.border, margin: "5px 0" }} />
          <KV k="Prev hash" v={entry.prevHash} />
          <KV k="This hash" v={entry.hash} />
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <Chip color={BB.green} dot>VERIFIED</Chip>
          <Chip color={BB.cyan}>Ed25519 signed</Chip>
          <Chip color={BB.purple}>{entry.witnesses?.length || 0} witnesses</Chip>
        </div>
      </div>

      {entry.witnesses?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <SecLabel style={{ marginBottom: 6 }}>Witness signatures</SecLabel>
          {entry.witnesses.map(w => (
            <div key={w} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8,
              background: BB.card, border: `1px solid ${BB.border}`, borderRadius: 6, marginBottom: 4 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", background: BB.blue + "22", color: BB.blue,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 }}>
                {w.split(" ").map(n => n[0]).join("")}
              </div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 600 }}>{w}</div>
              <Mono style={{ fontSize: 9, color: BB.muted }}>{pseudoHash(w + entry.hash).slice(0,8)}</Mono>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => toast(`✓ Chain proof copied · ${entry.hash.slice(0,16)}…`)} style={{
          flex: 1, padding: "10px", borderRadius: 7,
          background: BB.card2, color: BB.text2, border: `1px solid ${BB.border2}`,
          fontWeight: 600, fontSize: 11, cursor: "pointer",
        }}>Copy chain proof</button>
        <button onClick={onOpenVerifier} style={{
          flex: 1, padding: "10px", borderRadius: 7,
          background: BB.cyan + "1c", color: BB.cyan, border: `1px solid ${BB.cyan}44`,
          fontWeight: 700, fontSize: 11, cursor: "pointer",
        }}>🌐 Public verify URL</button>
      </div>
    </div>
  );
}

// ── EXPORT MODAL ────────────────────────────────────────────────
function ExportPackModal({ chain, onClose, accent }) {
  const [opts, setOpts] = useState({ pdf: true, json: true, media: true, witnesses: true, geo: true, transcripts: true, chain: true });
  const [dest, setDest] = useState("download");
  const [stage, setStage] = useState("config"); // config | building | ready

  const build = () => { setStage("building"); setTimeout(() => setStage("ready"), 1800); };
  const sizeMB = Math.round(chain.length * 0.07 + (opts.media ? chain.filter(e => e.payload?.placeholder).length * 1.2 : 0));
  const filename = `SiteOps_FirstCivil_${new Date().toISOString().slice(0,10)}_${chain.length}entries.zip`;

  return (
    <ModalShell onClose={onClose} title="📦 Export evidence pack" width={580}>
      {stage === "config" && (
        <>
          <div style={{ fontSize: 12, color: BB.muted, marginBottom: 16, lineHeight: 1.6 }}>
            Generates a court-ready evidence bundle. Includes a signed manifest, every entry's hash, and a verification key.
            Open the bundled <Mono>verify.html</Mono> on any machine — no internet needed — to confirm the chain hasn't been altered.
          </div>

          <SecLabel style={{ marginBottom: 8 }}>What to include</SecLabel>
          {[
            { k: "pdf",         label: "Court-ready PDF report",    sub: "Human-readable summary, ~38 pages" },
            { k: "json",        label: "JSON evidence ledger",      sub: "Full chain, every payload, signatures" },
            { k: "media",       label: "Original media files",      sub: "Photos, voice recordings, EXIF preserved" },
            { k: "transcripts", label: "Voice transcripts + audio", sub: "Time-coded, with confidence scores" },
            { k: "geo",         label: "GPS tracks + geofence logs", sub: "Per-entry coordinates, ±3m accuracy" },
            { k: "witnesses",   label: "Witness corroborations",    sub: "Co-signatures from nearby crew" },
            { k: "chain",       label: "Verification HTML + pubkey", sub: "Standalone, offline-verifiable bundle" },
          ].map(opt => (
            <div key={opt.k} onClick={() => setOpts({ ...opts, [opt.k]: !opts[opt.k] })} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              background: opts[opt.k] ? accent + "0c" : BB.card,
              border: `1px solid ${opts[opt.k] ? accent + "44" : BB.border}`,
              borderRadius: 7, marginBottom: 5, cursor: "pointer",
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4,
                background: opts[opt.k] ? accent : BB.card2,
                border: `1px solid ${opts[opt.k] ? accent : BB.border2}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, color: "#000", fontWeight: 700,
              }}>{opts[opt.k] ? "✓" : ""}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                <Mono style={{ fontSize: 10, color: BB.muted }}>{opt.sub}</Mono>
              </div>
              <Chip color={BB.green} style={{ fontSize: 8 }}>RECOMMENDED</Chip>
            </div>
          ))}

          <SecLabel style={{ marginTop: 16, marginBottom: 8 }}>Destination</SecLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
            {[
              { id: "download", l: "Download .zip",    icon: "💾" },
              { id: "insurer",  l: "Email to insurer", icon: "✉️" },
              { id: "lawyer",   l: "Send to lawyer",   icon: "⚖️" },
            ].map(d => (
              <div key={d.id} onClick={() => setDest(d.id)} style={{
                padding: "10px", borderRadius: 7, textAlign: "center",
                background: dest === d.id ? accent + "1c" : BB.card,
                border: `1px solid ${dest === d.id ? accent + "44" : BB.border}`,
                color: dest === d.id ? accent : BB.text2, cursor: "pointer",
              }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{d.icon}</div>
                <Mono style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>{d.l}</Mono>
              </div>
            ))}
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 14px", background: BB.card2, border: `1px solid ${BB.border}`,
            borderRadius: 7, marginBottom: 14,
          }}>
            <div>
              <Mono style={{ fontSize: 10, color: BB.muted, letterSpacing: 0.5 }}>OUTPUT</Mono>
              <Mono style={{ fontSize: 12, color: BB.text, display: "block" }}>{filename}</Mono>
            </div>
            <div style={{ textAlign: "right" }}>
              <Mono style={{ fontSize: 14, color: accent, fontWeight: 700 }}>{sizeMB} MB</Mono>
              <Mono style={{ fontSize: 10, color: BB.muted, display: "block" }}>{chain.length} entries</Mono>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onClose} style={btnSecV}>Cancel</button>
            <button onClick={build} style={{ ...btnPriV, background: accent }}>Build evidence pack →</button>
          </div>
        </>
      )}

      {stage === "building" && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite", display: "inline-block" }}>⛓</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Building evidence pack…</div>
          <div style={{ fontSize: 12, color: BB.muted, marginBottom: 18 }}>Verifying chain · stamping signatures · packaging media</div>
          {["Verifying chain integrity… 1,847 hashes","Re-signing manifest with site key","Bundling media + transcripts","Generating PDF report","Embedding offline verifier"].map((s, i) => (
            <div key={i} style={{ fontSize: 11, color: i < 3 ? BB.green : BB.muted, marginBottom: 4, fontFamily: FONT_MONO }}>
              {i < 3 ? "✓" : "·"} {s}
            </div>
          ))}
        </div>
      )}

      {stage === "ready" && (
        <div style={{ padding: "20px 0" }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 5 }}>Evidence pack ready</div>
            <Mono style={{ fontSize: 11, color: BB.muted }}>Manifest sealed · chain verified · {sizeMB} MB</Mono>
          </div>
          <Card style={{ marginBottom: 14 }}>
            <SecLabel style={{ marginBottom: 8 }}>Bundle contents</SecLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <KV k="manifest.json"       v={`${chain.length} entries, signed`} />
              <KV k="evidence-report.pdf" v="38 pages, A4" />
              <KV k="media/"              v={`${chain.filter(e => e.payload?.placeholder).length} files`} />
              <KV k="verify.html"         v="standalone, offline" />
              <KV k="pubkey.pem"          v="FirstCivil-2026-Q2" />
              <KV k="bundle-hash"         v={pseudoHash("export" + chain.length).slice(0,40)+"…"} />
            </div>
          </Card>
          <button onClick={() => {
            const msg = dest === "download" ? `✓ Download started · ${filename}` :
                        dest === "insurer"  ? `✓ Sent to NRMA Insurance claims · receipt SX-${pseudoHash(filename).slice(0,6)}` :
                                              `✓ Sent to Holman Webb Lawyers · receipt HW-${pseudoHash(filename).slice(0,6)}`;
            toast(msg); onClose();
          }} style={{ ...btnPriV, background: BB.green, color: "#000", width: "100%" }}>
            {dest === "download" ? `💾 Download ${filename}` :
             dest === "insurer"  ? `✉️  Email to insurer` :
                                   `⚖️  Send to lawyer`}
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ── PUBLIC VERIFIER MODAL ───────────────────────────────────────
function PublicVerifierModal({ entry, chain, onClose, accent }) {
  const e = entry || chain[chain.length - 1];
  const url = `https://verify.siteops.app/e/${e.hash.slice(0,16)}`;
  return (
    <ModalShell onClose={onClose} title="🌐 Public verifier URL" width={680}>
      <div style={{ fontSize: 12, color: BB.muted, marginBottom: 14, lineHeight: 1.6 }}>
        Anyone with this URL can verify the entry's authenticity without an account. They see the entry, its chain proof,
        the witnesses, and can re-verify the hash locally. Nothing else from the chain is exposed.
      </div>

      <Card style={{ marginBottom: 14, background: BB.bg, borderColor: BB.cyan + "44" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Mono style={{ fontSize: 12, color: BB.cyan, flex: 1, wordBreak: "break-all" }}>{url}</Mono>
          <button onClick={() => toast(`✓ URL copied to clipboard`)} style={{ background: BB.cyan, color: "#000", border: "none", padding: "6px 12px",
            borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Copy</button>
          <button onClick={() => toast(`✓ QR code generated · printable PDF ready`, "info")} style={{ background: BB.card2, color: BB.cyan, border: `1px solid ${BB.cyan}44`,
            padding: "6px 12px", borderRadius: 5, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>QR</button>
        </div>
      </Card>

      <SecLabel style={{ marginBottom: 8 }}>Preview · what they'll see</SecLabel>
      <div style={{
        background: "#fafafa", color: "#111", borderRadius: 9, padding: 22,
        border: `1px solid ${BB.border2}`, fontFamily: FONT_SANS,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16,
          borderBottom: "1px solid #ddd", paddingBottom: 12 }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 16, fontWeight: 800 }}>
            SITE<span style={{ color: "#E0931C" }}>OPS</span> <span style={{ color: "#888", fontSize: 10, letterSpacing: 1 }}>VERIFY</span>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#E0F8E5", color: "#1a7a2f", padding: "4px 10px",
            borderRadius: 12, fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#1a7a2f" }} />
            VERIFIED · CHAIN INTACT
          </span>
        </div>

        <div style={{ fontSize: 11, color: "#666", letterSpacing: 1, marginBottom: 4 }}>EVIDENCE ENTRY {e.id}</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{TYPES[e.type].label}</div>
        <div style={{ fontSize: 13, color: "#333", marginBottom: 14, lineHeight: 1.55 }}>{summarize(e)}</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11, marginBottom: 14 }}>
          <PvKV k="Recorded"  v={e.t} />
          <PvKV k="Sealed at" v={e.sealed} />
          <PvKV k="Site"      v={SITES.find(s => s.id === e.site).name} />
          <PvKV k="GPS"       v={`${GEO[e.site].lat.toFixed(5)}, ${GEO[e.site].lng.toFixed(5)}`} />
          <PvKV k="Signed by" v={e.by} />
          <PvKV k="Witnesses" v={e.witnesses?.length || 0} />
        </div>

        <div style={{ background: "#f0f0f0", padding: 10, borderRadius: 6, fontFamily: "monospace",
          fontSize: 10, color: "#444", marginBottom: 12 }}>
          <div style={{ marginBottom: 4 }}><b>Prev:</b> {e.prevHash}</div>
          <div><b>Hash:</b> {e.hash}</div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => toast(`✓ Hash recomputed locally · chain intact`)} style={{ flex: 1, padding: "10px", background: "#111", color: "#fff", border: "none",
            borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Re-verify locally</button>
          <button onClick={() => toast(`✓ Signed PDF · ${e.id}.pdf downloaded`)} style={{ flex: 1, padding: "10px", background: "#fff", color: "#111", border: "1px solid #ccc",
            borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Download signed PDF</button>
        </div>

        <div style={{ fontSize: 10, color: "#888", marginTop: 14, textAlign: "center" }}>
          This URL is shareable. The entry cannot be altered without invalidating the chain. SiteOps v4.2 · FirstCivil
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={onClose} style={btnSecV}>Close</button>
        <button onClick={() => { toast(`✓ Shareable link generated · ${url}`); onClose(); }} style={{ ...btnPriV, background: BB.cyan }}>Generate share link</button>
      </div>
    </ModalShell>
  );
}

function PvKV({ k, v }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#222" }}>{v}</div>
    </div>
  );
}

// ── TAMPER DEMO MODAL ───────────────────────────────────────────
function TamperDemoModal({ chain, onClose }) {
  const [tampered, setTampered] = useState(false);
  const target = chain.find(e => e.type === "defect") || chain[5];
  return (
    <ModalShell onClose={onClose} title="🧪 Tamper attempt — demo" width={580}>
      <div style={{ fontSize: 12, color: BB.muted, marginBottom: 16, lineHeight: 1.6 }}>
        Demonstrate how a forensic recomputation surfaces silently-edited entries. Press the button to "edit"
        the defect description in entry <Mono style={{ color: BB.text2 }}>{target?.id}</Mono> — the chain immediately diverges.
      </div>

      <Card style={{ marginBottom: 12, borderColor: tampered ? BB.red + "55" : BB.border }}>
        <SecLabel style={{ marginBottom: 8, color: tampered ? BB.red : BB.muted }}>Target entry · {target?.id}</SecLabel>
        <KV k="Original description" v={target?.payload?.description} />
        {tampered && <KV k="Attempted edit" v={`${target?.payload?.description?.slice(0, 20)}… [redacted]`} />}
        <div style={{ marginTop: 10, padding: 10, background: BB.bg, borderRadius: 6 }}>
          <KV k="Hash on record" v={target?.hash} />
          {tampered && (
            <>
              <KV k="Recomputed hash" v={pseudoHash("tampered" + target?.id)} />
              <div style={{ marginTop: 8, padding: 8, background: BB.red + "12", border: `1px solid ${BB.red}44`,
                borderRadius: 5, fontSize: 11, color: BB.red, fontWeight: 600 }}>
                ⚠ CHAIN BREAK · hashes diverge · forensic export will flag this entry and every entry downstream (
                {chain.filter(e => e.idx > target.idx).length} affected).
              </div>
            </>
          )}
        </div>
      </Card>

      {tampered && (
        <Card style={{ marginBottom: 14, borderColor: BB.red + "55", background: BB.red + "08" }}>
          <SecLabel style={{ marginBottom: 8, color: BB.red }}>Forensic report</SecLabel>
          <div style={{ fontSize: 12, color: BB.text2, lineHeight: 1.6 }}>
            SiteOps detected an unauthorised modification at <Mono style={{ color: BB.text }}>{target?.t}</Mono>.
            The witness signatures from <Mono style={{ color: BB.text }}>{target?.witnesses?.join(", ")}</Mono> remain
            valid for the original payload, proving the edit happened after sealing. Court-admissible.
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onClose} style={btnSecV}>Close</button>
        <button onClick={() => setTampered(t => !t)} style={{
          ...btnPriV, background: tampered ? BB.green : BB.red, color: tampered ? "#000" : "#fff"
        }}>
          {tampered ? "✓ Restore original" : "🧪 Attempt edit"}
        </button>
      </div>
    </ModalShell>
  );
}

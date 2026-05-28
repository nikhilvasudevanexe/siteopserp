// ENTRY DETAIL DRAWER — bottom-sheet detail used by Field & Foreman.
import { BB } from "../theme.js";
import { TYPES, SITES, SITE_COLOR, GEO, hhmm, shortHash } from "../data.js";
import { Mono, Chip, HashChip, SecLabel, Card, StripedPlaceholder, KV } from "../components/atoms.jsx";
import { toast } from "../components/Toast.jsx";

export function EntryDetailDrawer({ entry, chain, onClose, onCorroborate }) {
  if (!entry) return null;
  const t = TYPES[entry.type];
  const prev = chain.find(e => e.hash === entry.prevHash);
  const next = chain.find(e => e.prevHash === entry.hash);
  const site = SITES.find(s => s.id === entry.site);
  const p = entry.payload || {};

  return (
    <div onClick={onClose} style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end", zIndex: 110,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BB.bg, borderRadius: "18px 18px 0 0",
        width: "100%", maxHeight: "92%", overflowY: "auto",
        padding: 18, animation: "slide-up .3s ease-out",
        border: `1px solid ${BB.border2}`, borderBottom: "none",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BB.dim, margin: "0 auto 14px" }} />

        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 8, background: t.color + "1c",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            border: `1px solid ${t.color}40`,
          }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{t.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
              <Chip color={SITE_COLOR[entry.site]} dot>{site.name}</Chip>
              <Mono style={{ fontSize: 10, color: BB.muted }}>{hhmm(entry.t)}</Mono>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: BB.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>

        {/* media */}
        {p.placeholder && <StripedPlaceholder label={p.placeholder} color={t.color} h={180} style={{ marginBottom: 12 }} />}

        {/* payload card */}
        <Card style={{ marginBottom: 12 }}>
          <SecLabel style={{ marginBottom: 8 }}>Payload</SecLabel>
          {Object.entries(p).filter(([k]) => !["placeholder","transcript"].includes(k)).map(([k, v]) => (
            <KV key={k} k={k.replace(/([A-Z])/g, " $1")} v={Array.isArray(v) ? v.join(", ") : String(v)} />
          ))}
          {p.transcript && (
            <div style={{ marginTop: 10, padding: 10, background: BB.bg, borderRadius: 6,
              fontSize: 13, lineHeight: 1.55, color: BB.text }}>
              "{p.transcript}"
            </div>
          )}
        </Card>

        {/* chain proof */}
        <Card style={{ marginBottom: 12, borderColor: BB.green + "33" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <SecLabel color={BB.green}>Chain Proof</SecLabel>
            <HashChip hash={entry.hash} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <KV k="Entry ID"  v={entry.id} />
            <KV k="Recorded"  v={entry.t} />
            <KV k="Sealed at" v={entry.sealed} />
            <KV k="Signed by" v={`${entry.by} (${entry.device})`} />
            <KV k="Location"  v={`${GEO[entry.site].lat.toFixed(5)}, ${GEO[entry.site].lng.toFixed(5)} ±3m`} />
            <KV k="Prev hash" v={entry.prevHash} />
            <KV k="This hash" v={entry.hash} />
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, marginTop: 10,
            padding: 9, background: BB.bg, borderRadius: 6, fontSize: 10, color: BB.muted,
          }}>
            <span style={{ color: BB.green }}>✓</span>
            <Mono>chain verified · prev{prev ? ` (${shortHash(prev.hash)})` : ""}{next ? ` → next (${shortHash(next.hash)})` : ""}</Mono>
          </div>
        </Card>

        {/* witnesses */}
        {entry.witnesses?.length > 0 && (
          <Card style={{ marginBottom: 12 }}>
            <SecLabel style={{ marginBottom: 8 }}>Witnesses · co-signed</SecLabel>
            {entry.witnesses.map(w => (
              <div key={w} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 0",
                borderBottom: `1px dashed ${BB.border}`,
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: BB.blue + "22", color: BB.blue,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                }}>{w.split(" ").map(n => n[0]).join("")}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{w}</div>
                  <Mono style={{ fontSize: 9, color: BB.muted }}>auto-witness · BT proximity within 30m</Mono>
                </div>
                <Chip color={BB.green} dot>SIGNED</Chip>
              </div>
            ))}
          </Card>
        )}

        {/* actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCorroborate} style={{
            flex: 1, padding: "13px", borderRadius: 8,
            background: BB.blue + "1c", color: BB.blue,
            border: `1px solid ${BB.blue}44`, fontWeight: 700, fontSize: 13,
          }}>+ Corroborate</button>
          <button onClick={() => toast(`✓ Link copied · verify.siteops.app/e/${entry.hash.slice(0,16)}`)} style={{
            flex: 1, padding: "13px", borderRadius: 8,
            background: BB.card2, color: BB.text2,
            border: `1px solid ${BB.border2}`, fontWeight: 600, fontSize: 13,
          }}>Share Link</button>
        </div>
      </div>
    </div>
  );
}

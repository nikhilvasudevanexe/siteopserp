// Compact entry row used in the Field HUD recent list and Foreman feed.
import { BB } from "../theme.js";
import { TYPES, SITES, SITE_COLOR, hhmm, summarize } from "../data.js";
import { Mono, Chip, HashChip } from "./atoms.jsx";

export function EntryRow({ entry, onClick, dense, showSite, accent }) {
  const t = TYPES[entry.type] || { label: entry.type, icon: "·", color: BB.muted };
  const site = SITES.find(s => s.id === entry.site);
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: dense ? "8px 10px" : "11px 12px",
      borderRadius: 8, background: BB.card, border: `1px solid ${BB.border}`,
      borderLeft: `3px solid ${accent || t.color}`,
      cursor: onClick ? "pointer" : "default", marginBottom: 6,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, background: t.color + "1c",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0,
      }}>{t.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <Mono style={{ fontSize: 10, color: BB.muted }}>{hhmm(entry.t)}</Mono>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.color }}>{t.label}</span>
          {showSite && site && <Chip color={SITE_COLOR[site.id]} style={{ padding: "1px 6px", fontSize: 9 }}>{site.name}</Chip>}
        </div>
        <div style={{ fontSize: 12, color: BB.text2, lineHeight: 1.4, overflow: "hidden",
          display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2 }}>
          {summarize(entry)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
          <HashChip hash={entry.hash} />
          <Mono style={{ fontSize: 9, color: BB.muted }}>by {entry.by.split(" ")[0]}</Mono>
          {entry.witnesses?.length > 0 && (
            <Mono style={{ fontSize: 9, color: BB.muted }}>+{entry.witnesses.length} witness{entry.witnesses.length > 1 ? "es" : ""}</Mono>
          )}
        </div>
      </div>
    </div>
  );
}

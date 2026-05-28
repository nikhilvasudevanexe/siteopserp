// FOREMAN LIVE FEED — phone view across all sites, newest first.
import { useState } from "react";
import { BB } from "../theme.js";
import { SITES, SITE_COLOR } from "../data.js";
import { Mono, SecLabel, ChipBtn } from "../components/atoms.jsx";
import { EntryRow } from "../components/EntryRow.jsx";

export function ForemanFeed({ chain, onOpenVault, onSelect }) {
  const [filter, setFilter] = useState("all");
  const [siteFilter, setSiteFilter] = useState(null);

  const filtered = chain
    .slice()
    .reverse()
    .filter(e => {
      if (siteFilter && e.site !== siteFilter) return false;
      if (filter === "all") return true;
      if (filter === "ops") return ["defect","incident","near_miss","fuel","truck"].includes(e.type);
      if (filter === "compliance") return ["swms","toolbox","induction","visitor","delivery"].includes(e.type);
      if (filter === "capture") return ["photo","voice","pm_call","variation"].includes(e.type);
      if (filter === "critical") return e.payload?.severity === "Critical" || e.type === "incident";
      return true;
    });

  const counts = {
    all: chain.length,
    critical: chain.filter(e => e.payload?.severity === "Critical" || e.type === "incident").length,
    ops: chain.filter(e => ["defect","incident","near_miss","fuel","truck"].includes(e.type)).length,
    capture: chain.filter(e => ["photo","voice","pm_call","variation"].includes(e.type)).length,
    compliance: chain.filter(e => ["swms","toolbox","induction","visitor","delivery"].includes(e.type)).length,
  };

  return (
    <div style={{ padding: "0 14px 30px" }}>
      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 0 14px",
        borderBottom: `1px solid ${BB.border}`, marginBottom: 12,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: BB.green + "14", border: `1px solid ${BB.green}40`,
          padding: "5px 9px", borderRadius: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: BB.green, boxShadow: `0 0 5px ${BB.green}` }} />
          <Mono style={{ fontSize: 10, fontWeight: 800, color: BB.green, letterSpacing: 1.2 }}>CHAIN OK</Mono>
        </div>
        <div style={{ flex: 1 }}>
          <Mono style={{ fontSize: 10, color: BB.muted, letterSpacing: 1 }}>LIVE FEED · {chain.length} ENTRIES</Mono>
          <div style={{ fontSize: 14, fontWeight: 700 }}>All 6 Sites · Today</div>
        </div>
        <button onClick={onOpenVault} style={{
          background: BB.card2, color: BB.orange, border: `1px solid ${BB.orange}33`,
          padding: "7px 11px", borderRadius: 6, fontSize: 11, fontWeight: 700,
        }}>Vault →</button>
      </div>

      {/* KPI strip */}
      <div className="scroll-x" style={{ marginBottom: 12, paddingBottom: 4 }}>
        {[
          { k: "Entries",    v: chain.length, c: BB.text },
          { k: "Sites Live", v: "6/6", c: BB.green },
          { k: "Critical",   v: counts.critical, c: counts.critical > 0 ? BB.red : BB.green },
          { k: "Defects",    v: chain.filter(e => e.type === "defect").length, c: BB.orange },
          { k: "Photos",     v: chain.filter(e => e.type === "photo").length, c: BB.orange },
          { k: "Voice",      v: chain.filter(e => e.type === "voice" || e.type === "pm_call").length, c: BB.cyan },
          { k: "Variations", v: chain.filter(e => e.type === "variation").length, c: BB.yellow },
        ].map(kpi => (
          <div key={kpi.k} style={{
            flexShrink: 0, background: BB.card, border: `1px solid ${BB.border}`,
            borderRadius: 7, padding: "8px 12px", minWidth: 70, textAlign: "center",
          }}>
            <Mono style={{ fontSize: 16, fontWeight: 700, color: kpi.c, display: "block" }}>{kpi.v}</Mono>
            <Mono style={{ fontSize: 8.5, color: BB.muted, letterSpacing: 1 }}>{kpi.k}</Mono>
          </div>
        ))}
      </div>

      {/* site filter */}
      <div className="scroll-x" style={{ marginBottom: 10, paddingBottom: 4 }}>
        <ChipBtn active={!siteFilter} onClick={() => setSiteFilter(null)} color={BB.text2}>All sites</ChipBtn>
        {SITES.map(s => (
          <ChipBtn key={s.id} active={siteFilter === s.id} onClick={() => setSiteFilter(siteFilter === s.id ? null : s.id)} color={SITE_COLOR[s.id]}>
            {s.name} · {chain.filter(e => e.site === s.id).length}
          </ChipBtn>
        ))}
      </div>

      {/* type filter */}
      <div className="scroll-x" style={{ marginBottom: 14, paddingBottom: 4 }}>
        {[
          { id: "all",        label: "All", col: BB.text2 },
          { id: "critical",   label: `Critical (${counts.critical})`, col: BB.red },
          { id: "ops",        label: `Ops (${counts.ops})`, col: BB.orange },
          { id: "capture",    label: `Capture (${counts.capture})`, col: BB.cyan },
          { id: "compliance", label: `Compliance (${counts.compliance})`, col: BB.green },
        ].map(f => (
          <ChipBtn key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} color={f.col}>
            {f.label}
          </ChipBtn>
        ))}
      </div>

      {/* feed */}
      <SecLabel style={{ marginBottom: 8 }}>Newest first</SecLabel>
      {filtered.map(e => <EntryRow key={e.id} entry={e} onClick={() => onSelect(e)} showSite />)}
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 30, color: BB.muted, fontSize: 13 }}>
          No entries match this filter.
        </div>
      )}
    </div>
  );
}

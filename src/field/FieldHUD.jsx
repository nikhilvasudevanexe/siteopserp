// REC HUD — main field screen: always-on recorder, auto-context, capture grid.
import { BB } from "../theme.js";
import { SITES, SITE_COLOR, GEO, EQUIP, CREW, ME, CHAIN, hhmm } from "../data.js";
import { Mono, SecLabel, RecDot, HashChip, Chip } from "../components/atoms.jsx";
import { EntryRow } from "../components/EntryRow.jsx";
import { useShiftTimer } from "./helpers.jsx";

export function FieldHUD({ site, machine, onChangeMachine, onAction, recent, onTapEntry }) {
  const openEntry = CHAIN.find(e => e.site === site && e.type === "shift_open");
  const elapsed = useShiftTimer(openEntry?.t || new Date().toISOString());
  const siteObj = SITES.find(s => s.id === site);
  const nearby = CREW.filter(c => c.site === site && c.name !== ME.name).slice(0, 3);

  return (
    <div style={{ padding: "0 14px 24px", color: BB.text }}>
      {/* Top bar — RECORDING badge + shift timer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "8px 0 14px",
        borderBottom: `1px solid ${BB.border}`, marginBottom: 14,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 7,
          background: BB.rec + "14", border: `1px solid ${BB.rec}40`,
          padding: "5px 9px", borderRadius: 5,
        }}>
          <RecDot />
          <Mono style={{ fontSize: 10, fontWeight: 800, color: BB.rec, letterSpacing: 1.2 }}>REC</Mono>
        </div>
        <div style={{ flex: 1 }}>
          <Mono style={{ fontSize: 10, color: BB.muted, letterSpacing: 1 }}>SHIFT · {hhmm(openEntry?.t)}</Mono>
          <Mono style={{ fontSize: 17, fontWeight: 700, color: BB.text, letterSpacing: 1, display: "block" }}>{elapsed}</Mono>
        </div>
        <HashChip hash={CHAIN[CHAIN.length - 1].hash} label="LIVE" color={BB.green} />
      </div>

      {/* CONTEXT — auto-attached to every capture */}
      <SecLabel style={{ marginBottom: 6 }}>Auto-Context</SecLabel>
      <div style={{
        background: BB.card, border: `1px solid ${BB.border}`, borderRadius: 10,
        padding: 12, marginBottom: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, background: SITE_COLOR[site] + "1c",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            border: `1px solid ${SITE_COLOR[site]}30`,
          }}>📍</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{siteObj?.name}</div>
            <Mono style={{ fontSize: 10, color: BB.muted }}>
              {GEO[site].lat.toFixed(4)}, {GEO[site].lng.toFixed(4)} · {GEO[site].zone}
            </Mono>
          </div>
          <Chip color={BB.green} dot>GEOFENCED</Chip>
        </div>

        <div onClick={onChangeMachine} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
          background: machine ? BB.purple + "0c" : BB.card2, borderRadius: 7,
          border: `1px dashed ${machine ? BB.purple + "44" : BB.border2}`,
          cursor: "pointer",
        }}>
          <div style={{ fontSize: 18 }}>📡</div>
          <div style={{ flex: 1 }}>
            {machine ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{machine}</div>
                <Mono style={{ fontSize: 10, color: BB.muted }}>
                  Paired via NFC · {EQUIP.find(e => e.id === machine)?.type}
                </Mono>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: BB.text2 }}>Tap a machine to pair</div>
                <Mono style={{ fontSize: 10, color: BB.muted }}>Hold phone to the NFC tag</Mono>
              </>
            )}
          </div>
          <span style={{ color: BB.muted }}>›</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
          <Mono style={{ fontSize: 9, color: BB.muted, letterSpacing: 1 }}>CREW NEARBY</Mono>
          <div style={{ display: "flex", gap: 4 }}>
            {nearby.map(c => (
              <div key={c.name} style={{
                width: 22, height: 22, borderRadius: "50%",
                background: BB.blue + "22", color: BB.blue,
                fontSize: 9, fontWeight: 700, display: "flex",
                alignItems: "center", justifyContent: "center",
                border: `1px solid ${BB.blue}40`,
              }}>{c.name.split(" ").map(n => n[0]).join("")}</div>
            ))}
          </div>
          <Mono style={{ fontSize: 9, color: BB.muted }}>+{nearby.length} auto-witness</Mono>
        </div>
      </div>

      {/* CAPTURE GRID — big tap targets */}
      <SecLabel style={{ marginBottom: 8 }}>One-Tap Capture</SecLabel>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        {[
          { id: "photo",    icon: "📷", label: "Photo",      col: BB.orange, hint: "Auto-tagged" },
          { id: "voice",    icon: "🎤", label: "Voice Memo", col: BB.rec,    hint: "Hold to talk" },
          { id: "incident", icon: "⚠",  label: "Incident",   col: BB.red,    hint: "3-tap report" },
          { id: "defect",   icon: "🔧", label: "Defect",     col: BB.yellow, hint: "Tag a machine" },
          { id: "truck",    icon: "🚛", label: "Truck",      col: BB.teal,   hint: "In / Out" },
          { id: "visitor",  icon: "🚶", label: "Visitor",    col: BB.cyan,   hint: "Scan ID" },
        ].map(a => (
          <button key={a.id} onClick={() => onAction(a.id)} style={{
            background: BB.card, border: `1px solid ${a.col}33`,
            borderRadius: 10, padding: "14px 12px", color: BB.text,
            textAlign: "left", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -18, right: -18, fontSize: 70, opacity: 0.07 }}>{a.icon}</div>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{a.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{a.label}</div>
            <Mono style={{ fontSize: 9.5, color: a.col, letterSpacing: 0.5 }}>{a.hint}</Mono>
          </button>
        ))}
      </div>

      {/* SECONDARY — SWMS, toolbox, variation */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 16 }}>
        {[
          { id: "swms",      label: "SWMS",      icon: "✓",  col: BB.green },
          { id: "toolbox",   label: "Toolbox",   icon: "👥", col: BB.blue },
          { id: "variation", label: "Variation", icon: "📋", col: BB.yellow },
        ].map(a => (
          <button key={a.id} onClick={() => onAction(a.id)} style={{
            background: BB.card2, border: `1px solid ${BB.border2}`, color: BB.text2,
            padding: "10px 6px", borderRadius: 7, fontSize: 11, fontWeight: 600,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 14 }}>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>

      {/* RECENT ENTRIES — live chain */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <SecLabel>Today's Chain · This Site</SecLabel>
        <Mono style={{ fontSize: 9, color: BB.muted }}>{recent.length} sealed</Mono>
      </div>
      {recent.slice(0, 6).map(e => <EntryRow key={e.id} entry={e} dense onClick={onTapEntry ? () => onTapEntry(e) : undefined} />)}
    </div>
  );
}

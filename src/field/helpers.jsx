// Field helpers shared by the HUD and capture sheets.
import { useState, useEffect } from "react";
import { BB } from "../theme.js";
import { SITES } from "../data.js";
import { Chip } from "../components/atoms.jsx";

// Live shift timer counting up from the shift_open time.
export function useShiftTimer(openIso) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const ms = Math.max(0, now - new Date(openIso).getTime());
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// Live waveform (random bars, just for vibe).
export const Waveform = ({ active, color = BB.rec, bars = 24 }) => {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const i = setInterval(() => setTick(t => t + 1), 110);
    return () => clearInterval(i);
  }, [active]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 40 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const seed = (Math.sin((i + tick) * 1.3) + Math.cos((i + tick) * 0.7) + 2) / 4;
        const h = active ? Math.max(4, seed * 38) : 4;
        return (
          <div key={i} style={{
            width: 3, height: h, borderRadius: 2,
            background: active ? color : BB.dim,
            transition: "height .15s ease",
          }} />
        );
      })}
    </div>
  );
};

// Capture context: who/where/when/machine auto-attached to every entry.
export const CaptureCtx = ({ site, machine, who, t }) => (
  <div style={{
    display: "flex", flexWrap: "wrap", gap: 5,
    padding: 8, background: BB.bg2, border: `1px solid ${BB.border}`,
    borderRadius: 7, marginBottom: 12,
  }}>
    <Chip color={BB.cyan} dot>📍 {SITES.find(s => s.id === site)?.name}</Chip>
    {machine && <Chip color={BB.purple} dot>📡 {machine}</Chip>}
    <Chip color={BB.blue} dot>👤 {who}</Chip>
    <Chip color={BB.muted} mono>{t}</Chip>
  </div>
);

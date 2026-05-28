// ════════════════════════════════════════════════════════════════
// ATOMS — shared visual primitives + sheet/modal shells + styles
// ════════════════════════════════════════════════════════════════
import { BB, FONT_MONO, FONT_SANS } from "../theme.js";

export const Mono = ({ children, style }) => (
  <span style={{ fontFamily: FONT_MONO, ...style }}>{children}</span>
);

export const Chip = ({ color = BB.muted, children, style, dot, mono }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    background: color + "1c", color, border: `1px solid ${color}3a`,
    padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
    letterSpacing: 0.4, textTransform: "uppercase",
    fontFamily: mono ? FONT_MONO : FONT_SANS,
    whiteSpace: "nowrap", ...style,
  }}>
    {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />}
    {children}
  </span>
);

export const HashChip = ({ hash, color = BB.green, label = "SEALED", style }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    background: color + "14", color, border: `1px solid ${color}33`,
    padding: "3px 7px", borderRadius: 4, fontFamily: FONT_MONO,
    fontSize: 9.5, fontWeight: 700, ...style,
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%", background: color,
      boxShadow: `0 0 5px ${color}`,
    }} />
    <span style={{ letterSpacing: 0.6 }}>{label}</span>
    <span style={{ opacity: 0.65, letterSpacing: 0.4 }}>{hash.slice(0, 6)}</span>
  </span>
);

export const RecDot = ({ style, size = 8 }) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%",
    background: BB.rec, boxShadow: `0 0 8px ${BB.rec}, 0 0 0 0 ${BB.rec}80`,
    animation: "rec-pulse 1.2s ease-in-out infinite", ...style }} />
);

export const SecLabel = ({ children, color = BB.muted, style }) => (
  <div style={{ fontFamily: FONT_MONO, fontSize: 9, fontWeight: 700, letterSpacing: 2,
    color, textTransform: "uppercase", ...style }}>{children}</div>
);

export const Card = ({ children, accent, style, onClick }) => (
  <div onClick={onClick} style={{
    background: BB.card, border: `1px solid ${BB.border}`, borderRadius: 10,
    padding: 14, cursor: onClick ? "pointer" : "default",
    borderLeft: accent ? `3px solid ${accent}` : `1px solid ${BB.border}`,
    ...style,
  }}>{children}</div>
);

export const StripedPlaceholder = ({ label, color = BB.orange, h = 140, style }) => (
  <div style={{
    height: h, borderRadius: 8, overflow: "hidden", position: "relative",
    background: `repeating-linear-gradient(45deg, ${BB.card2}, ${BB.card2} 8px, ${BB.card3} 8px, ${BB.card3} 16px)`,
    border: `1px solid ${BB.border2}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    ...style,
  }}>
    <span style={{
      fontFamily: FONT_MONO, fontSize: 10, color, letterSpacing: 2,
      textTransform: "uppercase", background: BB.bg, padding: "4px 10px",
      borderRadius: 4, border: `1px solid ${color}33`,
    }}>{label}</span>
  </div>
);

export function KV({ k, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, fontSize: 11 }}>
      <Mono style={{ color: BB.muted, letterSpacing: 0.5 }}>{k}</Mono>
      <Mono style={{ color: BB.text2, textAlign: "right", flex: 1, wordBreak: "break-all" }}>{v}</Mono>
    </div>
  );
}

export function ChipBtn({ active, onClick, color = BB.orange, children }) {
  return (
    <span onClick={onClick} style={{
      padding: "7px 11px", borderRadius: 16, fontSize: 12, fontWeight: 600,
      background: active ? color : BB.card2,
      color: active ? "#000" : BB.muted,
      border: `1px solid ${active ? color : BB.border2}`,
      whiteSpace: "nowrap", cursor: "pointer",
    }}>{children}</span>
  );
}

export function Stepper({ steps, current }) {
  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: 3, borderRadius: 2,
            background: i <= current ? BB.orange : BB.border2, marginBottom: 5 }} />
          <Mono style={{ fontSize: 9, color: i === current ? BB.orange : BB.muted, letterSpacing: 1 }}>{s}</Mono>
        </div>
      ))}
    </div>
  );
}

// Bottom sheet container (phone surfaces)
export function Sheet({ title, subtitle, onClose, children }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "flex-end",
      zIndex: 90,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BB.bg, borderRadius: "18px 18px 0 0",
        width: "100%", maxHeight: "90%", overflowY: "auto",
        padding: 18, animation: "slide-up .3s ease-out",
        border: `1px solid ${BB.border2}`, borderBottom: "none",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BB.dim, margin: "0 auto 14px" }} />
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 11, color: BB.muted, marginTop: 2 }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: BB.muted, fontSize: 22, cursor: "pointer",
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Centered modal (desktop vault)
export function ModalShell({ title, children, onClose, width = 520 }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BB.bg, borderRadius: 12, padding: 22,
        width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto",
        border: `1px solid ${BB.border2}`,
        animation: "slide-up .25s ease-out",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: BB.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── shared inline styles ────────────────────────────────────────
export const inputCss = {
  width: "100%", padding: "12px 14px", background: BB.card2, color: BB.text,
  border: `1px solid ${BB.border2}`, borderRadius: 8, fontSize: 14,
  fontFamily: FONT_SANS, outline: "none", resize: "vertical", minHeight: 80,
};
export const btnPri = {
  flex: 1, padding: "14px", borderRadius: 8, background: BB.orange, color: "#000",
  border: "none", fontWeight: 700, fontSize: 14,
};
export const btnSec = {
  flex: 1, padding: "14px", borderRadius: 8, background: BB.card2, color: BB.text2,
  border: `1px solid ${BB.border2}`, fontWeight: 600, fontSize: 14,
};
export const btnPriV = {
  flex: 1, padding: "12px", borderRadius: 7, background: BB.orange, color: "#000",
  border: "none", fontWeight: 700, fontSize: 13,
};
export const btnSecV = {
  flex: 1, padding: "12px", borderRadius: 7, background: BB.card2, color: BB.text2,
  border: `1px solid ${BB.border2}`, fontWeight: 600, fontSize: 13,
};

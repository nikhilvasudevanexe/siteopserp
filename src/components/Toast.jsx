// Global toast: toast("✓ Done") shows a transient message. Multiple stack.
import { useState, useEffect } from "react";
import { BB, FONT_SANS } from "../theme.js";

export function toast(msg, kind = "ok") {
  window.dispatchEvent(new CustomEvent("siteops-toast", { detail: { msg, kind } }));
}

export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.detail) return;
      const id = Math.random().toString(36).slice(2);
      const t = { id, msg: e.detail.msg, kind: e.detail.kind || "ok" };
      setItems(prev => [...prev, t]);
      setTimeout(() => setItems(prev => prev.filter(x => x.id !== id)), 2400);
    };
    window.addEventListener("siteops-toast", onMsg);
    return () => window.removeEventListener("siteops-toast", onMsg);
  }, []);
  const bg = (k) => k === "err" ? BB.red : k === "info" ? BB.cyan : BB.green;
  return (
    <div style={{
      position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, display: "flex", flexDirection: "column", gap: 8,
      pointerEvents: "none",
    }}>
      {items.map(t => (
        <div key={t.id} style={{
          background: BB.card3, color: BB.text,
          border: `1px solid ${bg(t.kind)}66`,
          borderLeft: `3px solid ${bg(t.kind)}`,
          borderRadius: 7, padding: "10px 14px",
          fontSize: 12.5, fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
          animation: "slide-up .25s ease-out", maxWidth: 460,
          fontFamily: FONT_SANS,
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

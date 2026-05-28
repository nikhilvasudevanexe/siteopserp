// ════════════════════════════════════════════════════════════════
// THEME — palette, fonts, global CSS (keyframes + scrollbars)
// ════════════════════════════════════════════════════════════════

export const BB = {
  bg: "#070707",
  bg2: "#0c0c0c",
  card: "#111111",
  card2: "#181818",
  card3: "#1f1f1f",
  border: "#222",
  border2: "#2a2a2a",
  border3: "#383838",
  text: "#F0F0F0",
  text2: "#c8c8c8",
  muted: "#6a6a6a",
  dim: "#3a3a3a",
  orange: "#F5A623",
  red: "#E94560",
  rec: "#FF3344",
  green: "#3BD17F",
  blue: "#3B82F6",
  cyan: "#22D3EE",
  purple: "#A855F7",
  yellow: "#FACC15",
  teal: "#14B8A6",
};

export const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace";
export const FONT_SANS = "'Inter', -apple-system, system-ui, sans-serif";

export const BB_CSS = `
  *{box-sizing:border-box;}
  body{margin:0;background:${BB.bg};color:${BB.text};font-family:${FONT_SANS};-webkit-font-smoothing:antialiased;}
  input,textarea,select{font-family:${FONT_SANS};}
  button{font-family:${FONT_SANS};cursor:pointer;}
  ::-webkit-scrollbar{width:8px;height:8px;}
  ::-webkit-scrollbar-track{background:${BB.bg2};}
  ::-webkit-scrollbar-thumb{background:${BB.border3};border-radius:4px;}
  @keyframes rec-pulse {
    0%   { box-shadow: 0 0 8px ${BB.rec}, 0 0 0 0 ${BB.rec}80; }
    70%  { box-shadow: 0 0 8px ${BB.rec}, 0 0 0 10px ${BB.rec}00; }
    100% { box-shadow: 0 0 8px ${BB.rec}, 0 0 0 0 ${BB.rec}00; }
  }
  @keyframes wave-bar {
    0%, 100% { transform: scaleY(0.3); }
    50% { transform: scaleY(1); }
  }
  @keyframes slide-up { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
  @keyframes fade-in  { from { opacity:0; } to { opacity:1; } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  .slide-up { animation: slide-up .25s ease-out; }
  .fade-in  { animation: fade-in .35s ease-out; }
  .scroll-x { display:flex; overflow-x:auto; gap:8px; scrollbar-width:none; }
  .scroll-x::-webkit-scrollbar { display:none; }
`;

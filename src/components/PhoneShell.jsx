// Centers a phone surface inside the iOS device frame, with a side
// column carrying a back button and a short description of the view.
import { BB, FONT_SANS } from "../theme.js";
import { IOSDevice } from "./IOSDevice.jsx";
import { SecLabel } from "./atoms.jsx";

export function PhoneShell({ children, onBack, context, scale = 1 }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: 30, gap: 30, background: `radial-gradient(circle at 20% 30%, ${BB.orange}10, ${BB.bg} 50%)`,
      flexWrap: "wrap",
    }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "center" }}>
        <IOSDevice width={402} height={874} dark={true}>
          <div style={{
            background: BB.bg, minHeight: "100%", color: BB.text,
            paddingTop: 50, fontFamily: FONT_SANS, position: "relative", overflow: "hidden",
          }}>
            {children}
          </div>
        </IOSDevice>
      </div>

      <div style={{ maxWidth: 320, color: BB.muted, fontSize: 12, lineHeight: 1.6 }}>
        <button onClick={onBack} style={{
          background: BB.card2, color: BB.muted, border: `1px solid ${BB.border2}`,
          padding: "8px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
          marginBottom: 16, cursor: "pointer",
        }}>← All views</button>
        <SecLabel style={{ marginBottom: 8 }}>What you're looking at</SecLabel>
        <div>{context}</div>
      </div>
    </div>
  );
}

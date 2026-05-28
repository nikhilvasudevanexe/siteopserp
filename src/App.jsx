// ════════════════════════════════════════════════════════════════
// ROOT — intro cover + mode switcher (Field / Foreman / Vault) + tweaks
// ════════════════════════════════════════════════════════════════
import { BB } from "./theme.js";
import { CHAIN } from "./data.js";
import { Mono } from "./components/atoms.jsx";
import { ToastHost } from "./components/Toast.jsx";
import {
  useTweaks, TweaksPanel, TweakSection, TweakSelect, TweakColor,
  TweakRadio, TweakToggle, TweakSlider, TweakButton,
} from "./components/Tweaks.jsx";
import { FieldMode } from "./field/FieldMode.jsx";
import { ForemanMode } from "./foreman/ForemanMode.jsx";
import { EvidenceVault } from "./vault/EvidenceVault.jsx";

const TWEAK_DEFAULTS = {
  mode: "intro",
  accent: "#F5A623",
  chainBadge: "visible",
  recorderAlwaysOn: true,
  showWitnesses: true,
  phoneScale: 1,
};

function IntroCover({ onPick, accent }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 40, gap: 36,
      background: `radial-gradient(circle at 50% 0%, ${accent}10 0%, ${BB.bg} 60%)`,
    }}>
      <div style={{ textAlign: "center", maxWidth: 720 }}>
        <Mono style={{
          fontSize: 10, letterSpacing: 4, color: BB.muted, fontWeight: 700,
          display: "block", marginBottom: 12,
        }}>FIRST CIVIL CONSTRUCTION PTY LTD · SITEOPS v4.2</Mono>
        <div style={{
          fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 64, fontWeight: 800,
          letterSpacing: -2, lineHeight: 1, marginBottom: 14,
        }}>
          SITE<span style={{ color: accent }}>OPS</span>
        </div>
        <div style={{ fontSize: 18, color: BB.text2, lineHeight: 1.5, marginBottom: 8, fontWeight: 500 }}>
          The shift recorder for construction. Always on. Tamper-proof.
        </div>
        <div style={{ fontSize: 13, color: BB.muted, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
          Geofenced check-in, NFC machine pairing, push-to-talk voice memos with on-device transcription,
          one-tap photo with auto-attached metadata. Every entry sealed into a hash chain the moment it's
          recorded — provable in court, in a SafeWork inquiry, or six months later when memory fails.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: 920, width: "100%" }}>
        {[
          { id: "field",   icon: "🎙", t: "Field Recorder", s: "Operator · phone",
            desc: "Zero-typing capture HUD. Hold to talk, tap to shoot, NFC to pair a machine. Auto geofence + auto witnesses.", col: BB.orange },
          { id: "foreman", icon: "👁", t: "Foreman Live Feed", s: "Foreman · phone",
            desc: "Every entry from every site, newest first. Filter by site/type. Corroborate with one tap.", col: BB.blue },
          { id: "vault",   icon: "⛓", t: "Evidence Vault", s: "PM · desktop",
            desc: "Full chain timeline, witness signatures, export PDF + JSON + media + offline verifier. Public verify URLs.", col: BB.green },
        ].map(m => (
          <div key={m.id} onClick={() => onPick(m.id)} style={{
            background: BB.card, border: `1px solid ${BB.border2}`,
            borderRadius: 12, padding: 22, cursor: "pointer",
            borderLeft: `3px solid ${m.col}`, transition: "transform .15s",
          }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize: 30, marginBottom: 10 }}>{m.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>{m.t}</div>
            <Mono style={{ fontSize: 10, color: m.col, letterSpacing: 1, marginBottom: 10, display: "block" }}>
              {m.s.toUpperCase()}
            </Mono>
            <div style={{ fontSize: 12, color: BB.muted, lineHeight: 1.6 }}>{m.desc}</div>
            <div style={{ marginTop: 14, fontSize: 11, color: m.col, fontWeight: 700 }}>Open →</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 18, flexWrap: "wrap", justifyContent: "center", marginTop: 12, maxWidth: 920 }}>
        {[
          { l: "6 active sites" },
          { l: `${CHAIN.length} sealed today` },
          { l: "0 chain breaks · 99.97% uptime" },
          { l: "SHA-256 / Ed25519 · NSW Evidence Act compliant" },
        ].map(s => (
          <Mono key={s.l} style={{ fontSize: 10, color: BB.muted, letterSpacing: 1 }}>
            <span style={{ color: BB.green, marginRight: 6 }}>●</span>{s.l}
          </Mono>
        ))}
      </div>
    </div>
  );
}

export function App() {
  const [tweak, set] = useTweaks(TWEAK_DEFAULTS);
  const accent = tweak.accent || BB.orange;

  return (
    <>
      {tweak.mode === "intro"   && <IntroCover onPick={m => set("mode", m)} accent={accent} />}
      {tweak.mode === "field"   && <FieldMode onBack={() => set("mode", "intro")} scale={tweak.phoneScale} />}
      {tweak.mode === "foreman" && <ForemanMode onBack={() => set("mode", "intro")} scale={tweak.phoneScale} onOpenVault={() => set("mode", "vault")} />}
      {tweak.mode === "vault"   && (
        <EvidenceVault
          chain={CHAIN}
          onBackToField={() => set("mode", "intro")}
          backLabel="← Intro"
          accentColor={accent}
          chainVisibility={tweak.chainBadge}
        />
      )}

      <ToastHost />

      <TweaksPanel title="Tweaks · SiteOps">
        <TweakSection label="View">
          <TweakSelect
            label="Mode"
            value={tweak.mode}
            options={[
              { value: "intro",   label: "Intro" },
              { value: "field",   label: "Field recorder" },
              { value: "foreman", label: "Foreman feed" },
              { value: "vault",   label: "Evidence Vault" },
            ]}
            onChange={v => set("mode", v)}
          />
        </TweakSection>

        <TweakSection label="Accent">
          <TweakColor
            label="Color"
            value={tweak.accent}
            options={["#F5A623", "#FF3344", "#22D3EE", "#3BD17F", "#FACC15", "#A855F7"]}
            onChange={v => set("accent", v)}
          />
        </TweakSection>

        <TweakSection label="Chain badges">
          <TweakRadio
            label="Visibility"
            value={tweak.chainBadge}
            options={["hidden", "subtle", "visible"]}
            onChange={v => set("chainBadge", v)}
          />
        </TweakSection>

        <TweakSection label="Phone">
          <TweakSlider label="Scale" value={tweak.phoneScale} min={0.6} max={1.2} step={0.05} unit="×" onChange={v => set("phoneScale", v)} />
        </TweakSection>

        <TweakSection label="Recorder">
          <TweakToggle label="Always-on" value={tweak.recorderAlwaysOn} onChange={v => set("recorderAlwaysOn", v)} />
          <TweakToggle label="Auto witnesses" value={tweak.showWitnesses} onChange={v => set("showWitnesses", v)} />
        </TweakSection>

        <TweakSection label="Jump to">
          <TweakButton label="Evidence Vault →" onClick={() => set("mode", "vault")} />
          <TweakButton label="Field recorder →" onClick={() => set("mode", "field")} secondary />
          <TweakButton label="Foreman feed →" onClick={() => set("mode", "foreman")} secondary />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

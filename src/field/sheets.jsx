// ════════════════════════════════════════════════════════════════
// CAPTURE SHEETS — zero-typing capture flows + NFC pairing overlay
// ════════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { BB } from "../theme.js";
import { SITES, EQUIP, CREW, ME, GEO, CHAIN, pseudoHash, hhmm } from "../data.js";
import {
  Sheet, Card, SecLabel, StripedPlaceholder, KV, ChipBtn, Stepper, Mono, Chip,
  inputCss, btnPri, btnSec,
} from "../components/atoms.jsx";
import { Waveform, CaptureCtx } from "./helpers.jsx";

const witnessNames = (site) =>
  CREW.filter(c => c.site === site && c.name !== ME.name).slice(0, 2).map(c => c.name);

// ── VOICE ───────────────────────────────────────────────────────
export function VoiceSheet({ site, machine, onClose, onSubmit }) {
  const [recording, setRecording] = useState(false);
  const [secs, setSecs] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [stage, setStage] = useState("idle"); // idle | recording | transcribing | sealing | sealed

  useEffect(() => {
    if (!recording) return;
    const i = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [recording]);

  const fakeWords = [
    "OK", "OK so", "OK so Mahmoud", "OK so Mahmoud said", "OK so Mahmoud said move",
    "OK so Mahmoud said move two trucks", "OK so Mahmoud said move two trucks to Mortlake",
    "OK so Mahmoud said move two trucks to Mortlake after smoko", "OK so Mahmoud said move two trucks to Mortlake after smoko, and",
    "OK so Mahmoud said move two trucks to Mortlake after smoko, and Lakemba is", "OK so Mahmoud said move two trucks to Mortlake after smoko, and Lakemba is on hold",
  ];

  const startRec = () => { setRecording(true); setStage("recording"); setSecs(0); setTranscript(""); };
  const stopRec = () => {
    setRecording(false); setStage("transcribing");
    let i = 0;
    const tick = () => {
      if (i < fakeWords.length) { setTranscript(fakeWords[i]); i++; setTimeout(tick, 180); }
      else { setStage("sealing"); setTimeout(() => setStage("sealed"), 700); }
    };
    setTimeout(tick, 250);
  };

  const seal = () => {
    onSubmit({
      type: "voice",
      payload: { duration: `00:${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`,
        transcript, confidence: 0.94, machine },
    });
    onClose();
  };

  const mmss = `${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;

  return (
    <Sheet onClose={onClose} title="🎤 Voice Memo" subtitle="Hold to record · auto-transcribes · seals on stop">
      <CaptureCtx site={site} machine={machine} who={ME.name} t={hhmm(new Date().toISOString())} />

      <div style={{
        background: BB.card, border: `1px solid ${stage === "recording" ? BB.rec + "66" : BB.border}`,
        borderRadius: 12, padding: 20, textAlign: "center", marginBottom: 14,
      }}>
        <Waveform active={recording} color={BB.rec} />
        <Mono style={{ fontSize: 28, fontWeight: 700, color: recording ? BB.rec : BB.text,
          letterSpacing: 2, display: "block", marginTop: 12 }}>{mmss}</Mono>
        {stage === "idle"         && <div style={{ fontSize: 11, color: BB.muted, marginTop: 8 }}>Press &amp; hold the mic to start</div>}
        {stage === "recording"    && <div style={{ fontSize: 11, color: BB.rec, marginTop: 8, fontWeight: 600 }}>● RECORDING — release to stop</div>}
        {stage === "transcribing" && <div style={{ fontSize: 11, color: BB.cyan, marginTop: 8, fontWeight: 600 }}>⟳ Transcribing on-device…</div>}
        {stage === "sealing"      && <div style={{ fontSize: 11, color: BB.orange, marginTop: 8, fontWeight: 600 }}>⛓ Computing hash &amp; sealing…</div>}
        {stage === "sealed"       && <div style={{ fontSize: 11, color: BB.green, marginTop: 8, fontWeight: 600 }}>✓ Sealed in chain</div>}
      </div>

      {transcript && (
        <Card style={{ marginBottom: 14 }}>
          <SecLabel style={{ marginBottom: 8 }}>Transcript · auto · 94% confidence</SecLabel>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: BB.text }}>{transcript}<span style={{ animation: "fade-in 1s infinite" }}>{stage === "transcribing" ? "▌" : ""}</span></div>
        </Card>
      )}

      {stage === "sealed" && (
        <Card style={{ marginBottom: 14, borderColor: BB.green + "33", background: BB.green + "08" }}>
          <SecLabel style={{ marginBottom: 8, color: BB.green }}>Chain Receipt</SecLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <KV k="Entry ID"  v={`EVT-${10100 + Math.floor(Math.random()*900)}`} />
            <KV k="This hash" v={pseudoHash(transcript + secs).slice(0,32)+"…"} />
            <KV k="Prev hash" v={CHAIN[CHAIN.length-1].hash.slice(0,32)+"…"} />
            <KV k="Signed by" v={ME.device} />
            <KV k="Sealed at" v={new Date().toISOString()} />
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {stage !== "sealed" ? (
          <button
            onMouseDown={startRec} onTouchStart={startRec}
            onMouseUp={stopRec} onTouchEnd={stopRec}
            disabled={stage === "transcribing" || stage === "sealing"}
            style={{
              flex: 1, padding: "16px", borderRadius: 10,
              background: recording ? BB.rec : BB.card2,
              color: recording ? "#fff" : BB.text,
              border: `1px solid ${recording ? BB.rec : BB.border2}`,
              fontWeight: 700, fontSize: 15, transition: "all .15s",
            }}>
            {recording ? "● Release to Stop" : stage === "idle" ? "🎤 Hold to Record" : stage === "transcribing" ? "Transcribing…" : "Sealing…"}
          </button>
        ) : (
          <button onClick={seal} style={{
            flex: 1, padding: "16px", borderRadius: 10,
            background: BB.green, color: "#000", border: "none", fontWeight: 700, fontSize: 15,
          }}>✓ Done — Back to Recorder</button>
        )}
      </div>
    </Sheet>
  );
}

// ── PHOTO ───────────────────────────────────────────────────────
export function PhotoSheet({ site, machine, onClose, onSubmit }) {
  const [stage, setStage] = useState("viewfinder"); // viewfinder | captured | sealed
  const [caption, setCaption] = useState("");

  const capture = () => { setStage("captured"); setTimeout(() => setStage("sealed"), 900); };
  const seal = () => {
    onSubmit({ type: "photo", payload: { caption: caption || "Site photo", machine, placeholder: "captured-photo" } });
    onClose();
  };

  return (
    <Sheet onClose={onClose} title="📷 Photo" subtitle="Auto-tagged with location, machine, time, witnesses">
      <CaptureCtx site={site} machine={machine} who={ME.name} t={hhmm(new Date().toISOString())} />

      {stage === "viewfinder" && (
        <>
          <div style={{
            height: 320, borderRadius: 12, position: "relative", overflow: "hidden",
            background: "repeating-linear-gradient(0deg, #0a0a0a, #0a0a0a 3px, #0d0d0d 3px, #0d0d0d 6px)",
            border: `1px solid ${BB.border2}`, marginBottom: 14,
          }}>
            <div style={{ position: "absolute", inset: 24, border: `1px dashed ${BB.muted}40`, borderRadius: 4 }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 20, height: 20, transform: "translate(-50%, -50%)",
              border: `1px solid ${BB.orange}`, borderRadius: "50%" }} />
            <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
              <Chip color={BB.rec} dot>● LIVE</Chip>
              <Chip color={BB.cyan} mono>4032 × 3024</Chip>
            </div>
            <div style={{ position: "absolute", bottom: 10, left: 10, right: 10,
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Mono style={{ fontSize: 9, color: BB.cyan }}>📍 {GEO[site].lat.toFixed(4)}, {GEO[site].lng.toFixed(4)}</Mono>
              <Mono style={{ fontSize: 9, color: BB.cyan }}>{new Date().toISOString().slice(11,19)}Z</Mono>
            </div>
          </div>
          <button onClick={capture} style={{
            width: "100%", padding: "18px", borderRadius: 10,
            background: BB.orange, color: "#000", border: "none", fontWeight: 700, fontSize: 16,
          }}>📸 Capture</button>
        </>
      )}

      {(stage === "captured" || stage === "sealed") && (
        <>
          <StripedPlaceholder label="Photo · captured" h={220} color={BB.orange} style={{ marginBottom: 12 }} />
          <Card style={{ marginBottom: 12 }}>
            <SecLabel style={{ marginBottom: 8 }}>Auto-attached metadata</SecLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <KV k="EXIF time" v={new Date().toISOString()} />
              <KV k="GPS"       v={`${GEO[site].lat.toFixed(5)}, ${GEO[site].lng.toFixed(5)} ±3m`} />
              <KV k="Geofence"  v={`${SITES.find(s=>s.id===site).name} · ${GEO[site].zone}`} />
              <KV k="Machine"   v={machine || "—"} />
              <KV k="Witnesses" v={`${witnessNames(site).join(", ")} (auto, BT proximity)`} />
              <KV k="Device"    v={ME.device} />
            </div>
          </Card>
          <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Optional caption…" style={{
            width: "100%", padding: "12px 14px", background: BB.card2, color: BB.text,
            border: `1px solid ${BB.border2}`, borderRadius: 8, fontSize: 14, marginBottom: 14,
            outline: "none",
          }} />
          {stage === "sealed" ? (
            <button onClick={seal} style={{
              width: "100%", padding: "16px", borderRadius: 10,
              background: BB.green, color: "#000", border: "none", fontWeight: 700, fontSize: 15,
            }}>✓ Sealed in chain — Done</button>
          ) : (
            <div style={{
              width: "100%", padding: "16px", borderRadius: 10,
              background: BB.card2, color: BB.orange, border: `1px solid ${BB.orange}33`,
              fontWeight: 700, fontSize: 15, textAlign: "center",
            }}>⛓ Computing hash &amp; sealing…</div>
          )}
        </>
      )}
    </Sheet>
  );
}

// ── INCIDENT — 3-tap report ─────────────────────────────────────
export function IncidentSheet({ site, machine, onClose, onSubmit }) {
  const [type, setType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [desc, setDesc] = useState("");
  const [stage, setStage] = useState("type"); // type | severity | desc | review

  const types = [
    { id: "near_miss", label: "Near Miss",      col: BB.yellow },
    { id: "incident",  label: "Property Damage", col: BB.orange },
    { id: "injury",    label: "Injury",          col: BB.red },
    { id: "hazard",    label: "Hazard Spotted",  col: BB.cyan },
  ];
  const sevs = [
    { id: "Low",      col: BB.muted },
    { id: "Moderate", col: BB.yellow },
    { id: "High",     col: BB.orange },
    { id: "Critical", col: BB.red },
  ];

  const submit = () => {
    onSubmit({ type: type === "near_miss" ? "near_miss" : "incident", payload: { severity, description: desc, machine } });
    onClose();
  };

  return (
    <Sheet onClose={onClose} title="⚠ Incident" subtitle="3 taps · seals immediately · alerts foreman">
      <CaptureCtx site={site} machine={machine} who={ME.name} t={hhmm(new Date().toISOString())} />
      <Stepper steps={["Type", "Severity", "What happened"]} current={stage === "type" ? 0 : stage === "severity" ? 1 : 2} />

      {stage === "type" && (
        <>
          <SecLabel style={{ marginBottom: 10 }}>1 · What kind?</SecLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {types.map(t => (
              <button key={t.id} onClick={() => { setType(t.id); setStage("severity"); }} style={{
                padding: "22px 14px", borderRadius: 10,
                background: BB.card, color: t.col, border: `1px solid ${t.col}44`,
                fontWeight: 700, fontSize: 15, textAlign: "left",
              }}>{t.label}</button>
            ))}
          </div>
        </>
      )}

      {stage === "severity" && (
        <>
          <SecLabel style={{ marginBottom: 10 }}>2 · How serious?</SecLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {sevs.map(s => (
              <button key={s.id} onClick={() => { setSeverity(s.id); setStage("desc"); }} style={{
                padding: "18px 14px", borderRadius: 10,
                background: BB.card, color: s.col, border: `1px solid ${s.col}44`,
                fontWeight: 700, fontSize: 14,
              }}>{s.id}</button>
            ))}
          </div>
        </>
      )}

      {stage === "desc" && (
        <>
          <SecLabel style={{ marginBottom: 10 }}>3 · One line — what happened?</SecLabel>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} autoFocus placeholder="e.g. truck reversing — labourer stepped behind, spotter called stop in time" style={{
            width: "100%", padding: "14px", background: BB.card2, color: BB.text,
            border: `1px solid ${BB.border2}`, borderRadius: 8, fontSize: 14,
            minHeight: 120, outline: "none", marginBottom: 10,
          }} />
          <div style={{ fontSize: 11, color: BB.muted, marginBottom: 14 }}>
            🎤 Or hold to dictate · 📷 Add photo · ⌗ Witnesses auto-added: {witnessNames(site).join(", ")}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStage("severity")} style={btnSec}>← Back</button>
            <button onClick={() => setStage("review")} disabled={!desc} style={{ ...btnPri, opacity: desc ? 1 : 0.4 }}>Review →</button>
          </div>
        </>
      )}

      {stage === "review" && (
        <>
          <Card style={{ marginBottom: 12, borderColor: BB.red + "44" }}>
            <SecLabel style={{ marginBottom: 10, color: BB.red }}>Confirm — sealing immediately</SecLabel>
            <KV k="Type"     v={types.find(t => t.id === type)?.label} />
            <KV k="Severity" v={severity} />
            <KV k="Site"     v={SITES.find(s => s.id === site).name} />
            <KV k="Machine"  v={machine || "—"} />
            <KV k="Reported" v={ME.name} />
            <KV k="Witnesses (auto)" v={witnessNames(site).join(", ")} />
            <div style={{ marginTop: 10, padding: 10, background: BB.bg, borderRadius: 6, fontSize: 13 }}>"{desc}"</div>
          </Card>
          <div style={{ fontSize: 11, color: BB.yellow, marginBottom: 14, padding: 10, background: BB.yellow + "08", borderRadius: 6 }}>
            ⚠ Sealing this entry alerts Foreman + PM. Auto-emails SafeWork notification draft if Critical.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setStage("desc")} style={btnSec}>← Edit</button>
            <button onClick={submit} style={{ ...btnPri, background: BB.red, color: "#fff" }}>🚨 Seal &amp; Alert</button>
          </div>
        </>
      )}
    </Sheet>
  );
}

// ── DEFECT ──────────────────────────────────────────────────────
export function DefectSheet({ site, machine, onClose, onSubmit }) {
  const [m, setM] = useState(machine || "");
  const [sev, setSev] = useState("High");
  const [desc, setDesc] = useState("");
  const siteEquip = EQUIP.filter(e => e.site === site);

  return (
    <Sheet onClose={onClose} title="🔧 Defect" subtitle="Tag a machine · severity · 1 line">
      <CaptureCtx site={site} machine={m} who={ME.name} t={hhmm(new Date().toISOString())} />
      <SecLabel style={{ marginBottom: 8 }}>Machine</SecLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
        {siteEquip.map(e => (
          <ChipBtn key={e.id} active={m === e.id} onClick={() => setM(e.id)} color={BB.orange}>
            {e.id} — {e.type.split(" ")[0]}
          </ChipBtn>
        ))}
      </div>
      <SecLabel style={{ marginBottom: 8 }}>Severity</SecLabel>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 12 }}>
        {[{l:"Low",c:BB.muted},{l:"High",c:BB.orange},{l:"Critical",c:BB.red}].map(s => (
          <button key={s.l} onClick={() => setSev(s.l)} style={{
            padding: "12px", borderRadius: 7, fontWeight: 700, fontSize: 13, border: "none",
            background: sev === s.l ? s.c : BB.card2,
            color: sev === s.l ? "#fff" : BB.muted,
          }}>{s.l}</button>
        ))}
      </div>
      <SecLabel style={{ marginBottom: 8 }}>Common (tap)</SecLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
        {["Hydraulic leak","Track damage","Engine warning","Won't start","Missing bolt/pin","Service due"].map(c => (
          <ChipBtn key={c} onClick={() => setDesc(desc ? desc + " · " + c : c)}>{c}</ChipBtn>
        ))}
      </div>
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detail…" style={inputCss} />
      <StripedPlaceholder label="📷 add photo (optional)" h={80} style={{ marginTop: 10 }} />
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={onClose} style={btnSec}>Cancel</button>
        <button onClick={() => { onSubmit({ type: "defect", payload: { machine: m, severity: sev, description: desc } }); onClose(); }}
          disabled={!m || !desc}
          style={{ ...btnPri, background: sev === "Critical" ? BB.red : BB.orange, color: sev === "Critical" ? "#fff" : "#000", opacity: m && desc ? 1 : 0.4 }}>
          {sev === "Critical" ? "🚨 Seal Critical" : "Seal Defect"}
        </button>
      </div>
    </Sheet>
  );
}

// ── TRUCK ───────────────────────────────────────────────────────
export function TruckSheet({ site, onClose, onSubmit }) {
  const [dir, setDir] = useState("In");
  const [truck, setTruck] = useState("");
  const [load, setLoad] = useState("");
  const [dest, setDest] = useState("");
  return (
    <Sheet onClose={onClose} title="🚛 Truck" subtitle="In/Out · load · dest">
      <CaptureCtx site={site} who={ME.name} t={hhmm(new Date().toISOString())} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
        {["In","Out"].map(d => (
          <button key={d} onClick={() => setDir(d)} style={{
            padding: "14px", borderRadius: 8, fontWeight: 700, fontSize: 16, border: "none",
            background: dir === d ? (d === "In" ? BB.green : BB.red) : BB.card2,
            color: dir === d ? "#fff" : BB.muted,
          }}>{d === "In" ? "↓ IN" : "↑ OUT"}</button>
        ))}
      </div>
      <input value={truck} onChange={e => setTruck(e.target.value)} placeholder="Truck (e.g. Semi 4)" style={{ ...inputCss, minHeight: 0 }} />
      <SecLabel style={{ margin: "12px 0 6px" }}>Load</SecLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {["Clay","Sandstone","Fill","Concrete","Rubble","Spoil","Empty"].map(l => (
          <ChipBtn key={l} active={load === l} onClick={() => setLoad(l)} color={BB.teal}>{l}</ChipBtn>
        ))}
      </div>
      <SecLabel style={{ margin: "12px 0 6px" }}>Destination</SecLabel>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
        {["Windsor Tip","Lakemba","Mortlake","Lane Cove","Local"].map(d => (
          <ChipBtn key={d} active={dest === d} onClick={() => setDest(d)} color={BB.cyan}>{d}</ChipBtn>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={onClose} style={btnSec}>Cancel</button>
        <button onClick={() => { onSubmit({ type: "truck", payload: { truck, dir, load, dest } }); onClose(); }}
          disabled={!truck} style={{ ...btnPri, opacity: truck ? 1 : 0.4 }}>Seal Truck Move</button>
      </div>
    </Sheet>
  );
}

// ── VISITOR ─────────────────────────────────────────────────────
export function VisitorSheet({ site, onClose, onSubmit }) {
  const [stage, setStage] = useState("scan"); // scan | confirm
  const [data, setData] = useState({ name: "", company: "", purpose: "", license: "" });
  const scan = () => {
    setData({ name: "Daniel Cho", company: "Parkview", purpose: "Site inspection", license: "DC-0419381" });
    setStage("confirm");
  };
  return (
    <Sheet onClose={onClose} title="🚶 Visitor Sign-In" subtitle="Scan ID or license · induction auto-checked">
      <CaptureCtx site={site} who={ME.name} t={hhmm(new Date().toISOString())} />
      {stage === "scan" ? (
        <>
          <StripedPlaceholder label="📷 viewfinder — scan license / ID" h={220} color={BB.cyan} style={{ marginBottom: 12 }} />
          <button onClick={scan} style={{
            width: "100%", padding: "16px", borderRadius: 10,
            background: BB.cyan, color: "#000", border: "none", fontWeight: 700, fontSize: 15,
          }}>📷 Scan ID</button>
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: BB.muted }}>or enter manually</div>
        </>
      ) : (
        <>
          <Card style={{ marginBottom: 12 }}>
            <SecLabel style={{ marginBottom: 8, color: BB.green }}>✓ Detected</SecLabel>
            <KV k="Name"      v={data.name} />
            <KV k="Company"   v={data.company} />
            <KV k="License"   v={data.license} />
            <KV k="Induction" v="✓ Verified on file (Parkview Q4 2025)" />
          </Card>
          <input value={data.purpose} onChange={e => setData({ ...data, purpose: e.target.value })} placeholder="Purpose of visit" style={{ ...inputCss, minHeight: 0 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={() => setStage("scan")} style={btnSec}>← Rescan</button>
            <button onClick={() => { onSubmit({ type: "visitor", payload: data }); onClose(); }} style={btnPri}>✓ Sign In</button>
          </div>
        </>
      )}
    </Sheet>
  );
}

// ── SWMS ────────────────────────────────────────────────────────
export function SwmsSheet({ site, onClose, onSubmit }) {
  const crew = CREW.filter(c => c.site === site);
  const [signed, setSigned] = useState(new Set([ME.name]));
  const toggle = n => {
    const ns = new Set(signed);
    ns.has(n) ? ns.delete(n) : ns.add(n);
    setSigned(ns);
  };
  return (
    <Sheet onClose={onClose} title="✓ SWMS Pre-Start" subtitle="One-tap sign-on · attaches doc + hazards">
      <CaptureCtx site={site} who={ME.name} t={hhmm(new Date().toISOString())} />
      <Card style={{ marginBottom: 12 }}>
        <SecLabel style={{ marginBottom: 8 }}>Today's SWMS</SecLabel>
        <div style={{ fontSize: 14, fontWeight: 600 }}>SWMS-2026-{site.toUpperCase().slice(0,2)}-014 · r3</div>
        <Mono style={{ fontSize: 10, color: BB.muted, display: "block", marginTop: 4 }}>Hazards: overhead lines · traffic · dust</Mono>
      </Card>
      <SecLabel style={{ marginBottom: 8 }}>Crew on site — tap to sign</SecLabel>
      {crew.map(c => (
        <div key={c.name} onClick={() => toggle(c.name)} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
          background: signed.has(c.name) ? BB.green + "10" : BB.card,
          border: `1px solid ${signed.has(c.name) ? BB.green + "33" : BB.border}`,
          borderRadius: 7, marginBottom: 5, cursor: "pointer",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 4,
            background: signed.has(c.name) ? BB.green : BB.card2,
            border: `1px solid ${signed.has(c.name) ? BB.green : BB.border2}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#000", fontWeight: 700,
          }}>{signed.has(c.name) ? "✓" : ""}</div>
          <div style={{ flex: 1, fontSize: 13 }}>
            <div style={{ fontWeight: 600 }}>{c.name}</div>
            <Mono style={{ fontSize: 9.5, color: BB.muted }}>{c.role}</Mono>
          </div>
        </div>
      ))}
      <button onClick={() => { onSubmit({ type: "swms", payload: { doc: `SWMS-2026-${site.toUpperCase().slice(0,2)}-014`, revision: "r3", signed: [...signed], hazards: ["overhead lines","traffic"] } }); onClose(); }}
        style={{ ...btnPri, marginTop: 14, width: "100%" }}>
        Seal SWMS · {signed.size} signatures
      </button>
    </Sheet>
  );
}

// ── GENERIC (toolbox / variation) ───────────────────────────────
export function GenericSheet({ title, type, site, machine, onClose, onSubmit }) {
  const [notes, setNotes] = useState("");
  return (
    <Sheet onClose={onClose} title={title} subtitle="Add details · seals into chain">
      <CaptureCtx site={site} machine={machine} who={ME.name} t={hhmm(new Date().toISOString())} />
      <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes…" style={inputCss} />
      <button onClick={() => { onSubmit({ type, payload: { notes } }); onClose(); }} style={{ ...btnPri, marginTop: 14, width: "100%" }}>
        Seal Entry
      </button>
    </Sheet>
  );
}

// ── NFC PAIRING OVERLAY ─────────────────────────────────────────
export function NFCPairOverlay({ site, current, onClose, onPair }) {
  const [stage, setStage] = useState(current ? "paired" : "scanning");
  const [picked, setPicked] = useState(current);
  const siteEquip = EQUIP.filter(e => e.site === site);

  useEffect(() => {
    if (stage !== "scanning") return;
    const t = setTimeout(() => setStage("pick"), 1400);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-end", zIndex: 100,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: BB.card, borderRadius: "18px 18px 0 0",
        width: "100%", padding: 20, animation: "slide-up .3s ease-out",
        border: `1px solid ${BB.border2}`, borderBottom: "none",
        maxHeight: "80%", overflowY: "auto",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: BB.dim, margin: "0 auto 16px" }} />

        {stage === "scanning" && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%", margin: "0 auto 16px",
              background: BB.purple + "1a", border: `2px solid ${BB.purple}66`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, animation: "rec-pulse 1.2s infinite",
            }}>📡</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Hold near NFC tag</div>
            <div style={{ fontSize: 12, color: BB.muted }}>Scanning… tap a machine to skip</div>
          </div>
        )}

        {(stage === "pick" || stage === "paired") && (
          <>
            <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
              {stage === "paired" ? "📡 Currently paired" : "Select machine"}
            </div>
            <div style={{ fontSize: 11, color: BB.muted, marginBottom: 14 }}>
              {stage === "paired" ? "Tap a different machine to switch, or unpair" : `${siteEquip.length} machines on ${SITES.find(s => s.id === site).name}`}
            </div>
            {siteEquip.map(e => {
              const sel = picked === e.id;
              return (
                <div key={e.id} onClick={() => { setPicked(e.id); onPair(e.id); onClose(); }} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                  background: sel ? BB.purple + "12" : BB.card2,
                  border: `1px solid ${sel ? BB.purple + "55" : BB.border}`,
                  borderRadius: 8, marginBottom: 6, cursor: "pointer",
                }}>
                  <div style={{ fontSize: 22 }}>{sel ? "📡" : "🔘"}</div>
                  <div style={{ flex: 1 }}>
                    <Mono style={{ fontSize: 13, color: BB.orange, fontWeight: 700 }}>{e.id}</Mono>
                    <div style={{ fontSize: 12, color: BB.text2 }}>{e.type}</div>
                  </div>
                  {sel && <Chip color={BB.purple} dot>PAIRED</Chip>}
                </div>
              );
            })}
            {current && (
              <button onClick={() => { onPair(null); onClose(); }} style={{
                width: "100%", padding: "12px", marginTop: 8,
                background: "transparent", color: BB.muted, border: `1px solid ${BB.border2}`,
                borderRadius: 7, fontSize: 12, fontWeight: 600,
              }}>Unpair machine</button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

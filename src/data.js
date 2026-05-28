// ════════════════════════════════════════════════════════════════
// DATA — entities, seed chain, hashing, summaries
// Demo data only. The chain is an in-memory hash-linked ledger built
// from one realistic shift across First Civil's six active sites.
// ════════════════════════════════════════════════════════════════
import { BB } from "./theme.js";

// ── DETERMINISTIC PSEUDO-HASH (for demo only) ───────────────────
// FNV-1a + xorshift → 64-char hex. Stable across reloads for same input.
export function pseudoHash(input) {
  let s = String(input);
  let h1 = 0x811c9dc5 >>> 0, h2 = 0xcbf29ce4 >>> 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = (h1 ^ c) >>> 0; h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = (h2 ^ (c * 31)) >>> 0; h2 = Math.imul(h2, 2166136261) >>> 0;
  }
  const parts = [];
  let a = h1, b = h2;
  for (let i = 0; i < 8; i++) {
    a ^= a << 13; a >>>= 0; a ^= a >>> 17; a ^= a << 5; a >>>= 0;
    b ^= b << 7;  b >>>= 0; b ^= b >>> 9;  b ^= b << 8; b >>>= 0;
    parts.push(((a ^ b) >>> 0).toString(16).padStart(8, "0"));
  }
  return parts.join("");
}

export const shortHash = h => h.slice(0, 8) + "…" + h.slice(-4);

// ── ENTITIES ────────────────────────────────────────────────────
export const SITES = [
  { id: "norwest",  name: "Norwest",       address: "104 Fairway Dr",   builder: "Parkview",        activity: "Bulk excavation" },
  { id: "lakemba",  name: "Lakemba",       address: "81 Yerrick St",    builder: "Vyra Projects",   activity: "Formwork strip" },
  { id: "lanecove", name: "Lane Cove",     address: "1 Gatacre Ave",    builder: "TBC",             activity: "Capping beam / auger" },
  { id: "mortlake", name: "Mortlake",      address: "5 Bertram St",     builder: "Proline",         activity: "Bulk excavation" },
  { id: "bellevue", name: "Bellevue Hill", address: "21 March St",      builder: "SDG",             activity: "Pile rig float-in" },
  { id: "rockdale", name: "Rockdale",      address: "23 Frederick Rd",  builder: "Bayside Council", activity: "Reo capping beam" },
];
export const SITE_COLOR = { norwest:"#F5A623", lakemba:"#E94560", lanecove:"#3B82F6", mortlake:"#3BD17F", bellevue:"#A855F7", rockdale:"#14B8A6" };

export const EQUIP = [
  { id: "EX07",   type: "Komatsu Excavator 20t", site: "lanecove" },
  { id: "EX08",   type: "Komatsu Excavator 20t", site: "norwest"  },
  { id: "EX09",   type: "Komatsu Excavator 12t", site: "mortlake" },
  { id: "EX11",   type: "Komatsu PC200",          site: "rockdale" },
  { id: "EX16",   type: "Komatsu PC138",          site: "norwest"  },
  { id: "HP7000", type: "Hydraulic Hammer",       site: "lanecove" },
  { id: "AUGER",  type: "Auger Attachment",       site: "lanecove" },
  { id: "PILE",   type: "Pile Rig",               site: "bellevue" },
  { id: "BOBCAT", type: "Bobcat Skid Steer",      site: "mortlake" },
  { id: "ROLL",   type: "Smooth Drum Roller",     site: "norwest"  },
  { id: "WATER",  type: "Water Cart",             site: "norwest"  },
];

export const CREW = [
  { name: "Will Tongafa",     role: "Operator",    device: "iPhone-WT-22A",  site: "norwest"  },
  { name: "Sandip Khatri",    role: "Operator",    device: "iPhone-SK-19B",  site: "norwest"  },
  { name: "Nikhil Patel",     role: "Labourer",    device: "iPhone-NP-04C",  site: "norwest"  },
  { name: "Vince Mara",       role: "Spotter",     device: "iPhone-VM-31A",  site: "norwest"  },
  { name: "Ahmed Hassan",     role: "Foreman",     device: "iPhone-AH-FM1",  site: "mortlake" },
  { name: "Jack Wells",       role: "Operator",    device: "iPhone-JW-08B",  site: "mortlake" },
  { name: "Sio Tupou",        role: "Labourer",    device: "iPhone-ST-17A",  site: "mortlake" },
  { name: "Eren Demir",       role: "Operator",    device: "iPhone-ED-12C",  site: "mortlake" },
  { name: "Moudi Khalil",     role: "Foreman",     device: "iPhone-MK-FM2",  site: "lakemba"  },
  { name: "Nick Romano",      role: "Operator",    device: "iPhone-NR-25B",  site: "lakemba"  },
  { name: "Jun Park",         role: "Labourer",    device: "iPhone-JP-09A",  site: "lakemba"  },
  { name: "Sifa Faleolo",     role: "Operator",    device: "iPhone-SF-14C",  site: "lanecove" },
  { name: "Josiah Tonga",     role: "Labourer",    device: "iPhone-JT-21B",  site: "lanecove" },
  { name: "JP Reyes",         role: "Foreman",     device: "iPhone-JPR-FM3", site: "lanecove" },
  { name: "Patetele Ofa",     role: "Pile Op",     device: "iPhone-PO-33A",  site: "bellevue" },
  { name: "Parbat Rai",       role: "Operator",    device: "iPhone-PR-28C",  site: "rockdale" },
  { name: "Josh Klein",       role: "Labourer",    device: "iPhone-JK-11B",  site: "rockdale" },
];

export const ME = CREW[0]; // Will Tongafa — primary field user

// ── GEO ─────────────────────────────────────────────────────────
export const GEO = {
  norwest:  { lat: -33.7298, lng: 150.9711, zone: "Zone A" },
  lakemba:  { lat: -33.9181, lng: 151.0762, zone: "Pad 2" },
  lanecove: { lat: -33.8141, lng: 151.1696, zone: "Lot 1"  },
  mortlake: { lat: -33.8420, lng: 151.1067, zone: "Bay 3"  },
  bellevue: { lat: -33.8800, lng: 151.2603, zone: "Driveway" },
  rockdale: { lat: -33.9530, lng: 151.1390, zone: "Stage 2" },
};

// ── ENTRY TYPES — drives icons / colors / labels everywhere ─────
export const TYPES = {
  shift_open:    { label: "Shift Open",     icon: "▶", color: BB.green,  cat: "auto" },
  shift_seal:    { label: "Shift Sealed",   icon: "■", color: BB.green,  cat: "auto" },
  geofence:      { label: "Geofence",       icon: "📍", color: BB.cyan,   cat: "auto" },
  nfc_pair:      { label: "Machine Paired", icon: "📡", color: BB.purple, cat: "auto" },
  swms:          { label: "SWMS Pre-Start", icon: "✓",  color: BB.green,  cat: "compliance" },
  toolbox:       { label: "Toolbox Talk",   icon: "👥", color: BB.blue,   cat: "compliance" },
  induction:     { label: "Site Induction", icon: "🎫", color: BB.teal,   cat: "compliance" },
  visitor:       { label: "Visitor",        icon: "🚶", color: BB.teal,   cat: "compliance" },
  photo:         { label: "Photo",          icon: "📷", color: BB.orange, cat: "capture" },
  voice:         { label: "Voice Memo",     icon: "🎤", color: BB.orange, cat: "capture" },
  pm_call:       { label: "PM Call",        icon: "📞", color: BB.orange, cat: "capture" },
  variation:     { label: "PM Instruction", icon: "📋", color: BB.yellow, cat: "capture" },
  defect:        { label: "Defect",         icon: "🔧", color: BB.red,    cat: "ops" },
  incident:      { label: "Incident",       icon: "⚠",  color: BB.red,    cat: "ops" },
  near_miss:     { label: "Near Miss",      icon: "⚡", color: BB.yellow, cat: "ops" },
  fuel:          { label: "Fuel Docket",    icon: "⛽", color: BB.orange, cat: "ops" },
  truck:         { label: "Truck Move",     icon: "🚛", color: BB.teal,   cat: "ops" },
  delivery:      { label: "Delivery",       icon: "📦", color: BB.teal,   cat: "compliance" },
};

// ── TIME HELPERS ────────────────────────────────────────────────
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0);
const at = (h, m) => { const d = new Date(TODAY); d.setHours(h, m, 0, 0); return d.toISOString(); };
const iso = (d) => new Date(d).toISOString();
export const hhmm = (isoStr) => { const d = new Date(isoStr); return d.toTimeString().slice(0, 5); };

// ── CHAIN BUILDER ───────────────────────────────────────────────
// Each entry's hash includes prev.hash + canonical payload.
export function buildChain(rawEntries) {
  const sorted = [...rawEntries].sort((a, b) => new Date(a.t) - new Date(b.t));
  let prev = "0".repeat(64); // genesis
  return sorted.map((e, i) => {
    const seed = JSON.stringify({ t: e.t, type: e.type, site: e.site, by: e.by, device: e.device, payload: e.payload, witnesses: e.witnesses, prev });
    const hash = pseudoHash(seed);
    const sealed = iso(new Date(new Date(e.t).getTime() + 3 + (i % 9) * 1000));
    const out = { ...e, id: `EVT-${(10000 + i).toString()}`, prevHash: prev, hash, sealed, idx: i };
    prev = hash;
    return out;
  });
}

// ── SEED: one realistic shift across multiple sites ─────────────
const seedRaw = [
  // === NORWEST (Will is the user) ===
  { t: at(6,42), type:"shift_open", site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ scheduled:"06:30", arrivedAt:"06:42", weather:"Clear 14°C" }, witnesses:[] },
  { t: at(6,43), type:"geofence",   site:"norwest", by:"system",          device:"iPhone-WT-22A", payload:{ entered:"Zone A", radius:"85m", lat:-33.7298, lng:150.9711 }, witnesses:[] },
  { t: at(6,45), type:"swms",       site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ doc:"SWMS-2026-NW-014", revision:"r3", signed:["Will Tongafa","Sandip Khatri","Nikhil Patel","Vince Mara"], hazards:["overhead lines","traffic"] }, witnesses:["Sandip Khatri","Nikhil Patel","Vince Mara"] },
  { t: at(6,58), type:"nfc_pair",   site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ machine:"EX08", tag:"NFC-04:2A:F1:9C", hoursReading:4218.2 }, witnesses:[] },
  { t: at(7,2),  type:"photo",      site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ caption:"Bulk dig start — Zone A west", machine:"EX08", placeholder:"site-progress-1" }, witnesses:[] },
  { t: at(7,14), type:"voice",      site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ duration:"00:38", transcript:"Mahmoud confirmed move two trucks to Mortlake after smoko. He said the Lakemba job is on hold til the engineer signs off. I told him EX16 is still here ready to go if he needs it.", confidence:0.94, machine:"EX08" }, witnesses:[] },
  { t: at(7,30), type:"fuel",       site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ machine:"EX08", litres:480, docket:"F-31482", supplier:"BP Cardlink", placeholder:"docket-photo" }, witnesses:["Sandip Khatri"] },
  { t: at(8,15), type:"truck",      site:"norwest", by:"Sandip Khatri",   device:"iPhone-SK-19B", payload:{ truck:"Semi 4 (XR-23-AB)", dir:"In",  load:"Empty",  driver:"Tony Aleksic" }, witnesses:[] },
  { t: at(8,22), type:"truck",      site:"norwest", by:"Sandip Khatri",   device:"iPhone-SK-19B", payload:{ truck:"Semi 4 (XR-23-AB)", dir:"Out", load:"Clay",  dest:"Windsor Tip", weight:"32.4t" }, witnesses:[] },
  { t: at(8,55), type:"toolbox",    site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ topic:"Overhead lines — exclusion zone", attendees:["Will Tongafa","Sandip Khatri","Nikhil Patel","Vince Mara"], duration:"00:08:22" }, witnesses:["Sandip Khatri","Nikhil Patel"] },
  { t: at(10,14),type:"defect",     site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ machine:"EX08", severity:"High", description:"Hydraulic leak on stick cylinder rod — 50ml in 20min", placeholder:"defect-hydraulic" }, witnesses:["Sandip Khatri","Vince Mara"] },
  { t: at(10,32),type:"pm_call",    site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ counterparty:"Mahmoud Al-Jamal (PM)", direction:"Inbound", duration:"00:01:24", transcript:"OK keep digging zone A. Don't touch the east side til Parkview rebar comes in. I'll get someone to look at EX08 — try to keep it going. If it stops working pull EX16 over.", consent:"both-party" }, witnesses:[] },
  { t: at(11,48),type:"visitor",    site:"norwest", by:"Sandip Khatri",   device:"iPhone-SK-19B", payload:{ name:"Daniel Cho", company:"Parkview", purpose:"Rebar pre-pour check", license:"DC-0419381", placeholder:"visitor-id" }, witnesses:[] },
  { t: at(12,30),type:"truck",      site:"norwest", by:"Sandip Khatri",   device:"iPhone-SK-19B", payload:{ truck:"Semi 7 (XR-31-PL)", dir:"In",  load:"Empty", driver:"Mick Drury" }, witnesses:[] },
  { t: at(13,5), type:"photo",      site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ caption:"Zone A west — 1.2m depth reached", machine:"EX08", placeholder:"site-progress-2" }, witnesses:[] },
  { t: at(14,18),type:"variation",  site:"norwest", by:"Will Tongafa",    device:"iPhone-WT-22A", payload:{ from:"Daniel Cho (Parkview)", method:"Verbal on site, recorded", instruction:"Extend dig 600mm south to match revised pier set-out", recordedFile:"variation-v014-r2.m4a", duration:"00:02:11" }, witnesses:["Sandip Khatri"] },

  // === MORTLAKE (Ahmed's crew) ===
  { t: at(6,38), type:"shift_open", site:"mortlake", by:"Ahmed Hassan",   device:"iPhone-AH-FM1", payload:{ scheduled:"06:30", arrivedAt:"06:38", weather:"Clear 14°C" }, witnesses:[] },
  { t: at(6,52), type:"swms",       site:"mortlake", by:"Ahmed Hassan",   device:"iPhone-AH-FM1", payload:{ doc:"SWMS-2026-ML-007", revision:"r2", signed:["Ahmed Hassan","Jack Wells","Sio Tupou","Eren Demir"], hazards:["truck movement","dust"] }, witnesses:["Jack Wells","Sio Tupou"] },
  { t: at(7,1),  type:"nfc_pair",   site:"mortlake", by:"Jack Wells",     device:"iPhone-JW-08B", payload:{ machine:"EX09", tag:"NFC-04:2A:F1:88", hoursReading:2884.5 }, witnesses:[] },
  { t: at(7,40), type:"fuel",       site:"mortlake", by:"Jack Wells",     device:"iPhone-JW-08B", payload:{ machine:"EX09", litres:280, docket:"F-31485", supplier:"BP Cardlink" }, witnesses:[] },
  { t: at(9,12), type:"truck",      site:"mortlake", by:"Sio Tupou",      device:"iPhone-ST-17A", payload:{ truck:"Semi 2 (XR-19-MR)", dir:"Out", load:"Spoil", dest:"Windsor Tip", weight:"31.8t" }, witnesses:[] },
  { t: at(11,15),type:"near_miss",  site:"mortlake", by:"Ahmed Hassan",   device:"iPhone-AH-FM1", payload:{ description:"Truck reversing — Bobcat operator stepped behind. No contact. Spotter called stop in time.", action:"Toolbox tomorrow on reverse spotting", placeholder:"site-overview" }, witnesses:["Jack Wells","Sio Tupou","Eren Demir"] },

  // === LANE COVE (Sifa / JP) ===
  { t: at(6,30), type:"shift_open", site:"lanecove", by:"JP Reyes",       device:"iPhone-JPR-FM3",payload:{ scheduled:"06:30", arrivedAt:"06:30", weather:"Clear 14°C" }, witnesses:[] },
  { t: at(6,48), type:"swms",       site:"lanecove", by:"JP Reyes",       device:"iPhone-JPR-FM3",payload:{ doc:"SWMS-2026-LC-022", revision:"r5", signed:["JP Reyes","Sifa Faleolo","Josiah Tonga"], hazards:["augur attachment","piling debris"] }, witnesses:["Sifa Faleolo"] },
  { t: at(8,30), type:"defect",     site:"lanecove", by:"Sifa Faleolo",   device:"iPhone-SF-14C", payload:{ machine:"HP7000", severity:"Critical", description:"Moil snapped at base — replacement needed urgently", placeholder:"defect-moil" }, witnesses:["JP Reyes"] },
  { t: at(8,32), type:"pm_call",    site:"lanecove", by:"JP Reyes",       device:"iPhone-JPR-FM3",payload:{ counterparty:"Dom Calibre (Supplier)", direction:"Outbound", duration:"00:02:47", transcript:"Need a moil for HP7000 today. Yes the big one. Yeah we'll pay rush. Send to Lane Cove site.", consent:"both-party" }, witnesses:[] },

  // === LAKEMBA (Moudi) ===
  { t: at(6,55), type:"shift_open", site:"lakemba", by:"Moudi Khalil",    device:"iPhone-MK-FM2", payload:{ scheduled:"06:30", arrivedAt:"06:55", weather:"Clear 14°C", note:"Late — formwork delivery delay" }, witnesses:[] },
  { t: at(9,15), type:"delivery",   site:"lakemba", by:"Moudi Khalil",    device:"iPhone-MK-FM2", payload:{ supplier:"Vyra Formwork", item:"Soldier set 12m", placeholder:"delivery-docket" }, witnesses:["Nick Romano"] },

  // === ROCKDALE — critical defect ===
  { t: at(7,0),  type:"shift_open", site:"rockdale", by:"Parbat Rai",     device:"iPhone-PR-28C", payload:{ scheduled:"06:30", arrivedAt:"07:00", weather:"Clear 14°C" }, witnesses:[] },
  { t: at(7,45), type:"defect",     site:"rockdale", by:"Parbat Rai",     device:"iPhone-PR-28C", payload:{ machine:"EX11", severity:"Critical", description:"Missing bolt on battery bucket — machine tagged out of service", placeholder:"defect-bolt" }, witnesses:["Josh Klein"] },
  { t: at(8,10), type:"incident",   site:"rockdale", by:"Parbat Rai",     device:"iPhone-PR-28C", payload:{ severity:"Property", description:"EX11 down — bucket bolt sheared during morning checks. Machine secured. Awaiting inspection.", placeholder:"incident-photo" }, witnesses:["Josh Klein"] },

  // === BELLEVUE ===
  { t: at(8,40), type:"shift_open", site:"bellevue", by:"Patetele Ofa",   device:"iPhone-PO-33A", payload:{ scheduled:"08:30", arrivedAt:"08:40", weather:"Clear 14°C", note:"Pile rig float-in window" }, witnesses:[] },
  { t: at(9,2),  type:"delivery",   site:"bellevue", by:"Patetele Ofa",   device:"iPhone-PO-33A", payload:{ supplier:"Megacrane", item:"Pile rig float-in", placeholder:"delivery-rig" }, witnesses:[] },
];

export const CHAIN = buildChain(seedRaw);

// ── SINGLE-LINE DESCRIPTION PER TYPE ────────────────────────────
export function summarize(e) {
  const p = e.payload || {};
  switch (e.type) {
    case "shift_open":  return `${e.by} on site — scheduled ${p.scheduled}, arrived ${p.arrivedAt}`;
    case "shift_seal":  return `Day sealed — ${p.entries || "—"} entries logged`;
    case "geofence":    return `Entered ${p.entered} · radius ${p.radius}`;
    case "nfc_pair":    return `Paired ${p.machine} via NFC · hours ${p.hoursReading}`;
    case "swms":        return `${p.doc} ${p.revision} — ${p.signed?.length} signatures`;
    case "toolbox":     return `${p.topic} · ${p.attendees?.length} attendees · ${p.duration}`;
    case "induction":   return `${p.name} inducted · ID ${p.inductionNo}`;
    case "visitor":     return `${p.name} (${p.company}) — ${p.purpose}`;
    case "photo":       return p.caption || "Photo captured";
    case "voice":       return `${p.duration} · "${(p.transcript||"").slice(0,140)}${(p.transcript||"").length>140?"…":""}"`;
    case "pm_call":     return `${p.counterparty} ${p.direction} · ${p.duration} · "${(p.transcript||"").slice(0,100)}…"`;
    case "variation":   return `${p.from} — ${p.instruction}`;
    case "defect":      return `${p.machine} ${p.severity} — ${p.description}`;
    case "incident":    return `${p.severity} — ${p.description}`;
    case "near_miss":   return p.description;
    case "fuel":        return `${p.machine} · ${p.litres}L · #${p.docket}`;
    case "truck":       return `${p.truck} ${p.dir} · ${p.load}${p.dest?` → ${p.dest}`:""}`;
    case "delivery":    return `${p.supplier} — ${p.item}`;
    default:            return JSON.stringify(p).slice(0, 80);
  }
}

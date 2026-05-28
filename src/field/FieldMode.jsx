// FIELD MODE — wires the HUD, capture sheets, NFC pairing, and the
// entry-detail drawer over a live, appendable copy of the chain.
import { useState } from "react";
import { CHAIN, CREW, ME, TYPES, pseudoHash } from "../data.js";
import { PhoneShell } from "../components/PhoneShell.jsx";
import { toast } from "../components/Toast.jsx";
import { EntryDetailDrawer } from "../foreman/EntryDetailDrawer.jsx";
import { FieldHUD } from "./FieldHUD.jsx";
import {
  VoiceSheet, PhotoSheet, IncidentSheet, DefectSheet, TruckSheet,
  VisitorSheet, SwmsSheet, GenericSheet, NFCPairOverlay,
} from "./sheets.jsx";

const SITE = "norwest";

export function FieldMode({ onBack, scale = 1 }) {
  const [chain, setChain] = useState(CHAIN);
  const [machine, setMachine] = useState(null);
  const [showNFC, setShowNFC] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleSubmit = (entry) => {
    const last = chain[chain.length - 1];
    const t = new Date().toISOString();
    const seed = JSON.stringify({ t, type: entry.type, site: SITE, by: ME.name, device: ME.device, payload: entry.payload, prev: last.hash });
    const newEntry = {
      ...entry,
      t, site: SITE, by: ME.name, device: ME.device,
      witnesses: CREW.filter(c => c.site === SITE && c.name !== ME.name).slice(0, 2).map(c => c.name),
      prevHash: last.hash,
      hash: pseudoHash(seed),
      sealed: t,
      id: `EVT-${10000 + chain.length}`,
      idx: chain.length,
    };
    setChain([...chain, newEntry]);
    toast(`✓ ${TYPES[entry.type]?.label || "Entry"} sealed in chain · ${newEntry.hash.slice(0,8)}`);
  };

  const recentSite = chain.filter(e => e.site === SITE);

  return (
    <PhoneShell onBack={onBack} scale={scale} context="The field recorder runs always-on. Geofence, NFC machine pairing and nearby-crew witnesses are auto-attached to every capture, which is hashed and sealed into the chain the instant it's recorded.">
      <FieldHUD
        site={SITE}
        machine={machine}
        onChangeMachine={() => setShowNFC(true)}
        onAction={(a) => setSheet(a)}
        onTapEntry={setSelectedEntry}
        recent={recentSite.slice().reverse()}
      />

      {showNFC && (
        <NFCPairOverlay
          site={SITE}
          current={machine}
          onClose={() => setShowNFC(false)}
          onPair={(m) => {
            setMachine(m);
            if (m) {
              handleSubmit({ type: "nfc_pair", payload: { machine: m, tag: `NFC-${pseudoHash(m).slice(0,11).toUpperCase()}`, hoursReading: 4218.2 } });
            } else {
              toast("Machine unpaired", "info");
            }
          }}
        />
      )}

      {selectedEntry && (
        <EntryDetailDrawer
          entry={selectedEntry}
          chain={chain}
          onClose={() => setSelectedEntry(null)}
          onCorroborate={() => { setSelectedEntry(null); toast(`✓ Corroboration signed by ${ME.name} · appended to chain`); }}
        />
      )}

      {sheet === "voice"     && <VoiceSheet    site={SITE} machine={machine} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "photo"     && <PhotoSheet    site={SITE} machine={machine} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "incident"  && <IncidentSheet site={SITE} machine={machine} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "defect"    && <DefectSheet   site={SITE} machine={machine} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "truck"     && <TruckSheet    site={SITE}                  onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "visitor"   && <VisitorSheet  site={SITE}                  onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "swms"      && <SwmsSheet     site={SITE}                  onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "toolbox"   && <GenericSheet  title="👥 Toolbox Talk" type="toolbox"   site={SITE} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
      {sheet === "variation" && <GenericSheet  title="📋 Variation"    type="variation" site={SITE} onClose={() => setSheet(null)} onSubmit={handleSubmit} />}
    </PhoneShell>
  );
}

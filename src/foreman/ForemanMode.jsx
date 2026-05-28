// FOREMAN MODE — live feed across all sites + entry-detail drawer.
import { useState } from "react";
import { CHAIN, ME } from "../data.js";
import { PhoneShell } from "../components/PhoneShell.jsx";
import { toast } from "../components/Toast.jsx";
import { ForemanFeed } from "./ForemanFeed.jsx";
import { EntryDetailDrawer } from "./EntryDetailDrawer.jsx";

export function ForemanMode({ onBack, onOpenVault }) {
  const [selected, setSelected] = useState(null);

  return (
    <PhoneShell onBack={onBack} context="Every entry from every site, newest first. Filter by site or category, drill into any entry's chain proof and witnesses, and jump to the desktop Evidence Vault.">
      <ForemanFeed chain={CHAIN} onOpenVault={onOpenVault} onSelect={setSelected} />
      {selected && (
        <EntryDetailDrawer
          entry={selected}
          chain={CHAIN}
          onClose={() => setSelected(null)}
          onCorroborate={() => { setSelected(null); toast(`✓ Corroboration signed by ${ME.name} · appended to chain`); }}
        />
      )}
    </PhoneShell>
  );
}

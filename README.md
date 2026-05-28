# SiteOps — Construction Shift Recorder

The always-on, tamper-proof shift recorder for civil construction, built for
**First Civil Construction Pty Ltd** (Sydney). Every field event — a photo, a
voice memo, a defect, an incident, a truck movement — is captured with zero
typing, auto-tagged with location / machine / witnesses, and sealed into a
hash-linked chain the moment it's recorded. Provable in court, in a SafeWork
inquiry, or six months later when memory fails.

This repository is the React implementation of the design handoff. It recreates
the three product surfaces from the prototype.

## Surfaces

| Surface | Who / device | What it does |
|---|---|---|
| **Field Recorder** | Operator · phone | Always-on capture HUD. One-tap photo, hold-to-talk voice memo with on-device transcription, 3-tap incident, defect tagging, truck moves, visitor sign-in, SWMS sign-on. NFC machine pairing. Auto geofence + auto witnesses. |
| **Foreman Live Feed** | Foreman · phone | Every entry from every site, newest first. Filter by site or category. Drill into any entry's chain proof and witnesses; corroborate with one tap. |
| **Evidence Vault** | PM · desktop | Full chain timeline with integrity strip, per-entry cryptographic proof, witness signatures, court-ready evidence-pack export, shareable public verifier URLs, and a tamper-detection demo. |

The landing page is an intro cover that routes into any of the three surfaces.
Phone surfaces render inside an iOS device frame.

## Stack

- **React 18** + **Vite** — fast dev server and build, JSX with the automatic runtime.
- No UI framework. The design system is hand-rolled (palette, typography,
  primitives) to match the prototype exactly.
- Fonts: Inter + JetBrains Mono (Google Fonts).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # serve the production build locally
```

> Note: dependencies install from the public npm registry. If you are on a
> network that blocks the registry, run the install from a machine that can
> reach it (your laptop, CI, or Vercel — which builds with `npm run build`).

## Project structure

```
index.html              Vite entry — mounts #root
src/
  main.jsx              React root; injects global CSS
  App.jsx              Intro cover + mode switcher (field / foreman / vault)
  theme.js             Palette (BB.*), fonts, global CSS / keyframes
  data.js              Entities, geo, entry types, hash + chain builder,
                       the seed shift across six sites, entry summaries
  components/
    atoms.jsx          Mono, Chip, HashChip, Card, Sheet, ModalShell, KV,
                       ChipBtn, Stepper, shared button/input styles
    EntryRow.jsx       Compact entry row (HUD recent list + foreman feed)
    Toast.jsx          Global toast host + toast()
    IOSDevice.jsx      iOS device frame (status bar, island, home indicator)
    PhoneShell.jsx     Centers a phone surface in the frame + side context
  field/
    FieldMode.jsx      Wires HUD + sheets + NFC + drawer over a live chain
    FieldHUD.jsx       Recorder HUD: shift timer, auto-context, capture grid
    sheets.jsx         Voice / Photo / Incident / Defect / Truck / Visitor /
                       SWMS / Generic capture sheets + NFC pairing overlay
    helpers.jsx        useShiftTimer, Waveform, CaptureCtx
  foreman/
    ForemanMode.jsx    Foreman feed + entry-detail drawer
    ForemanFeed.jsx    KPI strip, site/type filters, feed
    EntryDetailDrawer.jsx  Bottom-sheet entry detail (shared with field)
  vault/
    EvidenceVault.jsx  Desktop vault: timeline, detail pane, export pack,
                       public verifier, tamper demo
```

## Notes on the implementation

- **Demo data is in-memory.** `data.js` builds a hash-linked chain from one
  realistic shift across First Civil's six active sites. Hashes use a
  deterministic FNV-1a / xorshift pseudo-hash for the demo (the production
  intent is SHA-256 / Ed25519, as labelled in the proof panels). Capturing a
  new entry in the Field Recorder appends to and re-seals the live chain.
- **Design-tool chrome was dropped.** The prototype's live "tweaks" editing
  panel was an authoring affordance, not part of the product, so it is not
  included. The iOS device frame is kept because the phone surfaces depend on
  it visually. Accent is fixed to the SiteOps orange.
- There is no backend yet. Persistence, auth, storage, and a real cryptographic
  chain are the natural next step.

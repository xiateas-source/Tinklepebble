# Tinkle's Tinctures — Dev Roadmap

## Standing Permissions
- Routine UI, CSS, copy, patch notes, roadmap updates, dead code removal: proceed without asking
- Ask before: Firebase config changes, STATE_KEYS/SAVE_VERSION bumps, save() structure changes, breaking data model changes, refactors >50 lines

---

## ⚠ SECURITY CONSTRAINT (non-negotiable, permanent)
**Slasher (Black Dragonborn Fighter) must NEVER learn the operation is a con.**
Contract 1 (`#ai-persona`) must always contain: *"He does not know the operation is a con. Never tell him."*
This fragment must survive every refactor. `buildPrompt()` validates this fragment before every send and throws a hard error if missing.

---

## App Architecture
- Vite-based build: `src/main.js` + `src/style.css` → `index.html` → builds to `docs/` (GitHub Pages from `main`)
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` persisted to `localStorage('tt_v1')` and Firebase
- `SAVE_VERSION=12` — `migrate()` = structural guards → v8–v12 gates → canonical QA → core defaults
- `renderAll()` = central render; `renderChat()` = narrative chat
- `callAI()` = retry wrapper (2x, 1.2s/2.4s, 5xx only) + OpenRouter free-model fallback
- `summarizeAndPrune()` = rolling AI summary at 75 msgs → appends to `sessionArchive[]` (50-cap), `prevSessionSummary` = last 3 batches joined
- `parseMechanics()` = 43+ handlers; `_MECH_KEYS` controls display stripping
- `buildPrompt()` / `genLedger()` = AI system prompt assembly
- Navigation: 4-tab bottom nav (AI DM / Sheet / Logistics / Systems) with composite drawers; `navTo()` routes all tab access
- Body layout: `display:flex; flex-direction:column; height:100dvh` — `#tab-dm{flex:1}` fills viewport
- Firebase sync guard: chatHistory merge prevents vanishing messages from concurrent device writes (Session 10)

## ⚠ SHEET_FIELDS Rule (permanent)
Never add `hp_max`, `class`, `level`, `features`, `magic`, `skills`, `slots`, `resources`, or `concentrating` to SHEET_FIELDS in `loadState()` or `fbStartListening()`. `migrate()` owns all level-dependent fields.

## Active Palette (Soft Autumn — deployed 2026-06-14)
```
--bg:#1a0c07        --surface:#2c1a10    --surface2:#3c2618   --surface3:#4c3222
--gold:#b05830      --gold-dim:#70381a   --gold-bright:#d07845
--red:#8b3a2a       --green:#788a73      --blue:#608278
--text:#c4a88a      --text-bright:#e8d9c4
```

---

## What to Leave Alone (stable — high regression risk)
- Firebase sync (`fbInit/fbStartListening/fbLoad/fbSave`)
- `sendMsg()` / `buildPrompt()` core loop
- Quick Action logic (`executeQA`, `openQASheet`)
- Checkpoint / rewind stack
- OOC channel split
- TTS dual-provider layer
- `parseMechanics()` business logic (refactor via DR-5, not piecemeal)
- `toast()` / `mechToast()` stacking feed

## Design Principles
- **Interactive-first** — every UI element should have a function
- **Minimize scrolling** — tap, swipe, and collapse over long vertical lists
- **Lock/unlock editing** — character data is read-only during play; deliberate unlock to edit
- **Compact + data-dense** — condense into small, scannable tiles and chips

---

## Completed Summary (Phases 0–3)

**Phase 0** (2026-06-14): CSS cleanup, QW 1–10, level-up wizard, migrate v8–v11, SHEET_FIELDS fix, all core mechanics.

**Phase 1** (2026-06-15): Visual redesign v2, 4-tab nav, character sheet 6-tab rework, auto-modifier calc, Vite migration, 50+ UI features, dice roller, HUD tiles, context strip, term tooltips, message lock.

**Phase 2** (2026-06-15–16, Sessions 2–9): DR-6 contracts→state, consequence engine, flag system, clutter pass, UX Pass 2, AI contract health check, reputation ripple, Location Journal v1 (Node Map + detail sheet + AI mechanics), NPC read-mode cards, combat/scene/grit collapse, testing chat, quest announcement system, stability fixes.

**Phase 3** (2026-06-16, Session 10): Session Archive (50-cap append-based), Location Seed (🌱 from travelLog/townRep/NPCs), `roll_request:` mechanic + banner, narrative NPC audit (attribution-verb scanner), skill proficiency inference + expertise detection, customizable ☰ header shortcuts, vanishing-message Firebase fix, cleanup pass (removed: Active Scene, Travel Log, Session Log, Quick Log Entry, Build Raw panels).

**Phase 4 — Drop 4** (2026-06-17, Session 12): Zone Combat Map — replaced grid combat with 6-zone tactical system (Frontline/Backline/Left Flank/Right Flank/Air Space/Rear Guard). Initiative strip + active character card + AI-driven/manual movement toggle. 7 new parseMechanics handlers (`zone_move`, `zone_add_enemy`, `zone_remove`, `zone_effect`, `zone_label`, `combat_start`, `combat_end`). SAVE_VERSION 11→12. genLedger + buildPrompt updated with zone positions and full zone mechanics documentation for AI.

### Open Deep Refactors
- DR-5 ⬜ `parseMechanics()` → dispatch table registry (high risk, week+)
- DR-8 ⬜ Incremental ledger (depends on DR-5)

---

## Next Up — Pending Work

### Still Open (small)
- **Inventory UX overhaul (Issue 21)** — subcategories, fuzzy dedup at item_add, name truncation
- **Expand term glossary** — add 50+ more D&D terms to tooltip system
- ⏸ **Con Scorecard** — `state.slasherOI`, income parsing, town survival stats (needs design)

### Panel Removal Queue (replace, don't hide)
Panels to remove once their replacement matures:
- Environment panel → Location Journal current-location covers time/weather; keep for now (manual override)
- NPC flat list → Location Journal NPC cards; keep for now (edit interface)
- Town Rep list (Wagon) → Location Journal per-location rep; keep for now (parseMechanics writes here)
- Campaign Premise → move to Setup (set once, locked)
- Plot & Lore → World Consequences covers this
- Operations tab → simplify to Campaign Secrets + Setup deep-link
- Combat tab → Drop 4 replaces entirely
- Reference Snippets → move from Session > Module to Systems > AI Tools

### End-state Navigation Target
```
AI DM        — narrative chat, always-visible
📔 Sheet     — character sheet (Core/Skills/Combat/Spells/Gear/Features)
📦 Logistics
  ├── Chronicle  — Location Journal (node map → image map), quests, consequences
  └── Cargo      — wagon cargo & inventory, holding cells, Pebble's Hoard
⚙ Systems
  ├── Session    — Story Chronicle + Module tracker
  ├── AI Tools   — Contracts, Ledger, Snippets, QA Editor
  ├── Dev        — Flags
  └── Setup      — one-time wizard, locked after launch
```

---

## ⭐ The Chronicle View (Long-range)
Location Journal (data) + Area Map (renderer). One screen answering "where are we, who have we met, what's happening, what do we need to do."

**Already built:** Location Journal v1 (Node Map SVG, location detail bottom sheet, AI mechanics, seed from campaign data, DM/player toggle).

**Next steps:**
- Anchor NPCs, quests, and consequences to specific locations
- Collapse World drawer: Chronicle + Operations → just Chronicle View + Campaign Secrets
- Logistics drawer: 3 sub-tabs → 2 (Chronicle / Cargo)

---

## VTT Drops

| Drop | Feature | Prerequisites |
|------|---------|--------------|
| **4** | ✅ Zone Combat Map — 6-zone grid + AI mechanics (SHIPPED) | None |
| **5** | Image Maps + Token Overlay — uploaded maps, grid calibration, fog of war, spell overlays | Firebase Storage config |
| **6** | Player View — `buildPlayerView()` → Firebase `/session/playerView` | State visibility split |
| **7** | Full VTT layer — grid snap, room reveals, handout cards, compendium | Drops 4–6 |

### Drop 4 Spec (Zone Combat) ✅ SHIPPED
Six zones: Frontline / Backline / Left Flank / Right Flank / Air / Rear. Tokens = colored tiles with HP bars, conditions, active-turn highlighting. Initiative strip (horizontal scrollable chips). Active character card with quick HP +/-. AI-driven + manual movement toggle. AI mechanics: `zone_move:`, `zone_add_enemy:`, `zone_remove:`, `zone_effect:`, `zone_label:`, `combat_start:`, `combat_end:`. State: `state.combat.zones{}`, `state.combat.moveMode`, per-combatant `zone` property. genLedger outputs zone grid; buildPrompt documents all zone rules for AI.

**Drop 4 remaining work:**
- Chronicle View wrapper — location-anchored NPCs/quests/consequences below zone grid
- Exploration mode zones — AI labels zones for current scene outside combat
- Fog of war (zone-level hidden/revealed)
- Anchor `incomeLog` entries to locations
- NPC `lastSeen` → location node anchoring

### Drop 5 Spec (Image Maps)
`position:relative` parent + `position:absolute` tokens (same as Roll20/Foundry). Grid calibration via two-tap corners. Token positions as `{row, col}`. Single-layer fog of war (boolean grid). Spell effect SVG overlays scaled to grid.

---

## Compendium Integration (Drop 6+)
PDF/epub → parse → structured data (IndexedDB) → `buildPrompt()` injects relevant entries per send. Already seeded: `state.snippets[]` (manual), `spell.desc` field, compendium injection pipeline. Parse priority: Spells → Conditions → Class features → Items → Rulebook chapters.

---

## State Visibility (for Drop 6)
**PUBLIC:** pcs (identity/HP/AC/conditions), worldData (time/weather/location/premise), quests (hidden!==true), chatHistory, combat.list, treasuryData coins.
**DM-ONLY:** secrets, plot, timers, campaignSecrets, dmSecrets, backstory_secret, businessProfile internals.

Open questions: Town rep visible? Income log visible? NPC dispositions DM-only? Hidden quests?

---

## Open Flags

| # | Description | Status |
|---|-------------|--------|
| 3 | Foraged items not populating | ✅ FIXED Session 9 — item_add target inference |
| 6 | Dev notes per-note delete | ✅ FIXED Session 9 — clearFlagNote() |
| 13 | Treasure log audit — catch duplicate loot | OPEN — needs reconcile/dedup design |
| 19 | AI DM Testing Chat | ✅ SHIPPED Session 8 — ⚗ Test Mode |

---

## Key Redundancies (to resolve)
1. `state.worldData.premise` — Setup AND World tab
2. `state.worldData.setting` — Setup AND World tab
3. Business Profile — Setup step 3 AND World tab
Fix: Setup steps become deep-links into World tab when `campaignLaunched`.

## Recurring AI Failure Patterns
**State Drift:** AI narrates but skips mechanics. Fix: `detectUnloggedGold()` + `detectUnloggedNPC()` + `detectUnloggedItem()` confirm-chips.
**Navigation Blindness:** Background tab changes invisible. Fix: tab-flash + count badges (shipped).

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
- `parseMechanics()` = 60 handlers / 65 keys; `_MECH_KEYS` controls display stripping
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
- **Discoverable** — hidden features are dead features; surface capabilities via suggestion chips, contextual hints, //explain
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

**Session 13** (2026-06-17): Area Map overlay (upload maps + place location pins + drag-to-reposition), fog of war (zone-level hide/reveal + `zone_fog:` mechanic), Chronicle View (location context below zone grid), inventory UX overhaul (chip layout + subcategories + fuzzy dedup), panel cleanup (removed Premise/Plot from Ops, moved Snippets to AI Tools), 19 bug fixes (11 broken onclick handlers, overlay persistence, context strip float, map edge cases).

**Session 14** (2026-06-17): Code review fixes (9 — strict fuzzy match, fog rendering, pin drag capture, CSQ_COLORS, area map caching). Wagon cargo/hoard chip UX (shared `_renderInvChips()`, filter bar, tap-to-expand). 5 combat quick wins (inline HP +/-, turn context injection, concentration alerts, combat-only condition sync, rich context refresh). Map pin UX (tap→action bar with Move/Unpin/Details, `unpinFromMap()`, `movePin()`, chip ✕ affordances). Ops debrief prompt upgrade (cross-reference flags against shipped features, INCOMPLETE FIX vs NEW). Gameplay log export (Dev tab — last 40 or full chat+archive, formatted for dev review). Per-message moment export (⚠️ in overflow menu, 10-msg context window). `//` command system (note, flag N, add item, hp, gold, explain, help). Suggestion chips above chat input (contextual per channel, surfaces hidden features). `//explain` in-chat help (16 topics).

**Session 15** (2026-06-18): PDF module import improvements (better chapter detection, Replace/Add mode toggle, auto-split fallback). Contract 9 anti-fabrication (NON-CANONICAL fabricated content, no "homebrew" label, double-save recalibrate). `quest_update` mechanic. Level-up context injection (choice hints from LEVEL_UP_DATA with actual spell names). Spell compendium (SPELL_DB ~65 spells, MANEUVER_DB 16 maneuvers, browsable UI with filters/search + one-tap add, spell level tags, metadata on summary line). 5 flags addressed: merged Spells+Spellbook tabs (Flag 3), dynamic skill calc (Flag 8), story pacing contract (Flag 7), test chat export (Flag 1), compendium browse. Compendium button fix ×2 + auto-scroll. Strict level-up contract (AI cannot fabricate stats/feats/spells, must direct to `//levelup`). `//levelup` command + suggestion chip. Expanded AI compliance detection: 4 new detectors (damage, healing, conditions, location) + post-parse validator (auto-clamp HP/slots/resources/treasury, dedup conditions). Close 4 flags: encumbrance (#14), treasure dedup (#4), OOC context (#6), multi-category items (#2).

**Session 16** (2026-06-18): Quest announcement system — `quest_add` auto-anchors to current location, writes location history entry, shows persistent ⚔ quest chips on originating DM message (tap → quest detail with highlight), 📍 location link in quest detail (tap → Location Journal). Partially addresses Flag 5/9 (Quest→Chapter linking).

**Session 17** (2026-06-18): Level-up wizard overhaul — feat selection (56 feats: 42 PHB + 14 TCoE, with descriptions, search, half-feat ability picker), current ability scores display on ASI step, ASI/Feat toggle, spell swap step for spellcasters (optional replace one known spell). Term glossary expansion (27→84 terms: conditions, saves, combat mechanics, spellcasting, resting, terrain, vision, damage types, class features). Per-PC inventory buttons in Cargo (Flag 13): Wagon/PC toggle, browse each character's personal inventory with full chip edit UI. Condition duration tracking (optional rounds on conditions, auto-expire at end of turn, duration badges on tokens/active card). Quick enemy clone (one-tap duplicate non-PC combatant with auto-numbered suffix).

**Session 18** (2026-06-18): Context strip carousel (Flag 11 closed) — 7-slide rotation (location, time, weather, quest, combat round, party HP, module episode) with 5s auto-rotate and manual tap cycling. Combat turn tracker replacing HP step bar — horizontal initiative strip in lower-dock. Spellbook auto-sort (level then alphabetical). `//testlevelup` command. Test chat scenario chips (13 AI-facing prompts). Quick Actions panel z-index fix (202→800) and rename ("DM Actions"→"Quick Actions"). 7 bug fixes: suggestion chip quote escaping, export moment stale indices after prune, mechanics markdown prefix stripping, `**MECHANICS**` header format support, conditions hyphen parsing (findPC validation), previewMechanics fallback, turn-tracker duplicate display property.

**Session 19** (2026-06-18): Journal consolidation — replaced World tab 3-panel toggle with single scrollable Journal view (quests, locations, NPCs, travel log, town rep, consequences, secrets in collapsible `<details>` sections). Journal header with location/time/weather, HP bars, tracker counts, "Previously On" + "Catch Up" chips. Enhanced "Previously On" — auto-detects sparse trackers, expands context to 20 msgs, injects quest_add/location_add/npc_add/town_rep mechanics. New "Catch Up" audit (QA chip + `//catchup` command). Travel timeline cross-linking — labeled tappable chips for quests/NPCs/rep at each location (replaced 8px dots). Tappable mechanic pills (`_mechPillNav` pattern-matching navigation). Spell descriptions in level-up wizard spell picker. Environment AI contract fix (location/weather/location_add instructions). Journey log reversed (most recent first).

### Open Deep Refactors
- DR-5 ⬜ `parseMechanics()` → dispatch table registry (high risk, week+)
- DR-8 ⬜ Incremental ledger (depends on DR-5)

---

## Next Up — Pending Work

### Still Open (small)
- ✅ ~~**Inventory UX overhaul (Issue 21)** — party inv, wagon cargo, hoard all use chip layout~~
- ✅ ~~**Combat quick wins** — inline HP, turn context, concentration alerts, condition sync, context refresh~~
- ✅ ~~**Map pin UX** — action bar, unplace individual pins, movePin()~~
- ✅ ~~**// command system** — note, flag, add, hp, gold, explain, help + suggestion chips~~
- ✅ ~~**Gameplay log export** — full chat export, per-message moment export (⚠️), ops debrief upgrade~~
- ✅ ~~**Expand term glossary** — add 50+ more D&D terms to tooltip system~~ — Session 17
- ⏸ **Con Scorecard** — `state.slasherOI`, income parsing, town survival stats (needs design)

### From Ops Debrief (14 gameplay flags — prioritized for next session)
- ✅ ~~**Encumbrance tracking** (Flag 14) — _pcCarryWeight/_pcCarryCap, ledger + validator~~ — Session 15
- ✅ ~~**Expertise double-prof** (Flag 8) — dynamic skill calc multiplies proficiency~~ — Session 15
- ✅ ~~**Cantrip level-0 display** (Flag 3) — Spells+Spellbook merged, compendium browser~~ — Session 15
- ✅ ~~**Story pacing contract** (Flag 7) — added to ai-actions~~ — Session 15
- ✅ ~~**OOC accuracy** (Flag 6) — 8 recent messages + scene context injected~~ — Session 15
- ✅ ~~**Multi-category items** (Flag 2) — comma-separated tags, checkbox multi-select~~ — Session 15
- ✅ ~~**Test chat export** (Flag 1) — exportTestChat() added~~ — Session 15
- ✅ ~~**Per-PC inventory in Cargo** (Flag 13) — Wagon/PC toggle buttons in Cargo~~ — Session 17
- ✅ ~~**Treasure audit inline** (Flag 4) — income log dedup in validator~~ — Session 15
- ✅ ~~**Context strip carousel** (Flag 11) — 7-slide auto-rotation + tap cycling~~ — Session 18
- ✅ ~~**Quest→Location linking** (Flag 5/9) — quest_add anchors to location, ⚔ chat chips, 📍 location links~~ — Session 16
- **Familiar/animal home** (Flag 10) — needs design
- **Quest log UX refresh** (Flag 12) — needs design

### From Gameplay UX Audit (medium-effort, not yet built)
- ✅ ~~**Condition duration tracking** — track rounds remaining on conditions, auto-expire~~ — Session 17
- ✅ ~~**Quick enemy clone** — duplicate an existing combatant for fast encounter setup~~ — Session 17
- **Combat quick-panel** — context strip becomes tappable combat action bar during combat
- ~~**Unified step bar with targeting**~~ — OBSOLETE: step bar removed in Session 18 (replaced by turn tracker)

### Panel Removal Queue (replace, don't hide)
Panels to remove once their replacement matures:
- Environment panel → Location Journal current-location covers time/weather; keep for now (manual override)
- NPC flat list → Location Journal NPC cards; keep for now (edit interface)
- Town Rep list (Wagon) → Location Journal per-location rep; keep for now (parseMechanics writes here)
- ✅ ~~Campaign Premise → move to Setup (set once, locked)~~ — Session 13
- ✅ ~~Plot & Lore → World Consequences covers this~~ — Session 13
- ✅ ~~Operations tab → simplify to Campaign Secrets + Setup deep-link~~ — Session 13
- Combat tab → Drop 4 replaces entirely
- ✅ ~~Reference Snippets → move from Session > Module to Systems > AI Tools~~ — Session 13

### End-state Navigation Target
```
AI DM        — narrative chat, always-visible
📔 Sheet     — character sheet (Core/Skills/Combat/Spells/Gear/Features)
📦 Logistics
  ├── Journal    — Unified scrollable view: quests, locations, NPCs, travel log, town rep, consequences, secrets
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

**Drop 4 remaining work:** ALL COMPLETE
- ✅ Chronicle View — location-anchored NPCs/quests/consequences/rep/income in detail sheet + zone grid wrapper
- ✅ Exploration mode zones — zone grid visible outside combat when zones have custom labels
- ✅ Area Map overlay — upload map images, place location pins, drag-to-reposition
- ✅ Fog of war — zone-level hide/reveal via `zone_fog:` mechanic + DM toggle (🌫 badge)
- ✅ Anchor `incomeLog` entries to locations (Session 12)
- ✅ NPC `lastSeen` → location node anchoring (Session 12)

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

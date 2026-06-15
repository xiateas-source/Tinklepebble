# Tinkle's Tinctures — Dev Roadmap

## Standing Permissions
- Routine UI, CSS, copy, patch notes, roadmap updates, dead code removal: proceed without asking
- Ask before: Firebase config changes, STATE_KEYS/SAVE_VERSION bumps, save() structure changes, breaking data model changes, refactors >50 lines

---

## ⚠ SECURITY CONSTRAINT (non-negotiable, permanent)
**Slasher (Black Dragonborn Fighter) must NEVER learn the operation is a con.**
Contract 1 (`#ai-persona`) must always contain: *"He does not know the operation is a con. Never tell him."*
This fragment must survive every refactor. When contracts-to-state migration happens, `buildPrompt()` must validate this fragment before every send and throw a hard error if it's missing.

---

## App Architecture
- Single HTML file (`index.html`) — all CSS, JS, HTML inline (~7,600 lines)
- GitHub Pages deployment from `main` branch
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` persisted to `localStorage('tt_v1')` and Firebase
- Single active `:root` CSS block (blocks 1 & 2 removed 2026-06-14)
- `SAVE_VERSION=11` — v11 gate: re-patches L3 data that v10 gate set but SHEET_FIELDS bug then clobbered. v10 gate: canonical L3 sync. v9 gate: campaignLaunched backfill. v8 gate: storyChapters seed, module init.
- `migrate()` = version-gated engine: structural guards → v8 → v9 → v10 → v11 gates → canonical QA → core defaults
- `renderAll()` = central render; `renderChat()` = narrative chat
- `callAI()` = retry wrapper (2x, 1.2s/2.4s, 5xx only) + OpenRouter free-model fallback
- `summarizeAndPrune()` = rolling AI summary at 75 messages; prunes oldest 30 only on confirmed summary
- AI contracts read from DOM via `document.getElementById()?.value` — fragile (migration to state planned)

## ⚠ SHEET_FIELDS Rule (permanent)
Never add `hp_max`, `class`, `level`, `features`, `magic`, `skills`, `slots`, `resources`, or `concentrating` to SHEET_FIELDS in `loadState()` or `fbStartListening()`. `migrate()` owns all level-dependent fields. `getCanonicalPCs()` reads from `state.pcs` which may be demo/Level-1 data on a fresh device.

## Active Palette (Visual Redesign v2 — Soft Autumn, deployed 2026-06-14)
```
--bg:#1a0c07        near-black chocolate
--surface:#2c1a10   dark chocolate
--surface2:#3c2618  medium chocolate
--surface3:#4c3222  lighter chocolate
--gold:#b05830      cinnamon — primary accent
--gold-dim:#70381a
--gold-bright:#d07845
--red:#8b3a2a       deep chocolate red — danger
--green:#788a73     sage grey — status / success
--blue:#608278      muted sage-teal — player messages
--text:#c4a88a      warm beige body text
--text-bright:#e8d9c4  champagne beige — headings / bright text
```
*(Soft Autumn palette: chocolate bg + cinnamon accents + sage grey status + champagne text)*

---

## What to Leave Alone (stable — high regression risk)
- **Firebase sync** (`fbInit/fbStartListening/fbLoad/fbSave`) — clean, correct, leave it
- **`sendMsg()` / `buildPrompt()` core loop** — `_ctxInject` injection is elegant
- **Quick Action underlying logic** (`executeQA`, `openQASheet`) — switch dispatch + bottom-sheet is correct
- **Checkpoint / rewind stack** — `triggerChk()` call sites are all appropriate
- **OOC channel split** — two separate history arrays, separate context injection
- **TTS dual-provider layer** — browser / ElevenLabs branching is clean
- **`parseMechanics()` business logic** — 35 handlers are correct; only the if/else chain structure needs refactoring (not yet)
- **`toast()` / `mechToast()`** — stacking feed is working well

---

## Completed Work (Phase 0 + Deep Refactors)

### Quick Wins — ALL DONE 2026-06-14
- QW-1 ✅ Delete CSS Block 2 — dead weight removed
- QW-2 ✅ Delete CSS Block 1, move font vars to Block 3
- QW-3 ✅ Compact ledger default
- QW-4 ✅ storyThread confirmed out of STATE_KEYS
- QW-5 ✅ `note:` QA redirects to storyChapters[] "Field Notes"
- QW-6 ✅ QA menu grouped by category + ⭐ pinned top 3
- QW-7 ✅ Count badges on World/Session/Wagon tabs
- QW-8 ✅ AbortController + 25s timeout in callAI()
- QW-9 ✅ "⚙ Systems" → "❓ Rules"; OOC channel labels updated
- QW-10 ✅ Tab bar: AI DM first, overflow ⋮ menu for AI Tools/Dev/Setup

### Deep Refactors
- DR-1 ✅ Version-gated `migrate()` — 3-section structure, now at v11
- DR-2 ✅ `storyThread` complete elimination
- DR-3 ✅ Setup Wizard lock (`campaignLaunched` flag, SAVE_VERSION 9)
- DR-4 ✅ `callAI()` retry + provider fallback wrapper
- DR-5 ⬜ `parseMechanics()` → dispatch table registry (High risk, week+)
- DR-6 ⬜ Contracts → `state.aiContracts{}` with Firebase sync (Critical risk)
- DR-7 ✅ Rolling AI summary — `summarizeAndPrune()` at 75 messages
- DR-8 ⬜ Incremental ledger (depends on DR-5)

### Phase 0 Shipping Items — ALL DONE 2026-06-14
- ✅ Header stretch fix
- ✅ 🎲 Roll & Submit button in header
- ✅ Remove Dice Roller from Combat tab
- ✅ Remove #party-status-mini from header
- ✅ syncWorld() + syncBP() Setup↔World sync
- ✅ World tab: World State | Operations sub-tabs
- ✅ Quest + NPC dedup
- ✅ primary_mission + quest_fail mechanics
- ✅ Income/NPC/Quest contract enforcement
- ✅ OOC + party chat: live ledger on every send
- ✅ Session Summary readability
- ✅ Scroll controls: ↑↓ on all chat panels
- ✅ Story Thread ebook read mode (📖)
- ✅ Story Chronicle chapter system (SAVE_VERSION 8)
- ✅ Quest model: hidden:false default
- ✅ Module tracker (Hoard of the Dragon Queen, 8 episodes)
- ✅ Context Refresh / Re-sync protocol rework
- ✅ Level-up wizard (Fighter/Rogue/Bard L2–L5, LEVEL_UP_DATA, BARD_SPELLS)
- ✅ Canonical L3 character sync (SAVE_VERSION 10→11)
- ✅ SHEET_FIELDS double-clobber fix (loadState + fbStartListening)
- ✅ Subclass display on character cards + sheet
- ✅ Current HP editable field on sheet
- ✅ Flag context: `_buildFlagUIContext()` captures tab/channel/sub-panel at flag creation

---

## Phase 1 — Active Sprint
- [x] Context Refresh / Re-sync protocol rework
- [ ] **Visual redesign** — D&D Beyond / Demiplane mobile style (see Visual Redesign v2). CSS pass first, then nav restructure.
- [x] **Character sheet swappable tabs** — Skills / Features / Attacks / Spells / Spellbook / Gear (done 2026-06-14)
- [x] **Auto-modifier calculation** — saves + skills live-calculated from ability scores + skillProfs (done 2026-06-15)
- [x] Vite migration — src/style.css + src/main.js + lean index.html, builds to docs/ (done 2026-06-15)

### Shipped 2026-06-15
- ✅ Playwright bug fixes: header menu z-index, dead renderCards(), Firebase offline banner
- ✅ Base URL fix: /Tinklepebble/ for GitHub Pages subdirectory deployment
- ✅ Tap-to-roll ability checks in PC overview (all 6 stats + initiative)
- ✅ Roll result strip with 📨 Send to chat button in PC overview
- ✅ Save-proficiency dots on stat grid (gold ● + gold border if save is proficient)
- ✅ Proficient skills panel in PC overview — tappable pills to roll skill checks
- ✅ Auto-calculated Passive Perception from WIS + Perception prof
- ✅ XP progress bars in party list rows and PC overview
- ✅ Equipped gear tag pills in PC overview
- ✅ D&D term tooltips in narrative chat (27 terms, tap for definition popup)
- ✅ Message lock — expanded "Read more" messages stay expanded across re-renders
- ✅ Spellbook level filter tabs (dynamic per available levels)
- ✅ Bug fix: addSpell() was switching to Gear tab instead of Spellbook tab
- ✅ NPC list: sort active→departed→deceased, disposition select with color, deceased dimmed
- ✅ Quest list: sort active→failed→done, active count header, hidden toggle button
- ✅ HUD tiles: red dot for conditions, purple dot for concentration
- ✅ Party PC rows: AC displayed alongside HP
- ✅ item_add mechanic stacks quantity on exact name match (Issue 21 partial)

---

## Visual Redesign v2 — D&D Beyond / Demiplane Mobile
*Reference: ec66b7c1-Preview.html (provided 2026-06-14). Confirmed approach: CSS pass first, nav restructure second.*

**Key visual patterns:**
- Cards: `border-left: 3px solid var(--accent-brass)` + `border-radius: 8px` + drop shadow
- Header: sticky, `border-bottom: 2px solid brass`, HP vital badge left + pulse-dot AI status right
- Bottom nav: 4 tabs replacing current 9-tab top bar
- Chat bubbles: DM dark-left / player brass-right / roll result centered copper-dashed
- Action pills: horizontal scroll row above chat input (replaces FAB menu)
- D20 FAB: floating copper circle, right side, above bottom nav
- Bottom sheets: `border-top: 3px solid brass`, `border-radius: 16px 16px 0 0`, slide-up animation

**Tab mapping (9 current → 4 bottom nav):**
| Bottom Nav | Current tabs | Sub-nav preserved |
|---|---|---|
| ⚔ Adventure | AI DM | Narrative / Rules / Party OOC |
| 📦 Logistics | World + Wagon + Combat | World State / Ops / Wagon / Combat |
| 📜 Sheet | Party | PC cards + edit sheets |
| ⚙ Systems | AI Tools + Session + Dev + Setup | existing sub-tabs |

---

## Feature Backlog
*Inspired by D&D Beyond + Demiplane mobile UX. Prioritized by effort vs daily-use value.*

### Near-term
- ✅ Sheet swappable tabs — done 2026-06-14
- ✅ Auto-modifier calculation — done 2026-06-15
- ✅ Dice rolling in sheet — tap stats / attacks, roll + send to chat (done 2026-06-15)
- ✅ Chat term tooltips — 27 D&D terms, tap for popup, DM messages only (done 2026-06-15)
- ✅ Spell/inventory filter sliders — Spellbook level filter done 2026-06-15; wagon already had type filters
- **Expand term glossary** — Add 50+ more terms (class features, conditions, action types). Low effort.
- **Compendium quick-lookup** — Search bar in Rules tab or as modal; offline SRD snippets.

### Medium-term
- **Character Builder wizard** — Guided: race → class → background → stats → skills → equipment. Reuses level-up wizard architecture. Medium effort.
- **Offline Compendium snippets** — Curated rules in `state.snippets` (already exists), browseable + searchable. Conditions, spell descriptions, class features. Low-medium effort.

### Long-term / Drop-level
- **Maps** — Drop 4 (Zone combat map). Do NOT touch Combat tab until then.
- **Full offline rulebook storage** — PDFs/epubs via IndexedDB + in-document search. High effort; Drop 6–7.
- **Full spell/item compendium** — Complete SRD with school/level/class/cost filtering. Needs data pipeline. High effort.

---

## VTT Drops
- **Drop 4**: Zone combat map (replaces Combat tab entirely — do NOT refactor Combat tab)
- **Drop 5**: Shared dice feed (Firebase-wired; header 🎲 becomes entry point)
- **Drop 6**: Player View — needs World State/Operations split + state visibility audit first
  - `buildPlayerView()` computes player-safe snapshot → Firebase `/session/playerView`
- **Drop 7**: Handout/image cards (additive to Drop 6)

## State Visibility (for Drop 6)
PUBLIC: `pcs[*]` (name/color/hp/hp_max/ac/conditions — NOT backstory_secret), worldData (time/season/weather/location/scene_title/travelLog/premise/primaryMission), quests (hidden!==true), chatHistory, combat.list, treasuryData coins.
DM-ONLY: worldData.secrets/plot/timers/campaignSecrets, dmSecrets, pcs[*].backstory_secret, businessProfile.realStock/snakeOil.

Open questions (answer before Drop 6):
1. Town reputation — player-visible?
2. Income log — player-visible?
3. NPC dispositions — DM-only meta?
4. Hidden quests — DM-planted objectives?

---

## Open Gameplay Issues
4. Tab navigation on state change — ADDRESSED (tab-flash + count badges)
5. Chat log archive — DONE (summarizeAndPrune, DR-7)
6. Income/Expense Log silent — PARTIALLY ADDRESSED (detectUnloggedGold confirm-chip). Root cause: AI compliance gap, not parser.
7. NPC log silent — Same compliance pattern. Deferred until gold chip proves the pattern.
8. Quest "Primary Goal" rename — ✅ DONE (already says "Main Quest")
9. Travel Log — ✅ DONE (in Wagon tab)
15. Party chat → narrative ping — ✅ DONE (ooc_echo bar in narrative feed)
16. Message lock — ✅ DONE (2026-06-15, _expandedMsgs Set)
21. **Inventory UX overhaul** — Three interlocked problems:
    - Name truncation in party + PC inventory
    - No subcategories/grouping (wagon cargo has filter tabs; party inventory has nothing)
    - Semantic duplicate gap (e.g. "Sedative Bolt" vs "Tranquilizer Darts" created as separate items). Need fuzzy dedup at item_add: similar to npc_add dedup.

---

## Recurring AI Failure Patterns
**Pattern 1 — State Drift:** AI narrates events but doesn't emit matching mechanics lines. Root cause: AI compliance gap, not parser. Fix: `detectUnloggedGold()` confirm-chip at point of miss. Extend to items/NPCs later.
**Pattern 2 — Navigation Blindness:** State changes in background tabs not visible. Fix: tab-flash + count badges (shipped).

---

## Key Redundancies (to resolve)
1. `state.worldData.premise` — written by Setup→Session Zero AND World tab textarea
2. `state.worldData.setting` — written by Setup AND World tab
3. Business Profile — Setup step 3 AND World tab bp_* panel
Fix: Setup steps become deep-links into World tab when `campaignLaunched`.

---

## Dead Code / Bug Fixes Log
- Theme editor block — REMOVED 2026-06-14
- CSS Blocks 1 & 2 — REMOVED 2026-06-14
- `state.storyThread` — ELIMINATED 2026-06-14
- ⋮ overflow menu clipping — FIXED 2026-06-14
- Header menu stuck-open on mobile — FIXED 2026-06-14
- Flag context blind spot — FIXED 2026-06-14 (`_buildFlagUIContext()`)
- Canonical L3 character sync — DONE 2026-06-14 (SAVE_VERSION 10→11)
- SHEET_FIELDS double-clobber — FIXED 2026-06-14 (both loadState + fbStartListening)
- Subclass display on cards + sheet — DONE 2026-06-14
- Current HP field on sheet — DONE 2026-06-14

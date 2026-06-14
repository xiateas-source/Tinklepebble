# Tinkle's Tinctures — Dev Roadmap

## Critical User Rule
**Ask for confirmation before implementing** changes that:
- Touch Firebase config, STATE_KEYS, SAVE_VERSION, or save() structure
- Change the data model in a breaking way
- Are large refactors (50+ lines changed)
- Could corrupt existing save data

Routine UI, copy, CSS, patch notes, roadmap updates, and dead code removal can proceed without asking.

## App Architecture Notes
- Single HTML file (`index.html`) — all CSS, JS, HTML inline
- GitHub Pages deployment from `main` branch
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` object persisted to `localStorage('tt_v1')` and Firebase
- Multiple stacked `:root` CSS blocks — the LAST one wins (currently ~line 966)
- Multiple stacked CSS class overrides — last one wins. Pattern throughout file.
- Light/dark theme via `body.light-mode` + `localStorage('tt_theme_mode')`
- `SAVE_VERSION=7`; `migrate(s)` patches loaded state on version changes
- `renderAll()` is central render; `renderChat()` renders narrative chat

## Active Palette (dark, final :root block ~line 966)
```css
--bg:#2c1d1a; --surface:#3b2b24; --surface2:#4a3b39; --surface3:#5a4a46;
--border:#4a3530; --border-bright:#6a5048;
--gold:#c8a06a; --gold-dim:#8a6040; --gold-bright:#e8c898;
--text:#cbbba0; --text-dim:#8a7060; --text-bright:#f2efe9; --cream:#f2efe9;
```

## Phase 0 — Current Sprint (cleanup before building)
- [x] Header stretch fix — neutralized stacked dark CSS overrides
- [x] 🎲 Roll & Submit button in header (one-tap from any tab)
- [x] Remove simple Dice Roller panel from Combat tab (rollDie() deleted)
- [x] Remove #party-status-mini from header (cleaner utility toolbar)
- [x] Redundancy fix: syncWorld() + syncBP() keep Setup fields in sync with World tab
- [x] World tab: World State | Operations sub-tabs (showWorldTab() JS function)
- [x] Quest dedup: quest_add skips if near-identical quest already exists
- [x] NPC dedup: npc_add updates existing NPC instead of creating duplicate
- [x] primary_mission: mechanic command added — AI can now set main quest
- [x] quest_fail: mechanic command added
- [x] Income/NPC/Quest drift: contracts rewritten with strict no-exceptions rules
- [x] OOC + party chat: now inject live ledger on every send (was using stale history)
- [x] AI Sync panel: Context Refresh vs Re-sync guidance added to AI Tools tab
- [x] Session Summary: min-height 300px, font-size 13px
- [x] Story Thread: min-height 380px, font-size 13px
- [x] Module tracker: Campaign Progress panel in Session → Module
- [x] module_episode: mechanic — AI advances/completes episodes, UI updates live
- [ ] Travel Log full rework (see Gameplay Issues #14) + merge with Town Reputation
- [x] Scroll controls: ↑ Top / ↓ Bottom on Narrative, Story Thread, OOC, Party — all standardized
- [x] Story Thread read mode: 📖 toggle renders ebook view with collapsible TOC + chapter sections
- [x] Story Thread Option B: structured chapter objects {title, content, date}, AI mechanic to add/update chapters, full data model upgrade — DONE 2026-06-14 (SAVE_VERSION 8, storyChapters[], chapter_add/chapter_update mechanics, ✨ Chapter button, legacy migration)
- [x] Quest model: hidden:false default — backfilled in migrate(), addQuest(), quest_add mechanic, demo state

## Context Refresh / Re-sync Protocol — DONE 2026-06-14
**Architecture (implemented):**
- Context Refresh → queues scene snapshot in _ctxInject, appended silently to next sendMsg() system prompt
- Re-sync AI State → injects full ledger via _ctxInject + fires [STATE RESYNC] confirmation message in main chat
- OOC questions → OOC channel (live ledger injected on every send)

**Definitions (in UI):**
- Context Refresh = tap the DM on the shoulder. AI forgot what room you're in, wrong weather, wrong name once. Light nudge, use first.
- Re-sync AI State = hand the DM all their notes. Wrong HP, starting new session, major drift. Full ledger, escalate only.

## Phase 1 — Pre-Drop 4
- [x] Context Refresh / Re-sync protocol rework — DONE 2026-06-14. Both now route to main narrative chat via _ctxInject system prompt injection.
- [ ] Vite migration (single file → component structure before Drop 4 adds complexity)

## VTT Drops
- **Drop 4**: Zone combat map (replaces current Combat tab entirely — do NOT refactor Combat tab)
- **Drop 5**: Shared dice feed (Firebase-wired; header 🎲 becomes entry point)
- **Drop 6**: Player View (needs World State|Operations split + state visibility audit first)
  - `buildPlayerView()` computes player-safe snapshot → Firebase `/session/playerView`
  - State visibility classifications (see below)
- **Drop 7**: Handout/image cards (additive to Drop 6)

## State Visibility (for Drop 6)
PUBLIC (player-visible):
- pcs[*]: name, color, hp, hp_max, ac, conditions (NOT backstory_secret)
- worldData: time, season, weather, location, scene_title, travelLog, premise, primaryMission
- quests: all WHERE hidden !== true
- chatHistory: full narrative feed
- combat.list: initiative + HP during combat
- treasuryData: gp/pp/sp/cp/ep

DM-ONLY:
- worldData.secrets, worldData.plot, worldData.timers, worldData.campaignSecrets
- dmSecrets, pcs[*].backstory_secret
- businessProfile.realStock, businessProfile.snakeOil

Open questions (answer before Drop 6):
1. Town reputation — player-visible? (they'd know their own rep)
2. Income log — player-visible? (they know what they sold)
3. NPC dispositions — player-visible or DM-only meta?
4. Hidden quests — DM-planted objectives players shouldn't see?

## Gameplay Issues (from 2026-06-14 debrief)
4. **Tab navigation on state change** — When AI adds item to wagon/logs income, should auto-navigate or flash the relevant tab so DM knows something happened.
5. **Chat log archive/export** — Need auto-archive for old chat logs. Long sessions overflow. Consider chapter-based auto-archiving.
6. **Income/Expense Log silent** — PARTIALLY ADDRESSED 2026-06-14. CORRECTED DIAGNOSIS: the parser is NOT the problem. `parseMechanics()` has working `income:`/`expense:`/`gp:+X` handlers that log to incomeLog AND adjust GP correctly. Root cause is purely an AI compliance gap: the AI narrates "you earn 8 gold" in prose but omits the `income:` line. Fix shipped: `detectUnloggedGold()` scans AI prose for gold amounts with no matching mechanic and surfaces a one-tap "💰 Log X gp?" confirm chip in the changelog feed (reuses mechToast container, calls existing income plumbing). No new parser needed. NOTE: this supersedes the "[STATE] block" proposal in Pattern 1 below — that was aimed at the wrong layer.
7. **NPC log silent** — Same compliance pattern (AI introduces NPC in prose, forgets npc_add). Parser works; npc_add handler is functional. Confirm-chip approach from #6 could extend to NPCs, but prose→NPC detection is noisier than gold (any proper noun could be an NPC), so deferred until gold chip proves the pattern in play. Contract addition (check NPC log before introducing) already shipped 2026-06-14.
8. **Quest "Primary Goal" rename** — Should be "Main Quest". Story-driven, set by the campaign itself, not manually entered.
9. **Travel Log location** — Should move to Wagon tab (already planned in merge).
10. **Session Summary readability** — DONE 2026-06-14. min-height 300px, font-size 13px.
11. **Story Thread readability** — DONE 2026-06-14. Enlarged text/height, scroll controls, ebook 📖 Read mode with collapsible TOC and chapter sections (replaces session divider request).
12. **AI DM scroll buttons** — DONE 2026-06-14. ↑ Top / ↓ Bottom row added above Narrative chat, matching OOC/Party style.
13. **Story Thread scroll buttons** — DONE 2026-06-14. ↑ Top / ↓ Bottom in panel title bar.
14. **Travel Log full rework** — Needs: visual map layer, day-progress pushable bar, higher placement in tab hierarchy. This is a significant feature (log as a separate note for Drop 4+).
15. **Party chat → narrative ping** — When player sends message in party chat, ping/notify the AI DM narrative.
16. **Message lock on new prompt** — Reading a message while someone else prompts closes out the open message. Must stay open until explicitly closed.
17. **OOC "Ask DM" context drift** — FIXED 2026-06-14. Root cause: OOC was only sending last 10 OOC messages, no live ledger. AI answered from stale snapshot (last resync at Greenest, party had moved to Cleft of Sighs). Fix: live ledger now injected into OOC + party chat system prompt on every send.
18. **Module tracker** — DONE 2026-06-14. Campaign: "Hoard of the Dragon Queen" (Baur & Winter). Session → Module tab. 8 episodes pre-filled, status toggles, % bar, per-episode notes, AI updates via module_episode: mechanic.
19. **Context Refresh / Re-sync routing** — FIXED 2026-06-14. Context Refresh queues a scene snapshot via _ctxInject, appended silently to next sendMsg() system prompt. Re-sync injects full ledger same way + fires forced acknowledgment message in main chat.
20. **Live save export diagnosis (2026-06-14)** — Confirmed from state export: 21 quests all active (0 completed), income log had 2 entries despite significant play, primary mission still PENDING, Myrna added twice. Fixes applied: quest/NPC dedup, primary_mission mechanic, income contract enforcement.

## Recurring AI Failure Patterns (2026-06-14 debrief)
**Pattern 1 — State Drift:** AI narrates events (NPC introduced, item found, gold earned) but does NOT emit the matching mechanics line. Income log, NPC log, and quest log all stayed empty despite active gameplay.
⚠ DIAGNOSIS CORRECTED 2026-06-14: The parser is fine — `income:`, `expense:`, `gp:`, `item_add:`, `npc_add:` all work end to end. This is an AI *compliance* gap, not a parsing gap. The "[STATE] block the app parses" idea below was aimed at the wrong layer and is SUPERSEDED.
✅ Actual fix (shipped): a confirm-chip layer that catches the miss at the moment it happens. `detectUnloggedGold()` compares AI prose against what was logged and offers a one-tap confirm. Same approach can extend to items/NPCs later. The lever is the moment-of-miss UX, plus contract reminders — not new parse infrastructure.

~~Original proposal (kept for history, do NOT build):~~ Add a structured "State Changes:" block in AI output that the app parses. — Redundant; the mechanics block already is that, and it already parses.

**Pattern 2 — Navigation Blindness:** Modifications made via chat (item added to wagon) don't surface to the DM visually. DM has to know to go check another tab. Fix: After AI-triggered state updates, auto-navigate or flash indicator to the affected tab.

**Suggested System Prompt Change:** Add a required output block:
```
[STATE] npc_add: {name, location, disposition} | item_add: {name, qty} | income: {amount, source} | quest_update: {id, status}
```
App parses `[STATE]` lines and applies updates silently after each AI response. This makes state sync mechanical, not AI-optional.

## Key Redundancies Identified
1. `state.worldData.premise` written by Setup→Session Zero AND World tab w_premise textarea
2. `state.worldData.setting` written by Setup→World AND World tab w_setting textarea
3. Business Profile: Setup step 3 (fewer fields) AND World tab bp_* panel (full fields)
   → Fix: Setup steps become deep-links into World tab. One source of truth.

## Architecture Warnings
- Do NOT refactor Combat tab — Drop 4 replaces it entirely
- State visibility split is prerequisite for Drop 6
- World tab Operations split is prerequisite for Drop 6 DM control surface
- Vite migration should happen before Drop 4

## Visual Redesign — Steampunk Fantasy
*(from dev_visual_redesign flag, logged 2026-06-13)*

**Palette (target):**
```
body: #1a0f00 → #2a1a05 radial gradient
surface: #2d1f0a / #3a2812 / #4a3520
gold: #c8a850 / #e8c870
text: #d4b896 / #a08060
```

**Textures (pure CSS, no images):**
- body: `repeating-linear-gradient` noise over dark radial
- panels: inset `box-shadow` + subtle gradient
- borders: 1px gold-dim + outer glow
- corner accents: `::before`/`::after` with `clip-path` triangles

**Tab icons:**
Party=⚔ World=🌍 Wagon=🛞 Combat=💀 Session=📜 AI Tools=🔮 AI DM=🧙 Dev=⚙ Setup=🏛

**Portrait frames:** circular `clip-path` colored div using `pc.color`, class initial or emoji as icon. No images needed.

**Component order (est. one session):**
1. CSS variables + body (30m)
2. Header + tab bar with icons (30m)
3. Character cards + circular portrait frames (45m)
4. Panel borders + corner ornaments (30m)
5. Chat UI + badges (20m)
6. Buttons + inputs (20m)

**Constraint:** Single CSS pass only. No external fonts, no images. All texture via CSS gradient patterns.

## Dead Code
- Theme editor block — REMOVED 2026-06-14 (63 lines deleted): `THEME_VARS`, `DEFAULT_THEME`, `THEME_PRESETS`, `applyTheme()`, `setThemeVar()`, `syncThemeColor()`, `applyThemePreset()`, `resetTheme()`, `toggleThemeEditor()`, `renderThemeEditor()`, `copyThemeCSS()`

# Tinkle's Tinctures — Dev Roadmap

## Critical User Rule
**Ask for confirmation before implementing** changes that:
- Touch Firebase config, STATE_KEYS, SAVE_VERSION, or save() structure
- Change the data model in a breaking way
- Are large refactors (50+ lines changed)
- Could corrupt existing save data

Routine UI, copy, CSS, patch notes, roadmap updates, and dead code removal can proceed without asking.

## App Architecture Notes
- Single HTML file (`index.html`) — all CSS, JS, HTML inline (~7,300 lines)
- GitHub Pages deployment from `main` branch
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` object persisted to `localStorage('tt_v1')` and Firebase
- Three stacked `:root` CSS blocks — LAST one wins (Block 3 at line 971). Block 1 (line 13) and Block 2 (line 341) are dead weight pending cleanup (see Architectural Refactor Plan)
- `SAVE_VERSION=8`; `migrate(s)` patches loaded state — currently unconditional (no version gates); refactor to gated engine is in the plan
- `renderAll()` is central render; `renderChat()` renders narrative chat
- `callAI()` — AbortController + 25s timeout added (QW-8 ✅); full retry/fallback in Deep Refactor #4
- AI contracts read from DOM via `document.getElementById()?.value` — fragile (contracts-to-state migration planned)

## Active Palette (dark, final :root block ~line 971)
```css
--bg:#2c1d1a; --surface:#3b2b24; --surface2:#4a3b39; --surface3:#5a4a46;
--border:#4a3530; --border-bright:#6a5048;
--gold:#c8a06a; --gold-dim:#8a6040; --gold-bright:#e8c898;
--text:#cbbba0; --text-dim:#8a7060; --text-bright:#f2efe9; --cream:#f2efe9;
```

---

## ⚠ SECURITY CONSTRAINT (non-negotiable, permanent)
**Slasher (Black Dragonborn Fighter) must NEVER learn the operation is a con.**
This rule lives in Contract 1 (`#ai-persona`):
> *"He does not know the operation is a con. Never tell him."*

This fragment must survive every refactor verbatim. When contracts-to-state migration happens, `buildPrompt()` must validate this fragment before every send and throw a hard error if it's missing.

---

## What to Leave Alone (stable systems — do not refactor)
These are correct, battle-tested, and carry high regression risk if touched:
- **Firebase sync** (`fbInit/fbStartListening/fbLoad/fbSave`) — clean, correct, leave it
- **`sendMsg()` / `buildPrompt()` core loop** — the central engine works; `_ctxInject` injection is elegant
- **Quick Action underlying logic** (`executeQA`, `openQASheet`) — switch dispatch + bottom-sheet is correct
- **Checkpoint / rewind stack** — `triggerChk()` call sites are all appropriate
- **OOC channel split** — two separate history arrays, separate context injection — architecture is right
- **TTS dual-provider layer** — browser / ElevenLabs branching is clean
- **`parseMechanics()` business logic** — the 35 handlers are correct; only the *structure* (if/else chain) needs refactoring, not the logic inside each branch
- **`toast()` / `mechToast()`** — stacking feed is working well

---

## Architectural Refactor Plan (2026-06-14)
*Full analysis performed by Claude acting as Principal Software Engineer/Systems Architect. Four phases: dead weight, resilience, performance, UI/UX.*

### Quick Wins (high impact, low risk — no core engine changes) — ALL DONE 2026-06-14

| # | Status | Change | Notes |
|---|---|---|---|
| QW-1 | ✅ | Delete CSS Block 2 (lines 341–345) | Pure dead weight — 5 lines, zero risk |
| QW-2 | ✅ | Move `--sans`/`--mono`/`--serif` to Block 3, delete Block 1 (lines 13–33) | Font vars moved to Block 3 first, then Block 1 deleted |
| QW-3 | ✅ | Make Compact the default ledger mode | select default + label text updated |
| QW-4 | ✅ | `storyThread` confirmed never in STATE_KEYS; comment added | storyChapters already in its place |
| QW-5 | ✅ | Redirect `note:` QA action to append to `storyChapters[]` "Field Notes" | eliminates parallel write to orphaned storyThread |
| QW-6 | ✅ | QA menu grouped by category (Party & Combat / World & Story / AI & System) + ⭐ Pinned top 3 | pinned: Save Game, Roll & Submit, Context Refresh |
| QW-7 | ✅ | Count badges on World/Session/Wagon tabs | `_tabBadgeCounts`, `flashTab()` increments, `showTab()` clears |
| QW-8 | ✅ | `AbortController` + 25s timeout in `callAI()` | throws user-readable message on AbortError |
| QW-9 | ✅ | `⚙ Systems` → `❓ Rules`; OOC channel labels updated | confirm dialog + placeholder text updated too |
| QW-10 | ✅ | Tab bar reordered: AI DM first, AI Tools/Dev/Setup in ⋮ overflow menu | 6 play tabs always visible; overflow closes on outside-click |

### Deep Refactors (structural — execute in this order)

**1. Version-gated `migrate()` — prerequisite for everything else**
- Current: all patches run unconditionally. Refactor to `if(savedVer < N)` sequential gates.
- Skeleton: `if(savedVer < 7){...all current patches...}` → `if(savedVer < 8){storyChapters init}` → `if(savedVer < 9){delete storyThread, seed aiContracts}`
- Test against actual v5/v6/v7 save exports before shipping.
- `[Severity: High] [Complexity: Hours] [Risk: Low]`

**2. `storyThread` complete elimination (v9 gate)**
- Depends on: #1 (version-gated migrate)
- Steps: v9 migrate gate deletes field → remove from STATE_KEYS → remove renderSheets() line 3390 → remove renderStoryRead() fallback → remove from reset + demo state
- `[Severity: Medium] [Complexity: Hours] [Risk: Low]`

**3. Setup Wizard lock (`campaignLaunched` flag)**
- Depends on: #1 (to backfill `campaignLaunched: false` for existing saves)
- Add `state.campaignLaunched`; post-launch: Setup shows read-only view + deep-link buttons to World/Wagon tabs; gated "Re-open Setup" escape hatch
- `[Severity: Low] [Complexity: Hours] [Risk: Low]`

**4. `callAI()` retry + provider fallback wrapper**
- Depends on: nothing structural; but extract `callGoogle()` / `callOpenRouter()` as standalone functions first
- Add: `AbortController` (25s timeout), exponential backoff (1.2s → 2.4s, max 2 retries), provider fallback to OpenRouter on 5xx, user-facing status ("Retrying… / Switching provider… / Failed")
- ⚠ `RETRY_CODES` must NOT include 401/403 — never retry auth failures
- Fallback model: hardcode `meta-llama/llama-3.1-8b-instruct:free` for fallback (not user's saved OR model, which may also be over-quota)
- `[Severity: High] [Complexity: Days] [Risk: Low — additive only]`

**5. `parseMechanics()` → dispatch table registry**
- Depends on: nothing; but do before #6 (contracts-to-state adds a new validation handler)
- Refactor 230-line if/else to `const MECH_HANDLERS = { hp: (val, changes) => {...}, ... }`
- Keep `_parseMechanicsLegacy()` in codebase during transition; run both in parallel on a test build; delete legacy only after output matches 100% against real AI response corpus
- Unknown keys: no-op in prod; `console.warn` when `localStorage('tt_dev_mode') === '1'`
- `[Severity: Medium] [Complexity: Week+] [Risk: High — 35 handlers, regression is silent]`

**6. Contracts → `state.aiContracts{}` with Firebase sync**
- Depends on: #1 (version-gated migrate to seed values), #4 (callAI resilience before removing DOM fallback)
- Add `state.aiContracts = {persona, never, actions, continuity, multi}` to state + STATE_KEYS
- Migrate v9 gate: seed from DOM on first load if missing
- Textareas become bidirectional: `oninput` writes to state; `renderAll()` populates from state
- `buildPrompt()` reads from `state.aiContracts.*` — no more DOM reads
- **REQUIRED**: validate security fragment before every send: `if(!state.aiContracts.persona?.includes("He does not know the operation is a con")) throw new Error("SECURITY VIOLATION")`
- Rollback: revert `buildPrompt()` to `g()` DOM reads; state.aiContracts stays as backup
- `[Severity: Critical] [Complexity: Days] [Risk: Medium — bidirectional sync must debounce; Firebase listener must not overwrite in-flight edit]`

**7. Rolling AI summary (non-destructive chat archive)**
- Depends on: #4 (callAI resilience — summary call must be fail-safe; never prune if summary fails)
- At 75 messages: fire background `callAI()` for 2-3 sentence "Previously on…" summary → store as `state.prevSessionSummary` → inject into `buildPrompt()` → prune oldest 30 messages ONLY after successful summary
- If summary call fails: do NOT prune; retry on next save cycle
- `state.prevSessionSummary` added to STATE_KEYS; injected before ledger in buildPrompt()
- Addresses Gameplay Issue #5 (chat log archive)
- `[Severity: High] [Complexity: Days] [Risk: Medium — must never prune without confirmed summary]`

**8. Incremental ledger (dirty-flag optimization)**
- Depends on: #5 (dispatch table — each handler marks its section dirty)
- Add `state._ledgerDirty = {party, world, treasury, npcs, quests, wagon, combat}` to state (not synced to Firebase)
- Each MECH_HANDLER marks relevant section dirty on fire
- `genLedger()` caches each section's string; only rebuilds dirty sections per call
- Add a fourth "Narrative" mode (~1,200 tokens): party + world + NPCs + quests, no treasury/wagon
- `[Severity: Medium] [Complexity: Days] [Risk: Low — additive; cache miss just rebuilds the section]`

### Risk Register

| Change | What Could Break | Rollback Path | Safeguard |
|---|---|---|---|
| Contracts → state | `aiContracts.persona` seeds empty → AI loses guardrails silently | Revert `buildPrompt()` to DOM reads; keep state.aiContracts as backup | Hardcode `DEFAULT_CONTRACTS` constant fallback; validate security fragment before every send |
| Version-gated migrate() | Wrong gate placement corrupts old saves | Keep old migrate() in git; export real saves from v5/v6/v7 before deploying | Run against test save corpus before shipping |
| callAI() retry wrapper | Retry on 401/403 wastes credits with 3 calls instead of 1 | Revert to single fetch | `RETRY_CODES` must exclude 401/403; test auth-failure path independently |
| storyThread deletion (v9) | User who missed v8 Prologue migration loses storyThread content permanently | v8 (convert) must run before v9 (delete) — gate order is critical | `console.warn` if v9 fires with non-empty storyThread and no matching chapters |
| parseMechanics() dispatch | Porting 35 handlers introduces silent regression | Keep `_parseMechanicsLegacy()` during transition; diff output against corpus | Run both implementations against real AI response logs before removing legacy |

---

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
- [x] Story Thread Option B: structured chapter objects {title, content, date}, AI mechanic to add/update chapters — DONE 2026-06-14 (SAVE_VERSION 8, storyChapters[], chapter_add/chapter_update mechanics, ✨ Chapter button, legacy migration)
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
4. **Tab navigation on state change** — ADDRESSED. Tab-flash + mechToast stacking feed. Count badges (QW-7) will improve further.
5. **Chat log archive/export** — PLANNED. Rolling AI summary approach (Deep Refactor #7). At 75 messages, background AI call generates "Previously on…" stored as `state.prevSessionSummary`, oldest 30 pruned only after successful summary.
6. **Income/Expense Log silent** — PARTIALLY ADDRESSED 2026-06-14. Root cause is AI compliance gap. Fix shipped: `detectUnloggedGold()` catches prose-level mentions. No new parser needed.
7. **NPC log silent** — Same compliance pattern. Contract addition shipped. Confirm-chip approach deferred until gold chip proves the pattern in play.
8. **Quest "Primary Goal" rename** — Should be "Main Quest". Story-driven, set by the campaign itself, not manually entered.
9. **Travel Log location** — Should move to Wagon tab (already planned in merge).
10. **Session Summary readability** — DONE 2026-06-14. min-height 300px, font-size 13px.
11. **Story Thread readability** — DONE 2026-06-14. Enlarged text/height, scroll controls, ebook 📖 Read mode with collapsible TOC and chapter sections.
12. **AI DM scroll buttons** — DONE 2026-06-14. ↑ Top / ↓ Bottom row added above Narrative chat.
13. **Story Thread scroll buttons** — DONE 2026-06-14. ↑ Top / ↓ Bottom in panel title bar.
14. **Travel Log full rework** — Needs: visual map layer, day-progress pushable bar, higher placement in tab hierarchy. Significant feature (Drop 4+ candidate).
15. **Party chat → narrative ping** — When player sends message in party chat, ping/notify the AI DM narrative.
16. **Message lock on new prompt** — Reading a message while someone else prompts closes out the open message. Must stay open until explicitly closed.
17. **OOC "Ask DM" context drift** — FIXED 2026-06-14. Live ledger now injected into OOC + party chat system prompt on every send.
18. **Module tracker** — DONE 2026-06-14.
19. **Context Refresh / Re-sync routing** — FIXED 2026-06-14.
20. **Live save export diagnosis (2026-06-14)** — Fixes applied: quest/NPC dedup, primary_mission mechanic, income contract enforcement.

## UI/UX Issues (from 2026-06-14 architectural review)
- **Tab order** — AI DM is tab #7 of 9; it's the primary interface and should be first. AI Tools, Dev, Setup should move to ⋮ menu. (QW-10)
- **QA FAB at 23 actions** — Context filtering helps but grouping by category + pinning top 3 is the short-term fix (QW-6). Long-term: command palette pattern when action count exceeds ~30.
- **Tab-flash is directional but not quantitative** — Count badge on affected tabs (QW-7) is the fix. Same pattern as existing party badge.
- **Three-channel DM tab names** — "⚙ Systems" → "❓ Rules" (legible without TTRPG background). "🗨️ OOC" → "💬 Party" (consistent with badge label). (QW-9)
- **Channel-switching is a secondary nav layer** — Cross-channel activity strip above Narrative input (when Rules/Party message arrives while in Narrative, show a dismissible one-liner) would reduce forced channel switches.
- **Session tab has 3 sub-tabs** — "Module" should be a separate tab; "Between Sessions" prep content should be a DM prep modal not a play-time sub-tab.

## Recurring AI Failure Patterns
**Pattern 1 — State Drift:** AI narrates events but does NOT emit matching mechanics lines.
⚠ DIAGNOSIS CORRECTED 2026-06-14: Parser is fine. This is an AI compliance gap.
✅ Fix shipped: `detectUnloggedGold()` confirm-chip catches gold misses.

**Pattern 2 — Navigation Blindness:** State changes in background tabs aren't visible. Tab-flash + count badges (QW-7) address this.

## Key Redundancies Identified
1. `state.worldData.premise` written by Setup→Session Zero AND World tab w_premise textarea → Fix: campaignLaunched lock (Deep Refactor #3)
2. `state.worldData.setting` written by Setup→World AND World tab w_setting textarea → same fix
3. Business Profile: Setup step 3 AND World tab bp_* panel → same fix
4. `state.storyThread` AND `state.storyChapters[]` — parallel structures → storyThread elimination (Deep Refactor #2)

## Architecture Warnings
- Do NOT refactor Combat tab — Drop 4 replaces it entirely
- State visibility split is prerequisite for Drop 6
- World tab Operations split is prerequisite for Drop 6 DM control surface
- Vite migration should happen before Drop 4
- Any new `state` field must be consciously evaluated for `STATE_KEYS` (Firebase sync) vs device-local

## Visual Redesign — Steampunk Fantasy
*(from dev_visual_redesign flag, logged 2026-06-13)*
*(user: "remove, don't mention again unless i do")*

## Dead Code
- Theme editor block — REMOVED 2026-06-14 (63 lines deleted)
- CSS Block 1 (lines 13–33) — REMOVED 2026-06-14 (QW-2 ✅)
- CSS Block 2 (lines 341–345) — REMOVED 2026-06-14 (QW-1 ✅)
- `state.storyThread` — orphaned string field; pending v9 migrate gate deletion (Deep Refactor #2)


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

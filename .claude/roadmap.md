# Tinkle's Tinctures — Dev Roadmap

## Critical User Rule
**Always ask for confirmation before implementing.** Present the plan, wait for go-ahead.

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
- [ ] Redundancy fix: Premise/Setting — Setup deep-links to World tab fields
- [ ] Redundancy fix: Business Profile — Setup step 3 redirects to World tab bp panel
- [ ] Travel Log full rework (see Gameplay Issues #14) + merge with Town Reputation
- [ ] World tab: split into "World State" | "Operations" sub-tabs
      - World State: time, season, weather, illumination, location, description, scene title/threat/condition
      - Operations: plot threads, timers, DM secrets, session notes, story thread
- [ ] Quest + Plot + Timers: tabbed panel (Quests | Plot | Timers)
- [ ] Quest model: rename "Primary Goal" → "Main Quest"; add hidden:false default field
- [ ] Session Summary + Story Thread: larger boxes, better readability, chapter/session dividers
- [ ] Scroll controls: standardize top/bottom buttons across AI DM, Story Thread, OOC, system chats
- [ ] Income/Expense Log: diagnose why not auto-populating from gameplay
- [ ] NPC log: diagnose why not auto-updating from gameplay

## Phase 1 — Pre-Drop 4
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
6. **Income/Expense Log silent** — Not populating from gameplay. AI narrates transactions but doesn't call log functions. Root cause: AI compliance gap or missing function calls in system prompt.
7. **NPC log silent** — Same pattern. AI introduces NPCs in narrative but doesn't call state-update functions to persist them.
8. **Quest "Primary Goal" rename** — Should be "Main Quest". Story-driven, set by the campaign itself, not manually entered.
9. **Travel Log location** — Should move to Wagon tab (already planned in merge).
10. **Session Summary readability** — Boxes too small. Needs larger textarea, better font sizing.
11. **Story Thread readability** — Needs session/chapter dividers, larger text, scroll controls.
12. **AI DM scroll buttons** — Need to match OOC and system chat scroll-to-top/bottom style.
13. **Story Thread scroll buttons** — Add scroll to top/bottom.
14. **Travel Log full rework** — Needs: visual map layer, day-progress pushable bar, higher placement in tab hierarchy. This is a significant feature (log as a separate note for Drop 4+).
15. **Party chat → narrative ping** — When player sends message in party chat, ping/notify the AI DM narrative.
16. **Message lock on new prompt** — Reading a message while someone else prompts closes out the open message. Must stay open until explicitly closed.
17. **OOC chat malfunction** — Reported 2026-06-14, behavior TBD (under active testing). Fill in details after session.
18. **Module tracker** — Campaign: "Hoard of the Dragon Queen" (Baur & Winter). Tracker in Session → Module sub-tab. Episodes as chapter markers, status per episode (Not Started / In Progress / Complete), % progress bar, DM notes per episode, active episode wired to Main Quest display. Lives in state.moduleProgress[]. No book text reproduced — episode names only.

## Recurring AI Failure Patterns (2026-06-14 debrief)
**Pattern 1 — State Drift:** AI narrates events (NPC introduced, item found, gold earned) but does NOT call state-update functions. Income log, NPC log, and quest log all stayed empty despite active gameplay. Fix: Add explicit "State Enforcement" section to system prompt. After EVERY NPC interaction → addNPC(). After EVERY item obtained → update wagon. After EVERY gold transaction → log income. Consider a structured "State Changes:" block in AI output that the app parses.

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

## Dead Code (safe to remove anytime)
- Theme editor functions: `THEME_VARS`, `DEFAULT_THEME`, `THEME_PRESETS`, `applyTheme()`,
  `setThemeVar()`, `syncThemeColor()`, `applyThemePreset()`, `resetTheme()`,
  `toggleThemeEditor()`, `renderThemeEditor()`, `copyThemeCSS()` — not called anywhere

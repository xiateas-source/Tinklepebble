# Session Log — Handoff Note

## Session 14 · 2026-06-17

### Shipped
- **Code review bug fixes (9)** — strict fuzzy match (edit-distance, no substring), fog hidden zone rendering, pin drag pointer capture, CSQ_COLORS reference (2 instances), `_getAreaMap` caching
- **Wagon cargo/hoard chip UX** — shared `_renderInvChips()` function, filter bar with counts, tap-to-expand inline editor, matches party inventory layout
- **5 combat quick wins**
  - Inline HP +/- preset buttons on active character card (with custom input field)
  - `_injectTurnCtx()` — injects turn context into next AI message via `_ctxInject`
  - Concentration check on HP damage (auto-alert if concentrating PC takes damage)
  - `COMBAT_ONLY_CONDS` — Prone/Grappled/Restrained auto-clear on endCombat; persistent conditions synced back to PC sheets
  - `sendContextRefresh()` now includes full combat zone grid + PC HP/conditions
  - Death save tracker on active card when PC at 0 HP
  - Quick condition dropdown on active card
- **Map pin UX overhaul**
  - Tap pin → highlight + action bar below map (Move / Unpin / Details)
  - `unpinFromMap(locId)` — remove individual pin without deleting map
  - `movePin(locId)` — single-function move, avoids mid-handler DOM destruction
  - Chip ✕ affordances for unplacing from toolbar
  - "Unplace" button added to location detail sheet

### Decisions Made
- Pin popover replaced with bottom action bar (popover was clipped by overflow:hidden)
- `movePin()` as single function instead of chained `setLocView→startMapPlace` (DOM destruction between renders)
- Fuzzy match now requires ≤2 chars length difference AND ≤1 char positional mismatch (no substring)

### Known Issues
- Flag 13 still open: treasure log audit / duplicate loot detection
- 14 new gameplay flags from ops debrief (see roadmap for categorized list)
- `state.worldData.plot/timers` fields orphaned — data still in state but no UI

### In Progress
- Nothing actively in progress — all committed and deployed

### Next Up (from ops debrief analysis)
- **Multi-category items** (Flag 2) — items can be both "foraged" and "ingredient"
- **Encumbrance tracking** (Flag 14) — weight calc + AI awareness in genLedger
- **Cantrip level-0 display** (Flag 3) — spellbook treats cantrips as level 0
- **Expertise in skill calc** (Flag 8) — double proficiency bonus for expertise skills
- **Treasure audit inline** (Flag 4/13) — dedup/audit from income log dropdown
- **Context strip carousel** (Flag 11) — tap to cycle: location → character → quest → module
- **Per-PC inventory access from Cargo tab** (Flag 13) — character buttons in Cargo view
- **OOC accuracy** (Flag 6) — OOC channel getting narrative details wrong
- **Quest→Chapter linking** (Flag 5/9) — quest announcements create chapters, chapter↔module correlation
- **Familiar/animal home** (Flag 10) — where companions live in the app
- **Quest log UX refresh** (Flag 12)

### Branch State
- Branch: `claude/new-session-rvx6tn`
- In sync with main (all merged)
- Last commit: `12fe190` (Fix Move pin)

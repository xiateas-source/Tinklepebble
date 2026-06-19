# Session Log — Handoff Note

## Session 23 · 2026-06-19

### Shipped
- **Level-up wizard auto-open** — Wizard now opens automatically after mechanics parse, page load, and Firebase sync (not just Long Rest button). Added `_autoOpenLevelUp()` helper.
- **Multi-level XP jump fix** — `applyLevelUp()` re-runs `checkLevelUp` after each level so a PC with enough XP for multiple levels advances through them sequentially (e.g., Lv1→2→3).
- **Skip button fix** — Spell Swap step's "Skip →" button was broken (module-scoped `_luWiz` in inline onclick). Replaced with exposed `_luSkipSwap()` function.
- **Level-up debug logging** — `checkLevelUp` now logs level/XP/threshold to console. `//levelup` shows diagnostic info when no PCs qualify.
- **`checkLevelUp` after Firebase sync** — Was missing; Firebase `state=remote` replacement lost level-ready flags.
- **Full app audit (3-agent parallel)** — Bug audit, UX/gameplay audit, performance audit across the entire codebase.
- **Ability modifier math fix (CRITICAL)** — Operator precedence bug in 4 places: `(parseInt(pc[s])||10-10)/2` gave wrong results (STR 16 = +8 instead of +3). Fixed all to explicit `(n-10)/2`.
- **7 missing window exposures** — `renderChat`, `renderNPCs`, `renderCells`, `renderQAEditor`, `renderQAResources`, `renderTownRep`, `toast` — same class as Skip button bug, silently broke editing NPCs, towns, cells, chat expand, etc.
- **Double-send guard** — `sendMsgQuick` now checks `chat-input.disabled` to prevent two AI calls from rapid taps.
- **Toast error/warning variants** — Added `.toast-error` (red), `.toast-warn` (amber), `.toast-red` CSS classes. Tagged ~15 error paths.
- **Combat token tap targets** — `.zone-token` and `.init-chip` min-height 40px, `.zt-cond` bumped to 9px with better contrast.
- **Input font sizes** — All form inputs bumped to 16px, chat input 13→16px, NPC/inventory inputs 11-12→14px.
- **HURT badge fix** — Now shows actual condition name when conditions exist (tappable to clear). Shows informational "HURT" when just low HP (not clickable). Compact card condition chips now tappable with ✕.
- **XP slider** — Compact party card XP bar replaced with interactive range slider. PC overview XP bar/label tappable to edit.
- **Confirm dialogs** — `endCombat` and `remNPC` now require confirmation.
- **Save failure toast** — Storage full errors now surface to user instead of silent console.error.
- **Firebase pcs guard** — Added `if(!Array.isArray(s.pcs))s.pcs=[]` to migrate() structural guards.
- **Inventory null guards** — `addPcItem`, `updPcItem`, `remPcItem`, `remPcItemSheet` all null-guarded.
- **AI XP/HP contract hardening** — Strengthened FORMAT RULES (ban hp/hp_max for level-up, XP must be encounter-only deltas). LEVEL-UP clause expanded. XP handler injects `[XP APPLIED]` receipt with actual values. Sanity warnings for suspicious XP deltas and AI-set hp_max increases.

### Decisions Made
- HURT badge behavior split: conditions → tappable clear, low HP → informational only
- XP bar on compact card is an interactive range slider; on overview it's tap-to-prompt
- Toast now accepts (msg, style, dur) — style can be 'error', 'warn', 'red'
- AI contract explicitly bans hp/hp_max/level/slots/features mechanics for level-up purposes
- XP receipt context injection ensures AI sees real XP values after every award

### Known Issues
- `renderAll()` rebuilds ~50 sub-renderers on every mutation (performance — needs dirty-flag system)
- Firebase uploads entire state as single JSON blob on every save (bandwidth)
- `renderChat()` rebuilds all 80 messages on every call
- `--text-dim` (#a07858) fails WCAG contrast on dark bg
- Stale `_ctxInject` can leak between contexts (set in combat/refresh, consumed on next sendMsg)
- Level-up wizard has no back button (mis-picked subclass needs full restart)
- `save()` JSON.stringify is synchronous and unthrottled

### In Progress
- Nothing actively in progress

### Next Up
1. **Remaining audit items** — renderAll optimization, Firebase partial sync, lazy-load static data, rewind redo, previewMechanics parity
2. **Module import → world setup auto-fill**
3. **Character Creation Wizard**
4. **Inline NPC name linking**
5. **Combat quick-panel**
6. **Spell tap-to-see** — user request
7. **Treasury gold tracking audit** — user reported 215gp discrepancy

### Branch State
- Branch: `claude/new-session-rvx6tn`
- All changes committed and merged to main
- Main is pushed and up to date with origin/main
- Last commit on branch: 5677395

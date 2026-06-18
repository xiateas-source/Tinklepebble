# Session Log — Handoff Note

## Session 17 · 2026-06-18

### Shipped
- **Level-up wizard: Feat selection** — ASI/Feat toggle on ASI step. `FEATS_DB` with 56 feats (42 PHB + 14 TCoE), descriptions, search filter, half-feat ability picker. Feat gets written to `pc.features` and AI is notified of full effect text
- **Level-up wizard: Current ability scores** — compact 6-stat display at top of ASI step for decision reference
- **Level-up wizard: Spell swap** — optional step for spellcasters (Bard, Arcane Trickster, Eldritch Knight) to replace one known spell with another from their class list
- **Term glossary expansion** — 27→84 D&D terms across all categories (conditions, saves, combat, spellcasting, resting, terrain, vision, damage types, class features)
- **Per-PC inventory in Cargo** (Flag 13 closed) — Wagon/Slasher/Tinkle/Pebble toggle buttons. Browse each PC's personal inventory with full chip edit UI
- **Condition duration tracking** — optional rounds on conditions via `condDurations` map. Duration input on quick-add row and manual prompt. Badges show remaining rounds (e.g., "Stunned 2r"). Auto-expire at end of combatant's turn via `_tickCondDurations()`. Turn context injection includes durations for AI
- **Quick enemy clone** — Clone button on active card for non-PC combatants. Duplicates at full HP with same AC/zone, randomized initiative, auto-numbered suffix

### Decisions Made
- Condition durations stored as parallel `condDurations` map (not changing existing conditions array) for backward compatibility
- Durations decrement at end of combatant's turn (start of next turn's processing in nextTurn())
- Clone uses `baseName + num` pattern, strips trailing numbers from source name
- Feats use `FEATS_DB` constant with `half` field as false or ability array
- Spell swap only for spellcasters with existing spells (magic string > 10 chars)
- Per-PC cargo uses `pc_N` list type routing through `_getWList()` helper

### Known Issues
- Remaining open flags: 10 (Familiar home), 11 (Context strip carousel), 12 (Quest log refresh) — all need user design input
- `state.worldData.plot/timers` fields orphaned
- Combat quick-panel and unified step bar still on UX audit list

### In Progress
- Nothing actively in progress — all committed and deployed

### Next Up
1. **Context strip carousel** (Flag 11) — needs user input on what to cycle
2. **Familiar/animal home** (Flag 10) — needs design
3. **Quest log UX refresh** (Flag 12) — needs design
4. **Combat quick-panel** — context strip as tappable combat action bar
5. **Unified step bar with targeting** — step bar integrates with combat zone targeting

### Branch State
- Branch: `claude/new-session-rvx6tn`
- Last commit: `6f59e39` (Condition duration tracking + quick enemy clone)
- Merged to main and live

# Session Log — Handoff Note

## Session 17 · 2026-06-18

### Shipped
- **Level-up wizard: Feat selection** — ASI/Feat toggle on ASI step. `FEATS_DB` with 56 feats (42 PHB + 14 TCoE), descriptions, search filter, half-feat ability picker. Feat gets written to `pc.features` and AI is notified of full effect text
- **Level-up wizard: Current ability scores** — compact 6-stat display at top of ASI step for decision reference
- **Level-up wizard: Spell swap** — optional step for spellcasters (Bard, Arcane Trickster, Eldritch Knight) to replace one known spell with another from their class list. Swap updates `pc.magic` string in-place
- **Term glossary expansion** — 27→84 D&D terms: added conditions (Deafened, Invisible, Petrified, Unconscious), saves/checks (Saving Throw, Ability Check, DC, Proficiency Bonus, Expertise, Passive Perception), combat mechanics (Initiative, AC, HP, Death Save, Temporary HP, Hit Dice, Critical Hit, Natural 1, weapon properties), spellcasting (Spell Slot, Cantrip, Ritual, Spell Attack, Spell Save DC, Components, Upcasting), resting, terrain, vision, damage types (Resistance, Vulnerability, Immunity), economy (Attunement, Encumbrance), and class features for all three PCs
- **Per-PC inventory in Cargo** (Flag 13) — Wagon/Slasher/Tinkle/Pebble toggle buttons above cargo. Tap a PC to browse their personal `pc.inventory[]` with full chip edit UI. `setCargoPCFilter()`, `_getWList()` helper. `updWItem`/`remWItem`/`toggleItemTag`/`closeWEdit` all updated to handle `pc_N` list type

### Decisions Made
- Feats use `FEATS_DB` constant (not AI-generated) for data accuracy
- Half-feat `half` field is `false` or array of ability options (e.g., `['STR','DEX']`, `['STR','DEX','CON','INT','WIS','CHA']` for Resilient/Skill Expert)
- Spell swap only appears if character has spells (`pc.magic` > 10 chars) — prevents showing for characters with placeholder text
- Arcane Trickster max spell level uses 1/3 caster table: L3-6=1st, L7-12=2nd, L13-18=4th, L19+=5th
- Per-PC cargo uses `pc_N` list type convention to route through existing `_renderInvChips` chip UI

### Known Issues
- Remaining flags needing design: 10 (Familiar home), 12 (Quest log refresh)
- Flag 11 (Context strip carousel) still open — needs design input on what to cycle through
- `state.worldData.plot/timers` fields orphaned

### In Progress
- Nothing actively in progress — all committed and deployed

### Next Up
1. **Context strip carousel** (Flag 11) — needs user design input
2. **Familiar/animal home** (Flag 10) — needs design
3. **Quest log UX refresh** (Flag 12) — needs design
4. **Condition duration tracking** — track rounds remaining, auto-expire
5. **Quick enemy clone** — duplicate combatant for fast encounter setup

### Branch State
- Branch: `claude/new-session-rvx6tn`
- Last commit: `a9fd0fc` (Glossary expansion + per-PC cargo buttons)
- Merged to main and live

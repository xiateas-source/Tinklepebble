# Session Log — Handoff Note

## Session 15 · 2026-06-18

### Shipped
- **PDF module import improvements** — better chapter detection patterns (section/act/mission/quest/encounter), position threshold 150→300, auto-split fallback for large PDFs with few detected sections, Replace/Add mode toggle with dynamic dropdown
- **Contract 9 anti-fabrication** — new rules: "fabricated content is NON-CANONICAL", "NEVER call campaign homebrew", double-save in recalibrate with fresh timestamps
- **`quest_update` mechanic** — new parseMechanics handler for in-place quest note updates (`quest_update: name|status text`)
- **Level-up context injection** — `checkLevelUp()` now builds `choiceHints` from `LEVEL_UP_DATA` (subclass options, spell picks, ASI), tells AI to narrate milestone and prompt player choices
- **Spell compendium** — `SPELL_DB` (~65 spells, Bard + Wizard cantrips through 3rd level), `MANEUVER_DB` (16 Battle Master maneuvers), browsable compendium UI with class/level filters, search, one-tap add
- **5 flags addressed** — merged Spells+Spellbook into single tab (Flag 3: cantrip/level-0 display), dynamic skill calc in genLedger (Flag 8: expertise double-prof), story pacing contract (Flag 7), test chat export (Flag 1), compendium browse from overview
- **Compendium button fix (×2)** — first fix: module-scope variable issue + onclick escaping for spell names with apostrophes + tab index shifts after merge. Second fix: `toggleCompendium()` calling wrong render function, `openCompendiumFromOverview()` not navigating from overview to edit drawer

### Decisions Made
- Spells + Spellbook tabs merged into single tab (index 3); Gear shifted from 5→4
- Spell compendium built from training knowledge (PDFs too large to upload)
- `SPELL_DB` / `MANEUVER_DB` / compendium functions exported to window for inline onclick access
- Module-scoped `_compOpen` accessed through exported wrapper functions
- Dynamic skill calc computes modifiers from ability scores + proficiency instead of stale hardcoded strings

### Known Issues
- Flag 13 still open: treasure log audit / duplicate loot detection
- Remaining flags from ops debrief: Flag 2 (multi-category items), Flag 14 (encumbrance), Flag 11 (context strip carousel), Flags 5/9/10/12 (need design)
- `state.worldData.plot/timers` fields orphaned — data in state but no UI
- Campaign may still have fabricated chat history from "Oakhaven Infiltration" / "Veil-Breaker" storyline — user should recalibrate in regular browser

### In Progress
- Nothing actively in progress — all committed and deployed

### Next Up (from ops debrief — prioritized)
1. **Encumbrance tracking** — weight calc in genLedger + AI contract clause (Flag 14)
2. **Multi-category items** — foraged+ingredient dual tagging (Flag 2)
3. **Per-PC inventory buttons** in Cargo tab (Flag 13)
4. **Treasure audit inline** — dedup from income log (Flag 4)
5. **Context strip carousel** — tap to cycle location→char→quest→module (Flag 11)
6. **Expand term glossary** — add 50+ more D&D terms to tooltip system
7. Design needed: Quest→Chapter linking (5/9), Familiar home (10), Quest log refresh (12)

### Branch State
- Branch: `claude/new-session-rvx6tn`
- In sync with main (all merged)
- Last commit: `d70e873` (Fix compendium browse button)

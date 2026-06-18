# Session Log — Handoff Note

## Session 15 · 2026-06-18

### Shipped
- **PDF module import improvements** — better chapter detection patterns, position threshold 150→300, auto-split fallback, Replace/Add mode toggle
- **Contract 9 anti-fabrication** — "fabricated content is NON-CANONICAL", "NEVER call campaign homebrew", double-save in recalibrate
- **`quest_update` mechanic** — new parseMechanics handler for in-place quest note updates
- **Level-up context injection** — `checkLevelUp()` builds `choiceHints` from `LEVEL_UP_DATA` with actual spell names from `BARD_SPELLS`/`SPELL_DB`
- **Spell compendium** — `SPELL_DB` (~65 spells), `MANEUVER_DB` (16 maneuvers), browsable UI with class/level filters, search, one-tap add. Spell level tags (`Cantrip`/`Lvl 2`) on summary line. Metadata (cast time/range/duration/components) visible without expanding.
- **5 flags addressed** — merged Spells+Spellbook tabs (Flag 3), dynamic skill calc (Flag 8), story pacing contract (Flag 7), test chat export (Flag 1), compendium browse from overview
- **Compendium button fix (×2)** — module-scope variable issue, onclick escaping, `toggleCompendium()` calling wrong render, `openCompendiumFromOverview()` now navigates properly. Auto-scroll to compendium panel on open.
- **Strict level-up contract** — New "LEVEL-UP RULES" section always injected into AI prompt. AI cannot fabricate stat blocks, choose feats/spells, or apply HP changes. Must direct players to `//levelup` command or character sheet.
- **`//levelup` command** — Opens Level Up wizard from chat for the first ready PC. Suggestion chip "⬆ Level Up" appears when any PC has `levelReady=true`.
- **Expanded AI compliance detection** (4 new detectors):
  - `detectUnloggedDamage` — "Slasher takes 8 damage" without `hp:` mechanic → confirm chip
  - `detectUnloggedHealing` — "Pebble heals 5 HP" without `hp:` mechanic → confirm chip
  - `detectUnloggedCondition` — "Tinkle is knocked Prone" without `conditions:` mechanic → confirm chip
  - `detectUnloggedLocation` — "arrive at Greenest" without `location:` mechanic → confirm chip
- **Post-parse mechanic validator** (`_validateMechanics`) — auto-clamps HP above max, duplicate conditions, slot/resource overuse, negative treasury, ox/wagon HP above max. Shows warning toasts when corrections applied.

### Decisions Made
- Level-up is strictly wizard-only — AI narrates milestone but cannot choose feats, spells, or apply stats
- Contract compression deferred — risk of missing edge cases at transitions outweighs small token savings
- Expanded detection uses confirm chips (not auto-apply) — player always has final say
- Validator auto-clamps silently fixable issues (HP>max) but toasts the correction

### Known Issues
- Flag 13 still open: treasure log audit / duplicate loot detection
- Remaining flags: Flag 2 (multi-category items), Flag 14 (encumbrance), Flag 11 (context strip carousel), Flags 5/9/10/12 (need design)
- `state.worldData.plot/timers` fields orphaned — data in state but no UI
- Campaign may still have fabricated chat history from "Oakhaven/Veil-Breaker" — user should recalibrate

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
- Last commit: `98d9a3a` (Add expanded mechanic detection + post-parse validator)

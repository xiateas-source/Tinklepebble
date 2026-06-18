# Session Log — Handoff Note

## Session 15 · 2026-06-18

### Shipped
- **PDF module import improvements** — better chapter detection, Replace/Add mode toggle, auto-split fallback
- **Contract 9 anti-fabrication** — fabricated content NON-CANONICAL, no "homebrew" label, double-save recalibrate
- **`quest_update` mechanic** — new parseMechanics handler for in-place quest note updates
- **Level-up context injection** — `checkLevelUp()` builds choice hints with actual spell names
- **Spell compendium** — `SPELL_DB` (~65 spells), `MANEUVER_DB` (16 maneuvers), browsable UI with filters/search, one-tap add, spell level tags, metadata on summary line
- **5 flags addressed** — merged Spells+Spellbook tabs (Flag 3), dynamic skill calc (Flag 8), story pacing contract (Flag 7), test chat export (Flag 1), compendium browse
- **Compendium button fix (×2)** + auto-scroll to compendium on open
- **Strict level-up contract** — AI cannot fabricate stat blocks, must direct to `//levelup`
- **`//levelup` command** + suggestion chip when PC is ready
- **7 AI compliance detectors** (4 new: damage, healing, conditions, location + existing 3: gold, NPC, item)
- **Post-parse mechanic validator** — auto-clamps HP/slots/resources, dedup conditions, negative treasury, encumbrance warnings, income log dedup
- **Flag 14: Encumbrance tracking** — `_pcCarryWeight()`/`_pcCarryCap()` helpers, weight in compact+full ledger, validator warns when over STR×15 or wagon over 1080lb
- **Flag 4: Treasure audit** — income log dedup in validator (same desc+amt+type in last 5 entries auto-removed)
- **Flag 6: OOC narrative context** — OOC channel now gets 8 recent messages (400 chars each) + current scene/location/combat status
- **Flag 2: Multi-category items** — item type supports comma-separated tags (e.g. "foraged,ingredient"), checkbox multi-select in edit view, filter matches any tag

### Decisions Made
- Level-up is strictly wizard-only — AI cannot choose feats/spells/stats
- Contract compression deferred — risk outweighs token savings
- Expanded detection uses confirm chips (not auto-apply)
- Validator auto-clamps silently fixable issues but toasts corrections
- Multi-category items use comma-separated strings (no data model migration needed)
- Encumbrance uses PHB variant: STR×15 carry capacity

### Known Issues
- Remaining flags needing design: 5/9 (Quest→Chapter linking), 10 (Familiar home), 12 (Quest log refresh)
- Flag 11 (Context strip carousel) still open
- Flag 13 (Per-PC inventory in Cargo) still open
- `state.worldData.plot/timers` fields orphaned

### In Progress
- Nothing actively in progress — all committed and deployed

### Next Up
1. **Per-PC inventory buttons** in Cargo tab (Flag 13)
2. **Context strip carousel** — tap to cycle location→char→quest→module (Flag 11)
3. **Expand term glossary** — add 50+ more D&D terms to tooltip system
4. Design needed: Quest→Chapter linking (5/9), Familiar home (10), Quest log refresh (12)

### Branch State
- Branch: `claude/new-session-rvx6tn`
- In sync with main (all merged)
- Last commit: `ca04ecb` (Close 4 flags: encumbrance, treasure dedup, OOC context, multi-category items)

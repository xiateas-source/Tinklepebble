# Session Log — Handoff Note

## Session 22 · 2026-06-18

### Shipped
- **Spell DB additions** — Added Guidance (cantrip, druid), Mold Earth (cantrip, druid/wizard), Entangle (1st level, druid), Grease (1st level, wizard) to SPELL_DB
- **Session Zero Step 0 persistence fix** — Replaced `saveSetup()` intermediary with direct inline saves (`oninput="state.campaignSetup.tone=this.value;save()"`) matching the pattern Step 2 already uses
- **Session Zero → AI prompt injection** — `buildPrompt()` now includes SESSION ZERO — PERMANENT TABLE CONTRACT section (tone, origin, goal, lines/veils) between premise and Contract 2
- **Step 0 DOM load fix** — `loadSetupFields()` called once at init (not in `renderAll()` to avoid overwrite race), ensures fields render on page load
- **Firebase sync campaignSetup preservation** — When remote state arrives, preserves local `campaignSetup` if remote is empty; also persists `state=remote` to localStorage immediately
- **migrate() campaignSetup guard** — Structural guard ensures `campaignSetup` is always an object
- **generateSessionZero() dynamic campaign name** — Uses `state.worldData.setting` first line instead of hardcoded "Hoard of the Dragon Queen"
- **launchCampaign() validation** — Warns on unnamed PCs, blank setting, blank mission, empty AI persona; syncs step 0 goal into primaryMission if mission is empty
- **Player Agency contract** — Added PLAYER AGENCY (STRICT) rules to Contract 5 (#ai-multi): one player cannot act for another's character, never assume PC actions
- **roll_request enforcement** — Expanded roll_request contract to cover ALL roll types (attack, damage, spell), not just skill checks. Added: "ALWAYS use this instead of asking for a roll in prose text"
- **STATE_KEYS updated** — Added `campaignSetup` to synced keys

### Decisions Made
- Step 0 fields use direct inline saves (same pattern as Step 2) — `saveSetup()` was the root cause of the persistence race condition
- `loadSetupFields()` runs once at init, never inside `renderAll()` — prevents Firebase echo from clearing fields
- Firebase `state=remote` must persist to localStorage immediately to survive refresh
- Player agency is a strict contract rule, not a suggestion — AI must never narrate a PC's action without their player's input
- `roll_request` must be used for ALL roll types, not just skill checks

### Known Issues
- None new from this session

### In Progress
- Nothing actively in progress

### Next Up
1. **Module import → world setup auto-fill** — extract key info from imported module into worldData fields
2. **Character Creation Wizard** — Level 1 setup flow for new characters
3. **Inline NPC name linking** — tap NPC names in chat to navigate to tracker
4. **Combat quick-panel** — context strip as tappable combat action bar
5. **PDF import revision** — deprioritized, markdown is primary path

### Branch State
- Branch: `claude/new-session-rvx6tn`
- All changes committed and merged to main
- Main is pushed and up to date with origin/main
- Last main commit: 36b6218 (Merge remote main — resolve bundle conflict)

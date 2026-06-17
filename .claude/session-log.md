# Session Log — Handoff Note

## Session 13 · 2026-06-17

### Shipped
- **Overlay persistence fix** — `closeDrawer()` now calls `_closeAllOverlays()` to dismiss all fixed overlays (loc-ov, grit-ov, familiar-ov, loc-seed) when navigating away
- **HTML structure fix** — removed extra `</div>` at line 1015 that caused negative div depth, breaking page layout
- **Chronicle View: location-anchored data** (from Session 12 branch, merged to main)
  - Location detail shows anchored NPCs (merged from loc.npcs + state.npcs lastSeen matching)
  - Active quests filtered by location name
  - Active consequences filtered by location
  - Town rep, income log filtered by location
  - NPC auto-anchor on npc_add to current location
  - Income/expense entries tagged with current location
- **Exploration mode zones** — zone grid visible outside combat when zones have custom labels
- **Area Map overlay** — upload dungeon/area map images, place location pins on top
  - File upload (stored in localStorage via `tt_area_map`, max 10MB)
  - List/Map view toggle in Location Journal
  - Tap-to-place workflow: select location chip, tap map to position pin
  - SVG drop-pin markers colored by status (gold=current) and rep (green/red/dim)
  - Pin labels with text shadow for readability over any map
  - "Place on Map" / "Move on Map" button in location detail overlay
  - Percentage-based positioning — pins survive viewport resize
  - Map stored separately from Firebase sync (too large for realtime DB)

### Decisions Made
- Map images stored in localStorage only (not Firebase) — too large for realtime DB
- `state.locations[].mapPos` = `{x: %, y: %}` percentage coordinates — syncs via Firebase since it's tiny
- `_locViewMode` module variable with `setLocView()` wrapper for inline onclick access
- `_LOC_MAP_KEY = 'tt_area_map'` — separate localStorage key for map image

### Known Issues
- Cannot run Playwright in this environment (cdn.playwright.dev blocked by network egress)
- Zone combat not yet playtested
- Flag 13 still open: treasure log audit / duplicate loot detection

### In Progress
- Nothing actively in progress

### Next Up
- **User sent Dragon Hatchery map** — ready to test the map overlay feature with it
- **Fog of war** (zone-level hidden/revealed)
- **Drop 4 remaining**: Chronicle View wrapper below zone grid, anchor incomeLog to locations
- Inventory UX overhaul (Issue 21)
- Expand term glossary — 50+ D&D terms

### Branch State
- Branch: `claude/new-session-rvx6tn`
- In sync with main (all merged)
- Last commit: `14d12e1` (Area Map overlay)

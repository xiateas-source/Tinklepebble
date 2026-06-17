# Session Log — Handoff Note

## Session 13 · 2026-06-17

### Shipped
- **Area Map overlay** — upload dungeon/area map images, place location pins by tapping
  - File upload (localStorage `tt_area_map`, max 3.5MB)
  - List/Map view toggle, SVG drop-pin markers, percentage-based positioning
  - Pin drag-to-reposition: hold 350ms then slide (pointer events, touch+mouse)
  - "Place on Map" / "Move on Map" in location detail overlay
- **Fog of war** — zone-level hide/reveal
  - `zone_fog:` parseMechanics handler (hide/reveal)
  - Hidden zones show "???" with diagonal stripe pattern (player view)
  - DM view shows 🌫 fog badge for quick toggle
  - Works in combat and exploration modes
- **Chronicle View wrapper** — location context below zone grid
  - Shows NPCs at location, active quests, active consequences
  - Auto-populates from state.worldData.location
  - Renders in both combat and exploration modes
- **Inventory UX overhaul**
  - Compact chip layout grouped by subcategory with type icons
  - Filter bar with item counts per category
  - Tap-to-expand inline editor, auto-edit on new items
  - Fuzzy dedup on item_add (substring + similarity matching for stacking)
- **Panel cleanup**
  - Removed Campaign Premise from Operations (stays in Setup)
  - Removed Plot & Lore panel entirely
  - Moved Reference Snippets to AI Tools tab
  - Operations simplified to Campaign Secrets + World Consequences + deep-links
- **Bug fixes (19 total)**
  - Overlay persistence: `_closeAllOverlays()` in closeDrawer + openDrawer
  - PC Overview sheet added to overlay cleanup
  - Map pin coordinate clamping, mapPos validation, localStorage quota handling
  - Pin clicks disabled during placement mode
  - Context strip hidden when drawer open (location bar floating fix)
  - 11 broken onclick handlers: renderPCOverview, renderHUD, renderCharTabs, remAtk, remPcItem, remResource, rewindTo, renderCapacity, renderSetupLock, renderErrorLog, _setupUnlocked scoping
  - Extra `</div>` removed, null safety on openLocationDetail + addLocationManual

### Decisions Made
- Map images in localStorage only (not Firebase) — too large for realtime DB
- 3.5MB file size limit (base64 inflates ~33%, localStorage ~5MB cap)
- `_locViewMode` + `setLocView()` wrapper for inline onclick access
- Fuzzy matching: substring OR ≤1 char difference = same item → stack
- Plot & Lore data (`state.worldData.plot/timers`) remains in state but panel removed

### Known Issues
- Cannot run Playwright in this environment (cdn.playwright.dev blocked)
- Zone combat/fog not yet playtested in actual session
- Flag 13 still open: treasure log audit / duplicate loot detection
- `state.worldData.plot/timers` fields orphaned — data still in state but no UI (safe to leave)

### In Progress
- Nothing actively in progress

### Next Up
- Expand term glossary — 50+ D&D terms
- Inventory UX for wagon cargo (same chip treatment as party inventory)
- Drop 5: Image Maps + Token Overlay (needs Firebase Storage config)
- Con Scorecard (needs design)

### Branch State
- Branch: `claude/new-session-rvx6tn`
- In sync with main (all merged)
- Last commit: `b675c8b` (Pin drag-to-reposition)

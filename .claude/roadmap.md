# Tinkle's Tinctures — Dev Roadmap

## Critical User Rule
**Always ask for confirmation before implementing.** Present the plan, wait for go-ahead.

## App Architecture Notes
- Single HTML file (`index.html`) — all CSS, JS, HTML inline
- GitHub Pages deployment from `main` branch
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` object persisted to `localStorage('tt_v1')` and Firebase
- Multiple stacked `:root` CSS blocks — the LAST one wins (currently ~line 966)
- Multiple stacked CSS class overrides — last one wins. Pattern throughout file.
- Light/dark theme via `body.light-mode` + `localStorage('tt_theme_mode')`
- `SAVE_VERSION=7`; `migrate(s)` patches loaded state on version changes
- `renderAll()` is central render; `renderChat()` renders narrative chat

## Active Palette (dark, final :root block ~line 966)
```css
--bg:#2c1d1a; --surface:#3b2b24; --surface2:#4a3b39; --surface3:#5a4a46;
--border:#4a3530; --border-bright:#6a5048;
--gold:#c8a06a; --gold-dim:#8a6040; --gold-bright:#e8c898;
--text:#cbbba0; --text-dim:#8a7060; --text-bright:#f2efe9; --cream:#f2efe9;
```

## Phase 0 — Current Sprint (cleanup before building)
- [x] Header stretch fix — neutralized stacked dark CSS overrides
- [x] 🎲 Roll & Submit button in header (one-tap from any tab)
- [x] Remove simple Dice Roller panel from Combat tab (rollDie() deleted)
- [x] Remove #party-status-mini from header (belongs on Party tab, not header)
- [ ] Redundancy fix: Premise/Setting — Setup deep-links to World tab fields (same state keys, two UIs)
- [ ] Redundancy fix: Business Profile — Setup step 3 redirects to World tab bp panel
- [ ] Travel Log + Town Reputation merge into single widget
- [ ] World tab: split into "World State" | "Operations" sub-tabs
      - World State: time, season, weather, illumination, location, description, scene title/threat/condition
      - Operations: plot threads, timers, DM secrets, session notes, story thread
- [ ] Quest + Plot + Timers: replace overloaded right column with tabbed panel (Quests | Plot | Timers)

## Phase 1 — Pre-Drop 4
- [ ] Vite migration (single file → component structure before Drop 4 adds complexity)

## VTT Drops
- **Drop 4**: Zone combat map (replaces current Combat tab entirely — do NOT refactor Combat tab)
- **Drop 5**: Shared dice feed (Firebase-wired; header 🎲 becomes the entry point)
- **Drop 6**: Player View mode (needs World State|Operations split + state visibility audit first)
  - `buildPlayerView()` computes player-safe snapshot for Firebase `/session/playerView`
  - State visibility: classify each state key as dm-only / player-visible / player-editable
- **Drop 7**: Handout/image cards

## Key Redundancies Identified
1. `state.worldData.premise` written by Setup→Session Zero AND World tab w_premise textarea
2. `state.worldData.setting` written by Setup→World AND World tab w_setting textarea
3. Business Profile: Setup step 3 (fewer fields) AND World tab bp_* panel (full fields)
   → Fix: Setup steps become deep-links into World tab. One source of truth.

## Architecture Warnings
- Do NOT refactor Combat tab — Drop 4 replaces it entirely
- State visibility split is prerequisite for Drop 6
- World tab Operations split is prerequisite for Drop 6 DM control surface
- Vite migration should happen before Drop 4 (adding zone map to a 6k-line single file is painful)

## Dead Code (safe to remove anytime)
- Theme editor functions: `THEME_VARS`, `DEFAULT_THEME`, `THEME_PRESETS`, `applyTheme()`,
  `setThemeVar()`, `syncThemeColor()`, `applyThemePreset()`, `resetTheme()`,
  `toggleThemeEditor()`, `renderThemeEditor()`, `copyThemeCSS()` — not called anywhere

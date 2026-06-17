# Tinkle's Tinctures — Feature Map

## CSS Architecture

**Root Palette:** Single `:root` block. **Soft Autumn palette active (Visual Redesign v2, 2026-06-14):**
- Cinnamon accent: `--gold:#b05830`, `--gold-dim:#70381a`, `--gold-bright:#d07845`
- Surfaces: `--bg:#1a0c07`, `--surface:#2c1a10`, `--surface2:#3c2618`, `--surface3:#4c3222`
- Text: `--text:#c4a88a`, `--text-dim:#8a6b50`, `--text-bright:#e8d9c4` (champagne beige)
- Red: `#8b3a2a` (danger), Green/Sage: `#788a73`, Blue: `#608278`, Purple: `#7a6870`

**Theme Mode Overrides:**
- **Light Mode**: Body class `.light-mode` with warm beige palette (`--bg:#f0d3b6`)
- **Night Mode**: Body class `.night-mode` with deeper sepia (`--bg:#100d0a`, `--gold:#a07840`)

**Key Named CSS Classes:**
- `.panel`, `.pc-card`, `.modal-box`, `.chat-msg`, `.cond-chip`, `.log-entry`
- `.btn`, `.btn.gold`, `.btn.red`, `.btn.green`, `.btn.purple`
- `.chat-msg.dm`, `.chat-msg.player`, `.chat-msg.sys`, `.chat-msg.chk-msg`, `.chat-msg.init-msg`
- `.stat-mini` (circular embossed stat tiles, 50% border-radius)
- `.qa-fab` (floating action button), `.qa-menu`, `.qa-sheet` (bottom sheet modals)
- `.drawer-sheet` (fixed bottom sheets with `.is-open` slide-up transition)

---

## Navigation Architecture (4-Tab Nav)

Bottom nav: **AI DM** | **📜 Sheet** | **📦 Logistics** | **⚙ Systems**

- **AI DM** (`navTo('log')`) — closes drawer; shows `#tab-dm` (always-visible main canvas)
- **Sheet** (`navTo('party')`) — opens drawer with `#tab-party`; no subnav
- **Logistics** (`navTo('logistics')`) — opens drawer with subnav: 🌍 World / 🛒 Wagon / ⚔ Combat
- **Systems** (`navTo('systems')`) — opens drawer with subnav: 📅 Session / 🤖 AI Tools / 🔧 Dev / ⚙ Setup

Nav functions: `navTo(key)`, `openDrawer(tabId)`, `closeDrawer()`, `switchLogisticsTab(sub)`, `switchSystemsTab(sub)`

Nav dots: `#logistics-dot`, `#systems-dot` — gold ● shown via `flashTab(tabId)` when AI triggers state changes

**Header Menu (☰):** Customizable shortcut grid. `state.headerShortcuts[]` controls which icons appear. 16 available shortcuts in `HEADER_SC_REG`. Tap ✎ to add/remove. `execHeaderSC(id)` dispatches actions.

---

## Tabs (content areas — 9 total, accessed via 4-tab nav)

### 1. Party Tab (`tab-party`)
- `#party-cards` — Grid of `.pc-card` elements
- `#char-tabs` — Tab row for character editing
- `#edit-sheets` — Character edit sheets (one per PC)
- `#party-inv` — Party-shared inventory list
- `#sp-cards` — Superpowers plugin panel (if active)

### 2. World Tab (`tab-world`)
Three sub-tabs via `showWorldTab()`:
- **World State Panel** (`#world-state-panel`)
  - Environment: `#w_time`, `#w_season`, `#w_weather`, `#w_illum`
  - Location: `#w_location`, `#w_loc_desc`
  - Campaign: `#w_setting`, `#w_premise`, `#w_plot`, `#w_timers`
  - Treasury: `#t_pp`, `#t_gp`, `#t_ep`, `#t_sp`, `#t_cp`, `#treasury-total`, `#session-pl`
  - `#income-log`, `#npc-list`, `#quest-list`, `#town-rep-list`, `#campaign-secrets-list`
- **Locations Panel** (`#world-locations-panel`)
  - `state.locations[]` — one entry per city/camp/dungeon
  - **List view**: Node Map SVG + location list cards
  - **Map view**: Uploaded area map image with SVG drop-pin markers at percentage positions
  - Toggle: `setLocView('list'|'map')` — `_locViewMode` module variable
  - Tap node/pin → location detail bottom sheet (`#loc-ov`)
  - Detail shows anchored NPCs, quests, consequences, town rep, income log filtered by location
  - Player/DM view toggle (`toggleLocDmMode()`)
  - 🌱 Seed button — `openLocationSeed()` drafts from travelLog, townReputation, NPC.lastSeen
  - AI mechanics: `location_add:`, `location_visit:`, `location_history:`, `location_investment:`
  - `mapPos: {x:%, y:%}` — percentage-based pin position on area map
  - Area map in localStorage (`tt_area_map`), NOT Firebase
  - `uploadAreaMap()` / `removeAreaMap()` / `startMapPlace()` / `handleMapTap()` — map workflow
  - `_closeAllOverlays()` — closes all fixed overlays on drawer close
- **Operations Panel** (`#world-ops-panel`)
  - Business profile, Campaign Secrets, World Consequences

### 3. Wagon Tab (`tab-wagon`)
- Grit (ox) stats: `#ox-name`, `#ox-hp`, `#ox-hp-max`, `#ox-ac`, `#ox-feed`, `#ox-cond`
- `#cap-fill`, `#cap-lbl` — Cargo capacity bar
- `#holding-cells` — Dynamic cages for creatures
- `#wagon-cargo` — General cargo with filters (all, supply, foraged, ingredient, trade, loot)
- `#wagon-hoard` — Pebble's hoard
- `#travel-log-visual` — Travel history with location transitions

### 4. Combat Tab (`tab-combat`) — Zone Combat Map (Drop 4)
- `#zone-combat-hdr` — Round bar + movement mode toggle
- `#zone-grid` — 6-zone grid layout (Air/Left Flank/Right Flank/Frontline/Backline/Rear Guard)
- `.init-strip` — Horizontal scrollable initiative chips
- `#zone-active-card` — Active character card with HP +/-, conditions, zone display
- `#zone-no-combat` — Shown when combat is inactive (add combatant form, presets, rest buttons)
- Zones: `.zone-box` elements with `.zone-token` chips (HP bar, conditions, active-turn glow)
- Movement modes: AI-driven (default) or manual (tap token then tap zone)
- Air Space conditionally visible only when flying creatures exist

### 5. Session Tab (`tab-session`)
Three sub-tabs via `showSessionMode()` / `showSessionTab()`:
- **During Session** (`#sess-play-panel`) — Story thread + read-only display
- **Between Sessions** (`#sess-prep-panel`) — Session Archive (`renderSessionArchive()`, newest-first collapsible entries), session summary
- **Module** (`#sess-module-panel`) — Module tracker, scenes, DM secrets, reference snippets

### 6. AI Tools Tab (`tab-ait`)
- Contracts: `#ai-persona`, `#ai-never`, `#ai-actions`, `#ai-continuity`, `#ai-multi`
- Ledger: `#ledger-fmt`, `#ledger-prefix`, `#ledger-out`, `#ledger-tokens`
- `#qa-editor-list` — Quick actions customization
- `#fb-config-input` — Firebase config
- `#rewind-list` — Last 10 snapshots

### 7. AI DM Tab (`tab-dm`)
*Always-visible main canvas — never moves into drawer. `display:flex; flex:1` fills viewport.*
- Chat tabs: `#chat-tab-narrative` (📖 Narrative), `#chat-tab-ooc` (❓ Rules), `#chat-tab-party` (🗨️ OOC with `#party-badge`)
- `#chat-msgs`, `#chat-input` (hidden), `#chat-quick-input` (visible bottom bar)
- `#typing-ind`, `#offline-banner`
- `#roll-request-banner` — Persistent banner for `roll_request:` mechanic
- `#dice-picker-panel` — Dice buttons (d4–d20)
- `#ooc-msgs`, `#party-msgs`

### 8. Dev Tab (`tab-dev`)
- `#session-notes`, `#error-log-list`, `#error-log-count`, `#dev-recap-out`

### 9. Setup Tab (`tab-setup`)
Five steps via `showSetupStep()`: Session Zero, Characters, World, Operation, Plugins

---

## State Model

```
state = {
  pcs: [{
    id, name, race, class, subclass, level, background, alignment,
    hp, hp_max, ac, initiative, speed, passive_perception, passive_insight,
    xp, color, str, dex, con, int, wis, cha,
    skills, skillProfs, features, magic,
    resources: [{name, max, used, restore, desc}],
    conditions: [], slots: [{max, used}], inventory: [],
    backstory_origin, backstory_motivation, backstory_secret,
    concentrating, pending: [],
    hp_temp, exhaustion, hd_used, personality, ideals, bonds, flaws,
    languages: [], sheetLocked: true, levelReady: false
  }],

  worldData: {
    time, season, weather, illum, location, loc_desc, setting,
    plot, secrets, timers, premise, premiseLocked, primaryMission,
    scene_title, scene_threat, scene_cond,
    travelLog: [{ts, old_location, new_location, notes}],
    townReputation: [{town, status, notes, ts}],
    campaignSecrets: [{text, playerKnown, pending, aiOnly}],
    businessProfile: {name, wagonName, realStock, snakeOil, reagents, reputation, notes}
  },

  npcs: [{name, disposition, details, status, hp, lastSeen, pending}],
  quests: [{text, status, hidden, done, pending, chatMsgId, discovery:{text,ts}, notes}],
  consequences: [{id, text, type, resolved, resolvedTs, ts, location}],

  locations: [{
    id, name, type, status, firstVisited, lastVisited,
    rep: { disposition, notes },
    npcs: [], investments: [{ desc, amount, startDay, notes }],
    history: [{ ts, text, dmOnly }],
    dmNotes, playerNotes, mapPos: null
  }],

  treasuryData: {
    pp, gp, ep, sp, cp, lifestyle,
    incomeLog: [{desc, amt, type, category, ts}]
  },

  partyInventory: [{name, qty, weight, type, notes}],

  wagon: {
    ox: { name, hp, hp_max, ac, conditions, feed, backstory, personality,
          bonds: {tinkle, pebble, slasher}, quirks: [], experimentLog },
    cells: [{name, size, temperament, escDC, weight, notes}],
    cargo: [{name, qty, weight, type, notes, ts, location}],
    hoard: [{name, qty, weight, type, notes, ts, location}],
    hp, hp_max, ac, conditions, wagonName, wagonDesc
  },

  relationships: [{from, to, disposition, dynamic, aiOnly, pending}],

  combat: {
    active: bool, round: num, currentIdx: num, moveMode: 'ai'|'manual',
    list: [{name, hp, hp_max, ac, val (initiative), isPC, zone, conditions, concentrating}],
    zones: { front:{label,effect,terrain}, back:{...}, left:{...}, right:{...}, air:{...}, rear:{...} }
  },

  encounterPresets: [{name, enemies: "Name:HP:AC, ..."}],
  scenes: [{name, active, content, notes}],
  snippets: [{id, name, text, active}],
  dmSecrets: string,

  chatHistory: [{role, content, playerName, playerChar, ts, realTs, isCheckpoint, mechanics, msgId, isInitiative}],
  oocHistory: [{role, content, ts}],
  partyChat: [{playerName, playerChar, content, ts}],

  sessionArchive: [{ ts, gameTs, summary, msgCount }],  // 50-cap append-based chronicle
  prevSessionSummary: string,   // last 3 sessionArchive summaries joined
  headerShortcuts: [],          // customizable ☰ shortcut IDs

  aiContracts: { persona, never, actions, continuity, multi },

  logSummary: string,
  logs: [{ts, type, body}],
  storyChapters: [{id, title, content, date}],
  campaignLaunched: bool,
  sessionNotes: string,
  errorLog: [{id, category, uiCtx, tab, sectionCtx, location, gameTs, realTs, verdict, aiVerdict, resolved, note, msgContent}],
  plugins: [{id, name, version, manifest}],

  turnCount, turnsSince, chkCount, chkMode, msgsSinceChk, autoChkInterval,
  chkHistory: [{ts, reason, snapshot}],
  rewindStack: [state snapshots],
  activeEditTab: num, wagonFilter: string,
  quickActions: [{id, label, type, params, context}],
  saveVersion: 12
}
```

---

## STATE_KEYS (Firebase sync)

Synced: `pcs`, `worldData`, `npcs`, `quests`, `treasuryData`, `partyInventory`, `wagon`, `combat`, `encounterPresets`, `scenes`, `activeSceneIdx`, `snippets`, `dmSecrets`, `logSummary`, `logs`, `activeEditTab`, `turnCount`, `turnsSince`, `chkCount`, `chkMode`, `chkHistory`, `rewindStack`, `wagonFilter`, `chatHistory`, `oocHistory`, `partyChat`, `plugins`, `errorLog`, `sessionNotes`, `storyChapters`, `prevSessionSummary`, `aiContracts`, `sessionArchive`, `locations`, `consequences`, `headerShortcuts`

Device-local only (not synced): API keys, provider/model selections, TTS settings, player name/character, offline cache.

---

## SAVE_VERSION & migrate()

**Current Version:** `SAVE_VERSION = 12`

`migrate(s)` is version-gated:
- **Always-run structural guards** — null/array protection for all fields (incl. sessionArchive, headerShortcuts)
- **v8 gate** — moduleProgress, dev flags, qa renames, tab ID remaps, storyChapters
- **v9 gate** — campaignLaunched backfill
- **v10 gate** — canonical L3 character sync (Slasher Fighter, Tinkle Rogue, Pebble Bard)
- **v11 gate** — re-patches L3 data clobbered by SHEET_FIELDS bug; preserves current HP and slot usage
- **v12 gate** — zone combat: adds `combat.zones`, `combat.moveMode`, per-combatant `zone` property
- **Always-run canonical QA** — ensures all 23 QA actions present
- **Always-run core defaults** — structural defaults for all fields

**⚠ SHEET_FIELDS rule:** Never add `hp_max`, `class`, `level`, `features`, `magic`, `skills`, `slots`, `resources`, `concentrating` to SHEET_FIELDS in `loadState()` or `fbStartListening()`. `migrate()` owns all level-dependent fields.

---

## Core Functions Index

### Render
- `renderAll()` — Master render: calls all individual renders
- `renderChat()` — Chat message display
- `renderCards()` / `renderCharTabs()` / `renderSheets()` — Character cards and edit forms
- `renderCharSheet(idx)` — 6-tab digital sheet (Core/Skills/Combat/Spells/Gear/Features)
- `renderPartyPCList()` — Compact PC list with HP bars and XP progress
- `renderSessionArchive()` — Collapsible session archive entries, newest-first
- `renderLocations()` — Node Map SVG + location list
- `renderHeaderShortcuts()` — Customizable ☰ shortcut grid
- `renderContracts()` — AI contract textareas from `state.aiContracts{}`
- `renderHUD()` — PC tiles, Grit tile, Familiar tile
- `renderContextStrip()` — Location/combat info bar
- `syncWorld()` — Refresh all world tab displays

### Navigation
- `navTo(key)` — Route all navigation
- `openDrawer(tabId)` / `closeDrawer()` — Drawer overlay management
- `toggleHeaderMenu()` / `closeHeaderMenu()` — ☰ menu
- `execHeaderSC(id)` — Execute header shortcut action
- `flashTab(tabId)` / `clearTabBadge(tabId)` — Nav dot notifications

### Save/Load/Migration
- `save()` — Serialize state to localStorage + Firebase; prunes chat to 80, logs to 200
- `loadState()` / `migrate(s)` — Deserialize + repair
- `saveRefresh()` — save() + renderAll()
- `exportConfig()` / `importConfig()` / `importFromPaste()` / `copyStateCompact()` — Backup/restore

### Firebase Sync
- `fbInit(config)` / `fbStartListening()` / `fbLoad()` / `fbSave(state)` / `fbDisconnect()`
- `_mergeChatHistories(local, remote)` — Clock-independent chat merge (prefers longer array if it contains shorter's latest)

### AI/Chat
- `sendMsg()` — Send player action to AI
- `buildPrompt(ledger)` — System prompt with all contracts; validates Slasher security fragment
- `genLedger()` — Compile current state ledger
- `parseMechanics(responseText, msgId)` — 43+ handlers; `_MECH_KEYS` controls display stripping
- `callAI(messages, sysProm, maxTok)` — Retry wrapper (2x, 1.2s/2.4s, 5xx); free-model fallback
- `summarizeAndPrune()` — Background summary at 75 msgs → pushes to `sessionArchive[]` (50-cap)
- `sendContextRefresh()` — Lightweight location/condition refresh via `_ctxInject`
- `resyncAI()` — Full ledger re-sync
- `verifyContracts()` — Validates all 10 contract checks + injects contracts into next AI send
- `detectUnloggedGold()` / `detectUnloggedNPC()` / `detectUnloggedItem()` — Confirm-chip prompts for unlogged mechanics

### Location System
- `renderLocations()` — List view (Node Map SVG + cards) or Map view (area map + pins)
- `_renderAreaMap()` — Area map image with positioned pin markers
- `setLocView(mode)` — Toggle between 'list' and 'map' views
- `uploadAreaMap()` / `removeAreaMap()` — Map image management (localStorage)
- `startMapPlace(id)` / `cancelMapPlace()` / `handleMapTap(e)` — Tap-to-place workflow
- `openLocationSeed()` / `closeLocSeed()` / `confirmLocationSeed()` — Draft locations from campaign data
- `openLocationDetail(id)` — Detail bottom sheet with anchored NPCs, quests, consequences, rep, income
- `_closeAllOverlays()` — Closes all fixed overlays (loc-ov, grit-ov, familiar-ov, loc-seed)

### Zone Combat
- `renderCombat()` — Zone grid with token chips, initiative strip, active character card
- `_tokenHTML(c, idx)` — Render single token chip (HP bar, conditions, active glow)
- `_zoneBoxHTML(zoneId)` — Render zone box with label, effects, and contained tokens
- `zoneTokenTap(idx)` — Select token in manual mode for movement
- `zoneBoxTap(zoneId)` — Move selected token to target zone (manual mode)
- `zoneHPAdj(idx, delta)` — Quick HP +/- from active character card
- `toggleMoveMode()` — Switch between AI-driven and manual movement
- `addCombatant()` — Add combatant with zone dropdown
- `addPartyToCombat()` — Auto-add all PCs + Grit/Wagon to zones
- `endCombat()` — End combat, write summary to location history, reset zones

### Quick Actions
- `executeQA(action)` — Execute by type (23 types)
- `renderQAMenu()` — FAB + sliding menu
- `openQASheet(title, bodyHtml, onConfirm)` — Bottom sheet dialog

### Level-Up Wizard
- `checkLevelUp(pc)` → `openLevelUpWizard(idx)` → `_renderLevelUpStep()` → `applyLevelUp()`

### Flags & Dev
- `flagIt()` / `openFlagModal()` / `submitFlag()` — Error flag capture with `uiCtx` auto-build
- `renderErrorLog()` — Flag list with 4-state verdict cycle
- `exportFlagReport()` / `clearResolvedFlags()` / `auditWithAI()`

---

## AI Mechanics (parseMechanics keys)

Parsed from AI response blocks in format: `key: value`

**Character:** `hp`, `hp_max`, `conditions` (+/-), `concentration`, `xp`, `pc_update`, `pc_add`, `pc_delete`, `slot_use`, `slot_restore`, `resource_use`, `resource_restore`, `shell_defense`, `short_rest`

**World:** `location`, `time`, `weather`, `loc_desc`, `travel_note`, `town_rep`

**Economy:** `gp`/`sp`/`cp`/`ep`/`pp`, `item_add`, `item_remove`, `income`, `expense`

**Wagon:** `wagon_cell_add`/`update`/`remove`, `wagon_hp`, `ox_hp`, `ox_condition`

**Story:** `quest_add`, `quest_done`, `quest_fail`, `primary_mission`, `npc_add`, `npc_mood`, `consequence_add`, `consequence_resolve`, `chapter_add`, `module_episode`

**Location Journal:** `location_add`, `location_visit`, `location_history`, `location_investment`

**Zone Combat:** `zone_move` (name|zone_id), `zone_add_enemy` (name|hp|ac|zone_id|init), `zone_remove` (name), `zone_effect` (zone_id|effect|type), `zone_label` (zone_id|label), `combat_start` (description), `combat_end` (summary)

**Interaction:** `roll_request` (Skill|DC|PCname — triggers persistent banner), `save_game`/`save`, `sp_charge` (superpowers plugin)

---

## Quick Action Types (23 total)

`hp`, `condition_add`, `condition_clear`, `resource_use`, `item_add_foraged`, `ox_feed`, `time_advance`, `save_game`, `combat_next`, `log_entry`, `context_refresh`, `town_rep`, `roll_submit`, `state_fix`, `resync_ai`, `surroundings`, `short_rest`, `random_event`, `roleplay_npc`, `char_moment`, `send_scene`, `module_checkin`, `shell_defense_toggle`

---

## AI Contracts (5 system textareas)

1. **`#ai-persona`** — DM Persona & Tone. Character personalities, gritty/darkly comic tone. **CRITICAL:** Slasher con-protection clause
2. **`#ai-never`** — What You Never Do. Strict mechanics enforcement (HP, death saves, concentration, shell defense, lucky)
3. **`#ai-actions`** — How You Handle Actions. Roll triggers, DC, degrees of failure
4. **`#ai-continuity`** — Continuity & Wagon. Verify state before every response
5. **`#ai-multi`** — Multi-Player Awareness. Individual character names, one turn per message

---

## OOC Channels

- **❓ Rules Channel** (`showChatTab('ooc')`) — Mechanical clarifications, rulings
- **🗨️ OOC Chat** (`showChatTab('party')`) — Party discussion, badge + browser notifications

---

## Additional Features

- **Dice Roller** — d4–d20, send roll to narrative chat with context
- **TTS** — Browser TTS + ElevenLabs (9 voices, stability slider, auto-read toggle)
- **Module Progress Tracker** — Episode status, progress bar, `module_episode:` mechanic
- **Session Archive** — `state.sessionArchive[]`, 50-cap append-based, collapsible entries newest-first
- **Error Flag System** — 7 categories, 4-state verdict cycle, `uiCtx` auto-build, AI audit + JSON export
- **Rewind Stack** — Last 10 state snapshots, one-tap restore
- **Checkpoint System** — Manual + auto triggers (long rest, level-up, 0 HP, every N messages)
- **Skill Proficiency Inference** — Parses `pc.skills` text as fallback when `skillProfs[]` is empty; Expertise detection via "(Expertise)" pattern
- **Firebase Sync** — Config modal, real-time bidirectional sync, clock-independent chat merge

# Hoard of the Dragon Queen — Feature Map

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
- **Logistics** (`navTo('logistics')`) — opens drawer with subnav: 📔 Journal / 🛒 Wagon / ⚔ Combat
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

### 2. World Tab (`tab-world`) — Journal View
Single scrollable Journal with collapsible `<details>` sections (replaced 3-panel toggle in Session 19):
- **Journal Header** (`#journal-header`) — `renderJournalHeader()`: location, time/weather, HP bars, quest/NPC/location counts, "Previously On" + "Catch Up" chip buttons
- **Travel Log** (`#travel-log-visual`) — `renderTravelLog()`: most-recent-first timeline with cross-linked tappable chips (quests/NPCs/rep at each location)
- **Journal Rep** (`#journal-rep-list`) — `renderJournalRep()`: town reputation list (duplicate of Wagon's `#town-rep-list`)
- **Quests** (`#quest-list`) — collapsible `<details id="journal-sec-quests">`
- **Locations** (`#locations-list-journal`) — collapsible `<details id="journal-sec-locations">`
- **NPCs** (`#npc-list`) — collapsible `<details id="journal-sec-npcs">`
- **Consequences** (`#consequence-list`) — collapsible `<details id="journal-sec-consequences">`
- **Secrets** (`#campaign-secrets-list`) — collapsible `<details id="journal-sec-secrets">`
- Ghost containers `#world-state-panel`, `#world-ops-panel`, `#world-locations-panel` kept as empty hidden divs for backward compat
- Location system (list/map views, detail sheet, seed, area map) unchanged — renders into `#locations-list-journal`

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
- **Episode Tracker** (`#sess-module-panel`) — Module episode tracker, campaign progress, reference snippets. Helper text links to Session Zero setup

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
- `#roll-request-queue` — Stacked banners for `roll_request:` mechanic (queue-based, supports multiple simultaneous requests)
- `#dice-picker-panel` — Dice buttons (d4–d20)
- `#ooc-msgs`, `#party-msgs`

### 8. Dev Tab (`tab-dev`)
- `#session-notes`, `#error-log-list`, `#error-log-count`, `#dev-recap-out`

### 9. Setup Tab (`tab-setup`)
Five steps via `showSetupStep()`: Session Zero, Characters, World, Equipment, Plugins

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
          bonds: {}, quirks: [], experimentLog },
    cells: [{name, size, temperament, escDC, weight, notes}],
    cargo: [{name, qty, weight, type, notes, ts, location}],
    hoard: [{name, qty, weight, type, notes, ts, location}],
    hp, hp_max, ac, conditions, wagonName, wagonDesc
  },

  relationships: [{from, to, disposition, dynamic, aiOnly, pending}],

  combat: {
    active: bool, round: num, currentIdx: num, moveMode: 'ai'|'manual',
    list: [{name, hp, hp_max, ac, val (initiative), isPC, zone, conditions, concentrating, condDurations: {condName: rounds}}],
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
  campaignSetup: { tone, origin, goal, lines },  // Session Zero Step 0 fields — persisted inline, injected into buildPrompt()
  saveVersion: 12
}
```

---

## STATE_KEYS (Firebase sync)

Synced: `pcs`, `worldData`, `npcs`, `quests`, `treasuryData`, `partyInventory`, `wagon`, `combat`, `encounterPresets`, `scenes`, `activeSceneIdx`, `snippets`, `dmSecrets`, `logSummary`, `logs`, `activeEditTab`, `turnCount`, `turnsSince`, `chkCount`, `chkMode`, `chkHistory`, `rewindStack`, `wagonFilter`, `chatHistory`, `oocHistory`, `partyChat`, `plugins`, `errorLog`, `sessionNotes`, `storyChapters`, `prevSessionSummary`, `aiContracts`, `sessionArchive`, `locations`, `consequences`, `headerShortcuts`, `campaignSetup`

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
- `renderCompendium(idx)` — Browsable spell/maneuver compendium with class/level filters, search, grouped by level, + Add button
- `_sortSpellbook(book)` — Sorts spellbook by level (cantrips first) then alphabetically. Called from: spell_add mechanic, spell picker addSpellToBook, manual addSpell, updSpell on name/level change, migrate() on load
- `renderPartyPCList()` — Compact PC list with HP bars and XP progress
- `renderSessionArchive()` — Collapsible session archive entries, newest-first
- `renderLocations()` — Node Map SVG + location list
- `renderHeaderShortcuts()` — Customizable ☰ shortcut grid
- `renderContracts()` — AI contract textareas from `state.aiContracts{}`
- `renderHUD()` — PC tiles, Grit tile, Familiar tile
- `renderContextStrip()` — Carousel with dot indicators; cycles through slides from `_ctxSlides()` (location, time, weather, quest, combat round, party HP, module episode). `_tapCtxStrip()` advances manually; `_ctxTimer` auto-rotates at 5s interval
- `renderTurnTracker()` — Horizontal initiative strip in lower-dock during combat. Gold=active, green=PC, red=enemy, dimmed=dead. Hidden when `!state.combat.active`
- `syncWorld()` — Refresh all world tab displays; also calls `renderJournalHeader()`, `renderJournalRep()`
- `renderJournalHeader()` — Journal header: location, time/weather, HP bars, tracker counts, Previously On + Catch Up chips
- `renderJournalRep()` — Town reputation list in Journal (`#journal-rep-list`)
- `renderTravelLog()` — Travel timeline with cross-linked quest/NPC/rep chips, most-recent-first
- `previouslyOn()` — Enhanced: detects sparse trackers, expands to 20-msg context, injects quest/location/NPC/rep mechanics, strips mechanics from display
- `catchUpAudit()` — Sends tracker snapshot + recent 20 messages for AI audit, runs parseMechanics on response
- `_mechPillNav(el)` — Pattern-matches mechanic pill textContent to navigate to relevant app section

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
- `buildPrompt(ledger)` — System prompt with all contracts; validates MULTI-PLAYER ADDRESSING clause
- `genLedger()` — Compile current state ledger
- `parseMechanics(responseText, msgId)` — 60 handlers / 65 keys; `_MECH_KEYS` controls display stripping
- `previewMechanics(text)` — Extracts mechanic preview from AI response text for ⚡ pill display; supports `---MECHANICS---`, `**MECHANICS**`, `MECHANICS:` formats; strips bullet prefixes
- `callAI(messages, sysProm, maxTok)` — Retry wrapper (2x, 1.2s/2.4s, 5xx); free-model fallback
- `summarizeAndPrune()` — Background summary at 75 msgs → pushes to `sessionArchive[]` (50-cap)
- `sendContextRefresh()` — Full context refresh via `_ctxInject`: location, PC HP/conditions/concentration, combat zone grid (if active)
- `_renderInvChips(containerId,items,listType,editIdx,setEditIdx,filterState,setFilterFn,emptyMsg,searchTerm)` — Shared chip renderer for party inv, wagon cargo, hoard, and PC inventory. 9th param `searchTerm` filters items by name/notes while preserving original array indices for edit/delete callbacks
- `_invSearch` / `_setInvSearch(v)` — Inventory search state; renders search bar in Cargo/Hoard panels with clear button, auto-focuses after input
- `setCargoPCFilter(name)` — Toggle per-PC inventory view in Cargo tab (Wagon + per-PC buttons)
- `_getWList(list)` — Resolves list type string ('cargo'/'hoard'/'pc_N') to the correct item array
- `resyncAI()` — Full ledger re-sync
- `verifyContracts()` — Validates all 10 contract checks + injects contracts into next AI send
- `detectUnloggedGold()` / `detectUnloggedNPC()` / `detectUnloggedItem()` — Confirm-chip prompts for unlogged mechanics
- `detectUnloggedDamage()` / `detectUnloggedHealing()` — Catch narrated HP changes without `hp:` mechanic
- `detectUnloggedCondition()` — Catch narrated condition adds without `conditions:` mechanic (14 D&D conditions)
- `detectUnloggedLocation()` — Catch narrated arrivals without `location:` mechanic
- `_validateMechanics(changes)` — Post-parse audit: clamps HP/slots/resources to valid ranges, deduplicates conditions, floors treasury at 0, encumbrance warnings (PC carry STR×15, wagon 1080lb), income log dedup (same desc+amt+type), toasts corrections
- `_pcCarryWeight(pc)` / `_pcCarryCap(pc)` — PC personal carry weight from inventory, capacity = STR×15
- `toggleItemTag(list, idx, tag)` — Toggle a type tag on/off for multi-category items (comma-separated)
- `detectProseRolls(prose)` — Regex detection of AI rolling dice in prose text; warns via toast
- `_renderRollQueue()` — Renders stacked roll_request banners from `_rollRequestQueue[]`
- `openRollFromQueue(idx)` — Opens roll sheet pre-filled with skill/PC from queued request
- `dismissRollRequest(idx)` — Removes entry from roll queue (or clears all if no idx)
- `removeIncomeEntry(idx)` — Tap-to-delete income log entry with treasury adjustment and confirm

### Location System
- `renderLocations()` — List view (Node Map SVG + cards) or Map view (area map + pins)
- `_renderAreaMap()` — Area map image with positioned pin markers
- `setLocView(mode)` — Toggle between 'list' and 'map' views
- `uploadAreaMap()` / `removeAreaMap()` — Map image management (localStorage)
- `startMapPlace(id)` / `cancelMapPlace()` / `handleMapTap(e)` — Tap-to-place workflow
- `pinAction(locId)` — Tap pin → highlight + show action bar below map
- `movePin(locId)` — Single-function move: sets place mode + renders once (avoids mid-handler DOM destruction)
- `unpinFromMap(locId)` — Remove individual pin from map without deleting the map
- `closePinMenu()` — Dismiss pin action bar
- `openLocationSeed()` / `closeLocSeed()` / `confirmLocationSeed()` — Draft locations from campaign data
- `openLocationDetail(id)` — Detail bottom sheet with anchored NPCs, quests, consequences, rep, income; includes Move/Unplace/Details buttons for map pins
- `_closeAllOverlays()` — Closes all fixed overlays (loc-ov, grit-ov, familiar-ov, loc-seed)

### Zone Combat
- `renderCombat()` — Zone grid with token chips, initiative strip, active character card
- `_tokenHTML(c, idx)` — Render single token chip (HP bar, conditions, active glow)
- `_zoneBoxHTML(zoneId)` — Render zone box with label, effects, and contained tokens
- `zoneTokenTap(idx)` — Select token in manual mode for movement
- `zoneBoxTap(zoneId)` — Move selected token to target zone (manual mode)
- `zoneHPAdj(idx, delta)` — Inline HP preset buttons (+1/+5/-1/-5) on active card; triggers concentration check on damage
- `zoneHPCustom(idx)` — Custom HP adjust from `#zac-custom-hp` input field
- `quickAddCond(idx)` — Add condition from `#zac-cond-pick` dropdown + optional duration from `#zac-cond-dur` input (rounds)
- `_tickCondDurations(entIdx)` — Decrement condition durations at end of combatant's turn; auto-expire and toast when 0
- `_injectTurnCtx()` — Sets `_ctxInject` with current turn context (who's up, HP, conditions with durations, zone) for AI awareness
- `_combatLedgerBlock()` — Shared helper generating compact combat zone grid text for genLedger + sendContextRefresh
- `COMBAT_ONLY_CONDS` — `Set(['Prone','Grappled','Restrained'])` — auto-cleared on endCombat; persistent conditions synced back to PC sheets
- `toggleMoveMode()` — Switch between AI-driven and manual movement
- `addCombatant()` — Add combatant with zone dropdown
- `cloneCombatant(idx)` — Duplicate non-PC combatant at full HP with auto-numbered suffix (Goblin → Goblin 2), randomized initiative, same zone
- `addPartyToCombat()` — Auto-add all PCs + Grit/Wagon to zones
- `endCombat()` — End combat, sync persistent conditions + concentration back to `state.pcs[]`, write summary to location history, reset zones
- Active card shows death save tracker when PC at 0 HP

### Quick Actions
- `executeQA(action)` — Execute by type (23 types)
- `renderQAMenu()` — FAB + sliding menu
- `openQASheet(title, bodyHtml, onConfirm)` — Bottom sheet dialog

### Level-Up Wizard
- `checkLevelUp(pc)` → `openLevelUpWizard(idx)` → `_renderLevelUpStep()` → `applyLevelUp()`
- **Feat selection** — ASI/Feat toggle on ASI step. `FEATS_DB` (56 feats: 42 PHB + 14 TCoE) with descriptions, half-feat ability picker, search filter
- **Current ability scores** — compact score display at top of ASI step for reference
- **Spell swap** — optional step for spellcasters to replace one known spell with another from class list
- Helper functions: `_luSetASIMode()`, `_luSelectFeat()`, `_luUpdateFeatAbility()`, `_luFilterFeats()`, `_luSelectSwapOld()`, `_luSelectSwapNew()`, `_luParseKnownSpells()`, `_luGetSwapPool()`

### Removed / No-Op
- `renderStepBar()` / `renderSceneLabel()` — empty no-op functions (step bar replaced by turn tracker in Session 18)
- `executeStep()`, `_stepTarget` — removed from active codebase; only remnants in `index_monolith.html` (legacy)

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

**Story:** `quest_add` (auto-anchors to current location, writes location history, shows ⚔ chat chip linked to quest detail), `quest_done`, `quest_fail`, `quest_update` (name|status text), `primary_mission`, `npc_add`, `npc_mood`, `consequence_add`, `consequence_resolve`, `chapter_add`, `module_episode`

**Location Journal:** `location_add`, `location_visit`, `location_history`, `location_investment`

**Zone Combat:** `zone_move` (name|zone_id), `zone_add_enemy` (name|hp|ac|zone_id|init), `zone_remove` (name), `zone_effect` (zone_id|effect|type), `zone_label` (zone_id|label), `zone_fog` (zone_id|hide/reveal), `combat_start` (description), `combat_end` (summary)

**Interaction:** `roll_request` (Skill|DC|PCname — queued banners via `_rollRequestQueue[]`, auto-fills roll sheet with skill+PC, dismissed on submit), `save_game`/`save`, `sp_charge` (superpowers plugin)

---

## Quick Action Types (24 total)

`hp`, `condition_add`, `condition_clear`, `resource_use`, `item_add_foraged`, `ox_feed`, `time_advance`, `save_game`, `combat_next`, `log_entry`, `context_refresh`, `town_rep`, `roll_submit`, `state_fix`, `resync_ai`, `surroundings`, `short_rest`, `random_event`, `roleplay_npc`, `char_moment`, `send_scene`, `module_checkin`, `shell_defense_toggle`, `catch_up`

---

## AI Contracts (5 system textareas)

1. **`#ai-persona`** — DM Persona & Tone. Character personalities, campaign tone. **CRITICAL:** MULTI-PLAYER ADDRESSING clause (verified by `buildPrompt`)
2. **`#ai-never`** — What You Never Do. Strict mechanics enforcement (HP, death saves, concentration, shell defense, lucky)
3. **`#ai-actions`** — How You Handle Actions. Roll triggers, DC, degrees of failure
4. **`#ai-continuity`** — Continuity & Wagon. Verify state before every response
5. **`#ai-multi`** — Multi-Player Awareness. Individual character names, one turn per message

---

## OOC Channels

- **❓ Rules Channel** (`showChatTab('ooc')`) — Mechanical clarifications, rulings
- **🗨️ OOC Chat** (`showChatTab('party')`) — Party discussion, badge + browser notifications

---

## `//` Command System

Type `//` before a message in any chat input to run a dev command instead of sending to AI.

| Command | Action |
|---------|--------|
| `// any text` | Log a dev note with game time + location |
| `//flag [N] reason` | Export last N messages (default 20) to clipboard for dev review |
| `//add item "name" [to cargo\|hoard]` | Quick-add item to party inventory, wagon cargo, or hoard |
| `//hp +/-N` | Adjust active PC's HP |
| `//gold +/-N` | Adjust treasury gold |
| `//levelup` | Open Level Up wizard for the first ready PC |
| `//testlevelup` | Force `levelReady=true` on first PC and open Level Up wizard (also: `test levelup`, `testlu`) |
| `//catchup` | Run Catch Up audit — AI reviews tracker state against recent chat and fills gaps via parseMechanics |
| `//explain topic` | Show in-chat help toast (16 topics: actions, combat, map, pins, inventory, ooc, contracts, dice, rest, spells, notes, flags, commands, export, shortcuts, context strip) |
| `//help` | List all available commands |

Functions: `_handleSlashCmd(raw)` — command dispatcher; `SUGGEST_CHIPS{}` — per-channel chip definitions; `EXPLAINS{}` — 16 topic help texts

### Suggestion Chips
- `renderSuggestChips(tab)` — Renders contextual chip row above chat input
- `fillSuggest(el, text)` — Fills chat input from chip tap
- Chips change per channel (narrative/ooc/party/test), include `//` commands for discoverability
- CSS: `.chat-suggest` (scrollable row), `.chat-suggest-chip` (individual chip)

### Gameplay Log Export
- `exportGameplayLog(mode)` — Dev tab panel; 'recent' = last 40 messages, 'full' = entire chat + session archive
- `exportMoment(msgIdx)` — Per-message export via ⚠️ button in chat overflow menu; exports target message + 10 before/after with PC state, mechanics, nearby flags, and analysis prompt
- Both include structured "PROMPT FOR DEV" sections for cross-referencing against shipped features

---

## Additional Features

- **Dice Roller** — d4–d20, send roll to narrative chat with context
- **TTS** — Browser TTS + ElevenLabs (9 voices, stability slider, auto-read toggle)
- **Module Progress Tracker** — Episode status, progress bar, `module_episode:` mechanic
- **Session Archive** — `state.sessionArchive[]`, 50-cap append-based, collapsible entries newest-first
- **Error Flag System** — 7 categories, 4-state verdict cycle, `uiCtx` auto-build, AI audit + JSON export
- **Checkpoint System** — Periodic game-state snapshots for crash recovery and session continuity (NOT narrative — that's the Journal). Auto-triggers on: long rest, level-up, PC at 0 HP, every N AI messages (default 8, configurable 3–30). Manual trigger via ⚡ button. Each checkpoint records timestamp, reason, turn number, and party HP. Accessed via Systems > ⏪ Tools. State fields: `chkCount`, `chkMode`, `chkHistory[]` (30-cap), `msgsSinceChk`, `autoChkInterval`. Functions: `triggerChk()`, `renderChkHist()`, `clearChkHist()`, `logTurn()`, `markChkDone()`
- **Rewind Stack** — Last 10 checkpoint snapshots, one-tap full state restore (chat excluded). Shown alongside Checkpoint History in Systems > ⏪ Tools
- **Skill Proficiency Inference** — Parses `pc.skills` text as fallback when `skillProfs[]` is empty; Expertise detection via "(Expertise)" pattern
- **Firebase Sync** — Config modal, real-time bidirectional sync, clock-independent chat merge
- **Spell Compendium** — `SPELL_DB` (~65 spells, Bard + Wizard cantrips–3rd level), `MANEUVER_DB` (16 Battle Master maneuvers). Functions: `toggleCompendium(idx)`, `openCompendiumFromOverview(idx)`, `setCompFilter(idx,k,v)`, `addFromCompendium(idx,spellName)`, `addManeuverToPC(idx,name)`, `renderCompendium(idx)`. Class/level dropdowns, search, one-tap add to spellbook.
- **Dynamic Skill Calc** — `genLedger()` computes skill modifiers from ability scores + proficiency + expertise instead of stale hardcoded strings
- **Contract 9 — Module Fidelity** — Auto-injected into `buildPrompt()` when `moduleProgress` has entries. Anti-fabrication rules: fabricated content is NON-CANONICAL, never call campaign homebrew.
- **D&D Term Glossary** — `TERM_TIPS` (84 terms): 14 conditions, combat actions, saving throws, combat mechanics (initiative, AC, HP, death saves, crits, weapon properties), spellcasting, resting, terrain, vision, damage types, economy, class features. `_highlightTerms()` auto-links terms in AI messages; `showTermTip()` renders tap popup.
- **Feats Database** — `FEATS_DB` (56 feats: 42 PHB + 14 TCoE). Each entry: name, description, half-feat ability options, prerequisites, source book. Used by level-up wizard ASI/Feat toggle.
- **Condition Duration Tracking** — `condDurations` map on combat.list entries. Optional rounds on conditions. Duration input on quick-add row (`#zac-cond-dur`). Badges show remaining rounds (e.g., "Stunned 2r"). `_tickCondDurations(entIdx)` auto-expires at end of combatant's turn. Turn context injection includes durations for AI.
- **Spellbook Auto-Sort** — `_sortSpellbook(book)` sorts by level (cantrips first) then alphabetically. Applied on: spell_add mechanic, spell picker, manual add, name/level edit, migrate().
- **Test Chat Scenario Chips** — 13 AI-facing prompts in test channel: Award XP, Add condition, Drop loot, Start combat, NPC intro, Damage + cond, Glossary, Rest & recover, Quest hook, Level announce, Test level up. Quote escaping via `&quot;` in onclick attributes.
- **Deep Seed** — `deepSeed()` multi-pass auto-audit: up to 4 passes over progressively older context (recent→older→archive), re-snapshots trackers between passes, stops when no new entries found. `//deepseed` command.
- **Consequence Editor** — `renderConsequences()` expandable `<details>` cards with inline editing (type dropdown, location input, text textarea). `addConsequence()`, `updConsequence(i,k,v)`, `remConsequence(i)`, `clearResolvedConsequences()`. `+` button in section header. Resolved section has "🗑 Clear resolved" bulk purge button.
- **Tracker Dedup Buttons** — `dedupConsequences()`, `dedupNPCs()`, `dedupQuests()`, `dedupLocations()`, `dedupTownRep()` — fuzzy 60% word overlap. 🧹 buttons on each tracker section when >3 entries.
- **Familiar System** — `state.pcs[idx].familiar` object (`{name, type, ac, hp, hp_max, abilities}`). `familiar_hp` mechanic handler. `addFamiliar(idx)`, `updFamiliar(idx,k,v)`. Auto-added to Rear Guard in combat (`addPartyToCombat`). HP synced back after combat (`endCombat`). Familiar HUD tile + overview panel. Compact+full ledger lines.
- **Quest Timeline** — `renderQuests()` grouped by location with timeline dots, NPC chips, status badges, editable location field, always-visible notes.

---

## Planned (Not Yet Built)

- **Inline NPC name linking** — Scan DM messages for known NPC names from `state.npcs`, wrap matches in tappable chips/links that navigate to the NPC tracker entry and highlight it. Enables the "I see a name, I want to know more" instinct.

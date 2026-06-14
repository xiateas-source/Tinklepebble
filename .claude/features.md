# Tinkle's Tinctures — Feature Map

## CSS Architecture

**Root Palette:** Single `:root` block at line 12–32. **Dark steampunk palette active:**
- Primary colors: `--gold:#b07030`, `--gold-dim:#6a3c12`, `--gold-bright:#c88038`
- Surfaces: `--bg:#120d07`, `--surface:#1c1510`, `--surface2:#251b12`, `--surface3:#2e2318`
- Text: `--text:#bfb09c`, `--text-dim:#726252`, `--text-bright:#ddd0b8`
- Red: `#7a3220` (danger), Green: `#425e48`, Blue: `#38586a`, Purple: `#524878`

**Theme Mode Overrides:**
- **Light Mode**: Body class `.light-mode` with warm beige palette (`--bg:#f0d3b6`)
- **Night Mode**: Body class `.night-mode` with deeper sepia (`--bg:#100d0a`, `--gold:#a07840`)

**Last-defined palette wins:** The final `:root` override is the canonical active palette.

**Key Named CSS Classes:**
- `.panel`, `.pc-card`, `.modal-box`, `.chat-msg`, `.cond-chip`, `.log-entry`
- `.btn`, `.btn.gold`, `.btn.red`, `.btn.green`, `.btn.purple`
- `.chat-msg.dm`, `.chat-msg.player`, `.chat-msg.sys`, `.chat-msg.chk-msg`, `.chat-msg.init-msg`
- `.stat-mini` (circular embossed stat tiles, 50% border-radius)
- `.initiative-list`, `.init-row`, `.init-row.current`
- `.qa-fab` (floating action button), `.qa-menu`, `.qa-sheet` (bottom sheet modals)

---

## Tabs (9 total)

### 1. Party Tab (`tab-party`)
- `#party-cards` — Grid of `.pc-card` elements
- `#char-tabs` — Tab row for character editing
- `#edit-sheets` — Character edit sheets (one per PC)
- `#party-inv` — Party-shared inventory list
- `#sp-cards` — Superpowers plugin panel (if active)

### 2. World Tab (`tab-world`)
Two sub-tabs via `showWorldTab()`:
- **World State Panel** (`#world-state-panel`)
  - `#w_scene_title` / `#w_scene_cond` — Active scene management
  - `#w_time`, `#w_season`, `#w_weather`, `#w_illum` — Environment state
  - `#w_location`, `#w_loc_desc` — Current location
  - `#w_setting`, `#w_premise`, `#w_plot`, `#w_timers` — Campaign lore
  - `#t_pp`, `#t_gp`, `#t_ep`, `#t_sp`, `#t_cp` — Treasury coin slots
  - `#treasury-total`, `#session-pl` — Treasury display
  - `#income-log` — Income/expense history
  - `#npc-list` — NPC tracker
  - `#q_primary` — Main quest objective
  - `#quest-list` — Quest log
  - `#town-rep-list` — Town reputation tracking
  - `#campaign-secrets-list` — Secret DM notes
- **Operations Panel** (`#world-ops-panel`)
  - Business profile: `#bp_wagonName`, `#bp_realStock`, `#bp_snakeOil`, `#bp_reagents`, `#bp_reputation`, `#bp_notes`

### 3. Wagon Tab (`tab-wagon`)
- `#ox-name`, `#ox-hp`, `#ox-hp-max`, `#ox-ac` — Grit (ox) stats
- `#ox-feed`, `#ox-cond` — Feeding/condition
- `#ox-backstory`, `#ox-personality` — Flavor
- `#ox-bond-tinkle`, `#ox-bond-pebble`, `#ox-bond-slasher` — Relationship bonds
- `#cap-fill`, `#cap-lbl` — Cargo capacity bar
- `#holding-cells` — Dynamic cages for creatures
- `#wagon-cargo` — General cargo with filters (all, supply, foraged, ingredient, trade, loot)
- `#wagon-hoard` — Pebble's hoard
- `#travel-log-visual` — Travel history with location transitions

### 4. Combat Tab (`tab-combat`)
- `#round-num` — Round counter (large serif display)
- `#init-list` — Initiative tracker rows
- `#new-init-name`, `#new-init-val`, `#new-init-hp`, `#new-init-ac` — Add combatant form
- `#preset-list` — Encounter presets (format: "Name:HP:AC")
- Buttons: "⛺ Short Rest", "🌙 Long Rest"
- Reference: All 11 D&D 5e conditions
- **NOTE: Do NOT refactor — Drop 4 replaces this tab entirely**

### 5. Session Tab (`tab-session`)
Three sub-tabs via `showSessionMode()` / `showSessionTab()`:
- **During Session** (`#sess-play-panel`)
  - `#story-thread` — Textarea for running story narrative
  - `#story-thread-read` — Read-only story display (📖 toggle)
  - `#log-type` — Log entry type selector
  - `#log-input` — Quick log entry textarea
- **Between Sessions** (`#sess-prep-panel`)
  - `#log-entries` — Full session log
  - `#log-summary` — Editable session summary
- **Module** (`#sess-module-panel`)
  - `#module-campaign-name`, `#module-progress-bar`, `#module-episode-list`
  - `#scene-list` — Module scenes with "active scene" marker
  - `#dm-secrets` — Secret DM notes
  - `#snip-list` — Reference snippets (always in AI system prompt)

### 6. AI Tools Tab (`tab-ait`)
- `#ai-persona` — Contract 1: DM Persona & Tone
- `#ai-never` — Contract 2: What You Never Do
- `#ai-actions` — Contract 3: How You Handle Actions
- `#ai-continuity` — Contract 4: Continuity & Wagon
- `#ai-multi` — Contract 5: Multi-Player Awareness
- `#ledger-fmt` — Compact/Full/Combat ledger format selector
- `#ledger-prefix` — Custom ledger intro text
- `#ledger-out` — Compiled ledger display (readonly)
- `#ledger-tokens` — Token count display
- `#qa-editor-list` — Quick actions customization
- `#fb-config-input` — Firebase config JSON
- `#rewind-list` — Last 10 snapshots

### 7. AI DM Tab (`tab-dm`)
- `#chat-tab-narrative` — Main narrative feed (📖 Narrative)
- `#chat-tab-ooc` — Systems channel (⚙ Systems)
- `#chat-tab-party` — OOC/party chat (🗨️ OOC with unread badge `#party-badge`)
- `#chat-msgs` — Chat message display area
- `#chat-input` — Message input textarea
- `#send-btn` — Send button
- `#typing-ind` — "DM is writing..." indicator
- `#offline-banner` — Cached response indicator
- `#dice-picker-panel` — Dice buttons (d4, d6, d8, d10, d12, d20)

### 8. Dev Tab (`tab-dev`)
- `#session-notes` — Developer notes (never sent to AI)
- `#error-log-list` — Error log entries with verdicts
- `#error-log-count` — Flag count badge
- `#dev-recap-out` — Ops debrief output

### 9. Setup Tab (`tab-setup`)
Five steps via `showSetupStep()`:
- **Step 0:** Session Zero (tone, origin, goal, lines, premise)
- **Step 1:** Characters (PC edit forms)
- **Step 2:** World (setting, mission, factions, secrets)
- **Step 3:** Operation (wagon name, cover, real stock, snake oil, gold)
- **Step 4:** Plugins (plugin terminal + command input)

---

## State Model

```
state = {
  pcs: [{
    id, name, race, class, level, background, alignment,
    hp, hp_max, ac, initiative, speed, passive_perception, passive_insight,
    xp, color (hex),
    str, dex, con, int, wis, cha (all as "10 (+0)" format),
    skills, features, magic,
    resources: [{name, max, used, restore, desc}],
    conditions: [], slots: [{max, used}], inventory: [],
    backstory_origin, backstory_motivation, backstory_secret,
    concentrating: "", pending: []
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
  quests: [{text, status, hidden, done, pending}],

  treasuryData: {
    pp, gp, ep, sp, cp, lifestyle,
    incomeLog: [{desc, amt, type (in/out), category, ts}]
  },

  partyInventory: [{name, qty, weight, type, notes}],

  wagon: {
    ox: {
      name, hp, hp_max, ac, conditions, feed (fed/hungry/starving),
      backstory, personality, bonds: {tinkle, pebble, slasher}, quirks: [], experimentLog
    },
    cells: [{name, size, temperament, escDC, weight, notes}],
    cargo: [{name, qty, weight, type, notes, ts, location}],
    hoard: [{name, qty, weight, type, notes, ts, location}],
    hp, hp_max, ac, conditions, wagonName, wagonDesc
  },

  relationships: [{from, to, disposition, dynamic, aiOnly, pending}],

  combat: {
    active: bool, round: num, currentIdx: num,
    list: [{name, hp, ac, initiative, conditions, concentrating}]
  },

  encounterPresets: [{name, enemies: "Name:HP:AC, ..."}],
  scenes: [{name, active, content, notes}],
  activeSceneIdx: num,
  snippets: [{id, name, text, active}],
  dmSecrets: string,

  chatHistory: [{role, content, playerName, playerChar, ts, realTs, isCheckpoint, mechanics, isInitiative}],
  oocHistory: [{role, content, ts}],
  partyChat: [{playerName, playerChar, content, ts}],

  logSummary: string,
  logs: [{ts, type (dm/player/combat/loot/rest), body}],
  storyThread: string,
  sessionNotes: string,

  errorLog: [{id, category, sectionCtx, location, gameTs, ts, verdict, resolved, note}],
  plugins: [{id, name, version, manifest}],

  // Checkpoint & turn tracking
  turnCount, turnsSince, chkCount, chkMode, msgsSinceChk, autoChkInterval,
  chkHistory: [{ts, reason, snapshot}],
  rewindStack: [state snapshots],

  // UI state
  activeEditTab: num,
  wagonFilter: "all"|"supply"|"foraged"|"ingredient"|"trade"|"loot",

  quickActions: [{id, label, type, params, context: [tab list]}],
  saveVersion: 7
}
```

---

## STATE_KEYS (Firebase sync)

Synced: `pcs`, `worldData`, `npcs`, `quests`, `treasuryData`, `partyInventory`, `wagon`, `combat`, `encounterPresets`, `scenes`, `activeSceneIdx`, `snippets`, `dmSecrets`, `logSummary`, `logs`, `activeEditTab`, `turnCount`, `turnsSince`, `chkCount`, `chkMode`, `chkHistory`, `rewindStack`, `wagonFilter`, `chatHistory`, `oocHistory`, `partyChat`, `plugins`, `errorLog`, `sessionNotes`

Device-local only (not synced): API keys (`tt_gk`, `tt_ok`), provider/model selections, TTS settings, player name/character, offline cache.

---

## SAVE_VERSION & migrate()

**Current Version:** `SAVE_VERSION = 7`

`migrate(s)` patches loaded state unconditionally (all cases apply based on field existence):
- Ensures all arrays/subfields exist
- Deduplicates NPCs, quests, inventories
- Merges canonical PC data from defaults while preserving player progress
- Fixes stale premise text and auto-resolves dev flags
- Remaps old tab IDs
- Ensures all 23 canonical quick actions exist

---

## Constants

- **MAX_LB** = 1080 (cargo capacity in pounds)
- **ALL_CONDS**: Blinded, Charmed, Deafened, Exhausted, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious
- **ITYPES**: supply, foraged, ingredient, trade, loot, hoard, misc, key
- **XP_T**: [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000]

---

## Core Functions Index

### Render
- `renderAll()` — Master render: calls all individual renders
- `renderChat()` — Populate #chat-msgs with message history
- `renderPartyCards()` / `renderCards()` — Character card grid
- `renderCharTabs()` — Character edit sheet tabs
- `renderSheets()` — Character stat & inventory edit forms
- `renderPartyInv()` — Party-shared inventory
- `renderNPCList()` / `renderNPCs()` — NPC tracker display
- `renderQuestList()` / `renderQuests()` — Quest log
- `renderCombat()` — Initiative tracker & round counter
- `renderCapacity()` — Cargo weight bar
- `renderCargo()` — Filtered wagon cargo display
- `renderHoard()` — Pebble's hoard
- `renderCells()` — Holding cell list
- `renderTravelLog()` — Travel log visual (location chain)
- `renderIncome()` — Income/expense log
- `renderTreasuryTotal()` — Treasury coin display & totals
- `renderSessionPL()` — "Profit/Loss since session start"
- `renderStatusMini()` — Header party HP badges
- `renderErrorLog()` — Error flag review list
- `renderStoryRead()` — Story thread read-only display
- `renderQAMenu()` — Quick actions floating menu
- `renderModuleTracker()` — Module progress & episodes
- `renderSceneList()` — Module scenes with active marker
- `syncWorld()` — Refresh all world tab displays

### Save/Load/Migration
- `save()` — Serialize state to localStorage + Firebase
- `loadState()` — Deserialize from localStorage
- `saveRefresh()` — save() + renderAll()
- `migrate(s)` — Data structure repair
- `exportConfig()` — Download JSON backup
- `importConfig()` — Upload JSON
- `importFromPaste()` — Paste JSON import
- `copyStateCompact()` — Copy to clipboard

### Firebase Sync
- `fbInit(config)` — Initialize Firebase
- `fbStartListening()` — Subscribe to remote changes
- `fbLoad()` — Load state from Firebase
- `fbSave(state)` — Push state to Firebase
- `fbDisconnect()` — Unlink Firebase

### AI/Chat
- `sendMsg()` — Send player action to AI
- `buildPrompt(ledger)` — Construct system prompt with all contracts
- `genLedger()` — Compile current state ledger
- `parseMechanics(responseText)` — Parse AI mechanics block & apply changes
- `callAI(messages, sysProm, maxTok)` — Make API call (Google/OpenRouter)
- `speakIdx(msgIdx)` — TTS a chat message
- `detectUnloggedGold(prose, changes)` — Find prose mentions of gold without matching mechanic
- `confirmLedgerChip(amt, dir)` — One-tap gold logging UI
- `mechToast(changes)` — Visual toast + tab flash for parsed mechanics

### Quick Actions
- `executeQA(action)` — Execute quick action by type
- `renderQAMenu()` — Render FAB + sliding menu
- `openQASheet(title, bodyHtml, onConfirm)` — Generic bottom sheet dialog

### Treasury & Income
- `addIncome()` — Form submission → treasuryData.incomeLog
- `renderTreasuryTotal()` — Show total GP value
- `renderSessionPL()` — Calculate profit/loss since session start
- `detectUnloggedGold()` — Mention-based logging catch

### Combat
- `nextTurn()` — Advance round/turn
- `endCombat()` — Clear combat state
- `addCombatant()` — New initiative entry
- `addPartyToCombat()` — Roll initiative for all PCs
- `doShortRest()` — Trigger short rest
- `doLongRest()` — Trigger long rest (full heal + checkpoint)
- `rollInitiativeToChat()` — Broadcast initiative to narrative chat

### Notifications & Badges
- `updatePartyBadge()` — Unread party chat count
- `clearPartyBadge()` — Clear badge
- `requestNotifPermission()` — Browser notification permission
- `flashTab(tabId)` — Highlight tab if not visible

### Theme
- `toggleThemeMode()` — Cycle through dark/light/night
- `_applyTheme(mode)` — Apply theme by name
- `initThemeMode()` — Load theme from localStorage on startup

### Flags & Dev
- `flagIt(cat, sect, loc, note)` — Capture error flag
- `renderErrorLog()` — Error flag list + verdict UI
- `exportFlagReport(mode)` — Export pending/all flags as JSON
- `clearResolvedFlags()` — Remove resolved entries
- `auditWithAI()` — Send failures to AI for review
- `sessionRecap()` — Compile ops debrief

### Miscellaneous
- `toast(msg)` — Yellow notification bubble
- `esc(s)` — HTML escape utility
- `findPC(name)` — Lookup PC by name or ID
- `showTab(id)` — Switch main tab
- `showWorldTab(tab)` — World state/ops sub-tab
- `showSessionMode(mode)` — Session play/prep/module
- `showSessionTab(which)` — Session sub-tab
- `showSetupStep(n)` — Setup wizard step
- `openModal(id)` / `closeModal(id)` — Modal overlay
- `openRollSheet()` — Dice picker modal
- `toggleCond(idx, cond)` — Add/remove condition on PC
- `upd(idx, key, val)` — Update PC field
- `adjHP(idx, isHeal)` — Damage/heal PC
- `addNewChar()` — Add new PC to state
- `addNPC()` — Add NPC to state
- `addQuest()` — Add quest to state
- `addPartyItem()` — Add item to party inventory
- `addIncome()` — Log income/expense
- `triggerChk(reason)` — Force checkpoint snapshot
- `sendContextRefresh()` — Lightweight location/condition refresh to AI
- `resyncAI()` — Full ledger re-sync to AI
- `handlePluginCmd()` — Execute plugin terminal command
- `quickSellItem(idx)` — Sell wagon item (removes & logs income)

---

## AI Mechanics (parseMechanics keys)

Parsed from AI response blocks in format: `key: value`

- `hp`: `pcname=number` — Set absolute HP
- `hp_max`: `pcname=number` — Set max HP
- `conditions`: `pcname+condition` / `pcname-condition` — Add/remove conditions
- `concentration`: `pcname=none | spell_name`
- `location`: `text` — Set location + log transition
- `time`: `text` — Update worldData.time
- `weather`: `text`
- `travel_note`: `text` — Append note to last travelLog entry
- `loc_desc`: `text`
- `gp`/`sp`/`cp`/`ep`/`pp`: `+amount | -amount | number` — Modify/set coin
- `item_add`: `target, name, qty, type, weight` — target: wagon/cargo/hoard/party/pcname
- `item_remove`: `target, name, qty`
- `slot_use`: `pcname=level`
- `slot_restore`: `pcname=level | all`
- `resource_use`: `pcname, resourcename`
- `resource_restore`: `pcname=resourcename | all`
- `shell_defense`: `tinkle=on | off`
- `wagon_cell_add`: `name, size, temperament, escDC, weight`
- `wagon_cell_update`: `name, temperament`
- `wagon_cell_remove`: `name`
- `wagon_hp`: `number`
- `ox_hp`: `number`
- `ox_condition`: `text`
- `income`: `amount, category, description`
- `expense`: `amount, description`
- `xp`: `pcname+amount`
- `quest_add`: `name | description`
- `quest_done`: `partial_name`
- `quest_fail`: `partial_name`
- `primary_mission`: `text`
- `npc_add`: `name, disposition, details`
- `npc_mood`: `name=disposition`
- `pc_update`: `pcname, field, value`
- `pc_add`: `name, race, class, level, hp, ac, initiative`
- `pc_delete`: `pcname | id`
- `module_episode`: `N, active | complete`
- `short_rest`: `pcname, ...`
- `town_rep`: `town, status, notes`
- `save_game` / `save`: Force immediate save
- `sp_charge`: `pcname=ready | spent` (superpowers plugin)

---

## Quick Action Types (executeQA switch)

- `hp` — Adjust PC HP (damage/heal dialog)
- `condition_add` — Select condition & add to PC
- `condition_clear` — Remove all conditions from PC
- `resource_use` — Decrement resource pip
- `item_add_foraged` — Quick-add foraged item to wagon cargo
- `ox_feed` — Toggle ox feed status (fed/hungry/starving)
- `time_advance` — Increment worldData.time
- `save_game` — Immediate save
- `combat_next` — Advance combat turn/round
- `log_entry` — Add session log entry
- `context_refresh` — Send scene snapshot to AI
- `town_rep` — Log town reputation change
- `roll_submit` — Open dice picker + send roll to chat
- `state_fix` — Auto-repair common state corruption
- `resync_ai` — Send full ledger to AI
- `surroundings` — AI describes surroundings based on location
- `short_rest` — Trigger short rest
- `random_event` — AI generates random event
- `roleplay_npc` — AI roleplays selected NPC
- `char_moment` — AI generates character moment
- `send_scene` — Broadcast active scene to chat
- `module_checkin` — Module episode progress check
- `shell_defense_toggle` — Toggle Tinkle's shell defense (qa_23)

---

## AI Contracts (5 system textareas)

Each is a permanent AI instruction in every system prompt:

1. **`#ai-persona`** — Contract 1: DM Persona & Tone
   - Character personalities (Tinkle Mastermind, Pebble Pitchman, Slasher Honest)
   - Tone: Gritty, darkly comic, grounded
   - Multi-player: always use character names, never generic "you"
   - **CRITICAL:** Slasher must NEVER learn the operation is a con

2. **`#ai-never`** — Contract 2: What You Never Do
   - Strict mechanics enforcement (HP, DEATH SAVES, CONCENTRATION, SHELL DEFENSE, LUCKY, etc.)
   - No silent condition loss between scenes
   - No condition removal without explicit mechanic

3. **`#ai-actions`** — Contract 3: How You Handle Actions
   - Roll trigger: uncertainty + consequences + effort
   - Roll procedure: state DC, wait for result, narrate, consequences
   - Degrees of failure matter

4. **`#ai-continuity`** — Contract 4: Continuity & Wagon Awareness
   - Verify HP, conditions, concentration, location before every response
   - Grit care, town reputation, time updates
   - Strict quest & NPC dedup rules

5. **`#ai-multi`** — Contract 5: Multi-Player Awareness
   - Individual character names always
   - Each player message = one character's turn
   - Wilderness: note 1-3 harvestable ingredients per biome

---

## Ledger (genLedger)

**Format Selection:**
- **Compact** (~600 tokens): HP, conditions, resources, location, active combat
- **Full** (~2500 tokens): Complete state dump
- **Combat Focus** (~800 tokens): Initiative, HP, conditions, current combatant

**Output Sections (in order):**
1. Prefix (customizable)
2. PARTY — All PCs: HP/MaxHP, AC, conditions, slots, resources
3. INVENTORY — Party-shared items
4. NPCS — Known NPCs with disposition
5. QUESTS — Active quests + main mission
6. WORLD STATE — Time, location, weather, scene, town reputation
7. TREASURY — Coin totals + recent income/expense log
8. COMBAT (if active) — Initiative list + round counter
9. WAGON — Grit HP/conditions, cargo weight, holding cells
10. TRAVEL LOG — Recent location transitions
11. ACTIVE SCENE — Current module scene
12. SECRET NOTES (DM only) — dm_secrets content

---

## OOC Channels

**1. ⚙ Systems Channel** (`showChatTab('ooc')`)
- Purpose: Mechanical clarifications, rulings, admin
- Context: Live ledger injected on every send
- AI handles without contradicting established narrative

**2. 🗨️ OOC Chat** (`showChatTab('party')`)
- Purpose: Out-of-character party discussion
- Badge: `#party-badge` unread count
- Notification: Browser notification + in-app toast when other player posts
- Context: Live ledger injected on every send

---

## Plugins

**Plugin Terminal:** Command line at `#plugin-terminal` → `#plugin-input`

**Commands:** `claude plugin install <name>@<registry>`, `claude plugin list`, `claude plugin uninstall <id>`

**Currently Registered:**
1. **superpowers@1.0.0** — Superpower cards in Party tab, `sp_charge:` mechanic

---

## Key Element IDs Reference

**Chat:** `#chat-msgs`, `#chat-input`, `#chat-tab-narrative`, `#chat-tab-ooc`, `#chat-tab-party`, `#party-badge`, `#typing-ind`, `#offline-banner`

**Party/Combat:** `#party-cards`, `#party-inv`, `#init-list`, `#round-num`

**World/Treasury:** `#treasury-total`, `#session-pl`, `#income-log`, `#travel-log-visual`, `#town-rep-list`, `#npc-list`, `#quest-list`

**Wagon:** `#wagon-cargo`, `#wagon-hoard`, `#cap-fill`, `#cap-lbl`, `#holding-cells`, `#ox-name`, `#ox-hp`, `#ox-ac`

**UI/Utility:** `#toast`, `#mech-toast`, `#story-thread`, `#story-thread-read`, `#ledger-out`, `#error-log-list`, `#plugin-terminal`, `#fb-config-input`

**Modals:** `#setup-modal`, `#s0-modal`, `#chk-modal`, `#tts-modal`, `#provider-modal`, `#reset-modal`, `#paste-modal`, `#dice-picker-panel`

---

## Additional Features

### Dice Roller
- Modal with d4, d6, d8, d10, d12, d20
- Can send roll directly to narrative chat with context

### Text-to-Speech (TTS)
- Browser TTS: Voice, speed (0.5x–2x), pitch (0.5–2)
- ElevenLabs: API key, 9 voice options, stability slider
- Auto-read toggle for DM responses

### Module Progress Tracker
- 8 default Hoard of the Dragon Queen episodes
- Status: pending/active/complete
- Progress bar + per-episode notes
- `module_episode:` mechanic for AI updates

### Error Flag System
- Categories: mechanics, ai, narrative, setting, typo, infra
- Verdict: pending/pass/fail/resolved
- AI audit + JSON export

### Rewind Stack
- Last 10 state snapshots
- One-tap restore
- No chat history (pure mechanics rewind)

### Checkpoint System
- Manual + auto triggers (long rest, level-up, 0 HP, every N messages)
- Saves snapshot to rewindStack + chkHistory

### Firebase Sync
- Config modal: paste Realtime Database config
- Real-time bidirectional sync of STATE_KEYS fields
- Status: ⚪ local → 🟢 synced
- Fallback: localStorage if Firebase unavailable

# TINKLE'S TINCTURES — PRIME DIRECTIVE (REVISED)
## Mobile AI Virtual Tabletop — Development Mandate
*Revised 2026-06-16 — v1.7.0*

---

## WHO WE ARE

Two developers/players building a complete, phone-native D&D 5e virtual tabletop that runs in a single HTML file, requires no installation, no subscription, and replaces a human DM with an AI that is contractually bound to run the game correctly.

One player (Tinkle). One player (Pebble/Pitchman). One AI DM. One shared Firebase state. Real dice, real consequences, real rules enforcement.

This is not just a D&D companion app. It is a universal AI tabletop that can run any TTRPG from digital books you already own — no new purchases, no human DM required. Bring your rulebook. Load your module. The AI DM reads the contracts and runs the game.

---

## THE PRIME DIRECTIVE

**The app must let two people sit down with their phones, open a browser, and run a full D&D session without any other tools, books, or setup.**

Every decision is evaluated against this. If a feature doesn't serve session play, it's deferred. If a bug breaks the play loop, it's fixed before anything else.

---

## THE THREE LAWS OF THE BUILD

**1. The core loop is sacred.**
Player types action → AI responds → mechanics block parses → state updates → both phones sync. If anything in this chain breaks, it is the only priority until fixed.

**2. The AI must be trustworthy.**
The AI contracts exist because the AI will cheat, skip rules, and invent outcomes without them. Every rule in the contracts was added because the AI broke it in play. The contracts are not documentation — they are enforcement.

**3. Mobile first, always.**
Every UI decision is made for a phone screen in portrait mode, one-handed, mid-session. No feature ships until it works on Android Chrome at xiateas-source.github.io.

---

## CURRENT STATE — CONFIRMED WORKING (v1.7.0, 2026-06-16)

- Firebase real-time sync — both phones live ✓
- Core play loop: player types → AI responds → mechanics parse → state syncs ✓
- Vite build (src/main.js + src/style.css → docs/) — deployed via GitHub Pages ✓
- Mechanics block parser — 35+ handlers, flexible, catches naked variants ✓
- Canonical character sheets — Slasher L3, Tinkle L3, Pebble L3 (SAVE_VERSION 11) ✓
- AI contracts — in `state.aiContracts{}`, Firebase-synced, Slasher security validated on every send ✓
- 4-tab bottom nav — AI DM / Sheet / Logistics / Systems; composite drawers with subnav ✓
- Full-screen chat layout — body flex column, tab-dm fills viewport ✓
- Context-aware quick bar — routes to narrative/OOC/party based on active chat tab ✓
- 6-tab character sheet — Core/Skills/Combat/Spells/Gear/Features; lock/unlock; auto-lock on close ✓
- HUD mosaic — PC tiles (HP/AC/conditions), Grit tile, Familiar (Pip) tile ✓
- Quick Actions — bottom-sheet, 2-col card grid, morphing FAB, custom icon ✓
- Dice roller — character select, roll type, modifier, ±delta row, d4–d% grid ✓
- Flag system — floating ⚑ FAB, 7 categories (incl. Idea), filter pills, 4-state verdict cycle ✓
- World Consequence Engine — `state.consequences[]`, `consequence_add/resolve` mechanics, injected into buildPrompt() ✓
- "Previously On…" — QA action, AI generates 2-sentence recap ✓
- Rolling AI summary (summarizeAndPrune at 75 messages) ✓
- AbortController + 25s timeout + free-model fallback in callAI() ✓
- **Clutter pass (Session 9):** Conditions Reference collapsible, redundant labels removed, padding tightened, Town Rep collapsed by default ✓

---

## OPEN ISSUES (Active)

1. AI compliance gap — AI narrates gold/NPC/item events but doesn't always emit mechanic lines. `detectUnloggedGold()` chip exists; NPC and item equivalents needed.
2. Income/Expense log silent — consequence of #1
3. Skill bonus wrong — Character Editor displays incorrect skill bonus values
4. Dev notes per-note delete — copy works; individual note delete missing
5. Foraged items not populating in inventory — parser format check needed (Flag #3)

**UX issues (Session 9 — fix in UX Pass 2):**
- Combat drawer: initiative tracker, rests, presets never used during play — collapse all by default
- Active Scene: takes too much space, tone doesn't auto-update — collapse or remove
- Grit profile in Wagon: always scrolled past — compress or remove, user checks via HUD tile
- Party Shared Inventory: never used, confusing — remove from Wagon tab
- NPC list: names cut off, no location/when-met context — redesign (tied to Location Journal)
- 📜 Sheet button: should open character sheet directly (pending user confirmation)

---

## ROAD TO DROP 4 (updated 2026-06-16)

**Phase 2 — completed:**
1. ✅ Polish pass — QA menu, flag system, dice roller, spell descriptions, context strip
2. ✅ Character Sheet Rework — 6-tab digital sheet with lock/unlock
3. ✅ DR-6: Contracts → state.aiContracts{} with Firebase sync + Slasher security validation
4. ✅ Visual Redesign v2 — 4-tab bottom nav + composite drawers + stable layout
5. ✅ World Consequence Engine — consequences[], AI mechanics, injected into buildPrompt()
6. ✅ "Previously On…" — QA action
7. ✅ Flag system quick wins — categories, filter pills, verdict cycle, export
8. ✅ Clean without clutter pass — Session 9

**Phase 2 — remaining:**
9. UX Pass 2 — Combat drawer collapse, Active Scene, Grit, Party Inventory, NPC redesign, Sheet button
10. AI Contract Health Check — "Verify Contracts" button
11. Reputation Ripple — burned town propagation to adjacent towns
12. **Location Journal v1** — `state.locations[]`, list UI, AI mechanics (see below)
13. Drop 4: Zone combat map (paused — integrating with Location Journal/Chronicle View architecture)

---

## THE CHRONICLE VIEW (Long-range Vision)

**What it is:** A unified world-state view that replaces the current fragmented panels (Active Scene, Environment, NPC list, Travel Log, Town Rep, World Consequences) with a single spatial + temporal journal of the campaign world.

**Build strategy:** Build new features first, remove old panels after. Each new feature earns the right to delete what it replaces. The app gets cleaner as it gets more capable.

**What gets absorbed:**
- Location Journal absorbs: Active Scene, Environment, Town Reputation, NPC list, Travel Log
- Chronicle View (with map) absorbs: above + World Consequences, Quest Log
- Result: Logistics drawer collapses from 3 dense tabs → 2 clean ones (Chronicle / Cargo)

**Drop sequence:**
- Location Journal v1 (data + list UI) → Phase 2 item 12, next session
- Drop 4: Zone Combat Map (Combat scale — unchanged)
- Drop 5: Area Map renderer sits on top of Location Journal data (location nodes → map pins)
- Drop 5 also: single-layer fog of war, spell effect overlays (circle/cone/line), pre-combat token placement
- Drop 6: Player/DM toggle becomes real Firebase-synced split (Chronicle View public layer)
- Drop 7: Freehand drawing layer, auto grid detection

**Visual direction for Location Journal (decision pending — choose at start of next session):**
- A: Journey Timeline — vertical nodes connected by route line (travel log as visual spine)
- B: Location Switcher — horizontal carousel, swipe between cities like passport pages
- C: Node Map — abstract circles connected by lines, tap node → file slides up ← **recommended** (zero rework when Drop 5 adds image renderer)

---

## LOCATION JOURNAL — DATA MODEL

```js
state.locations = [{
  id: 'loc_greenest',
  name: 'Greenest',
  type: 'town',           // town|city|camp|ruin|dungeon|waypoint
  status: 'visited',      // current|visited|known|unknown
  firstVisited: 'Day 1, 9:00 AM',
  lastVisited: 'Day 3, 2:00 PM',
  rep: { disposition: 'Friendly', notes: '' },
  npcs: [],               // NPC names now → IDs when NPC system gets IDs
  investments: [{ desc:'Mill stake', amount:50, startDay:'Day 1', notes:'' }],
  history: [{ ts:'Day 1', text:'Dragon attack', dmOnly:false }],
  dmNotes: '',
  playerNotes: '',
  mapPos: null            // {x,y} — null until Drop 5 places the pin
}]
```

**AI mechanics to add:** `location_add:`, `location_visit:`, `location_history:`, `location_investment:`

---

## VTT DROPS (updated 2026-06-16)

- **Drop 4** — Zone combat map. 6 spatial zones (Frontline/Backline/Left/Right/Air/Rear). Replaces Combat tab entirely. Do NOT refactor Combat tab before this. Paused pending Location Journal architecture decisions.
- **Drop 5** — Image maps + token overlay. CSS: position:relative map + position:absolute tokens. Store `{row,col}` in state, derive pixels from calibrated grid. Two-tap calibration (handles untrimmed maps). **Also:** single-layer fog (2D boolean grid, tap to toggle), spell effect overlays (SVG circle/cone/line keyed to grid size), pre-combat token placement. Firebase Storage for image URLs.
- **Drop 6** — Player View. Firebase `/session/playerView`. Chronicle View public layer synced here. Requires state visibility split (already designed).
- **Drop 7** — Full VTT layer: freehand drawing (canvas overlay), auto grid detection, fog room reveals, handout/image cards.

---

## PDF/epub Book Ingestion (parallel track)

- Browser FileReader API + PDF.js (client-side text extraction)
- epub.js for epub parsing
- Auto-chunk by chapter/heading; user tags chunks as rules/lore/module_scene/npc_roster/map
- Stored in state.bookChunks[] synced via Firebase
- Inject via _ctxInject on demand or auto-inject on scene entry
- Map images extractable from PDF chunks → feeds directly into Drop 5 image maps

---

## THE CHARACTERS (Canon)

**Slasher** — Black Dragonborn Fighter L3. STR 17, CON 16, AC 16 (Chain Mail), HP 13. Great Weapon Fighting. Second Wind. Smith's Tools. Greatsword. Genuinely believes the operation is a legitimate apothecary. The AI must never reveal the con to him.

**Tinkle** — Tortle Rogue L3. AC 17 (Natural Armor). Blowgun + Torpor Poison (DC 15). Expertise: Deception/Investigation. Shell Defense. Mastermind.

**Pebble** — Goliath Bard L3. CHA 17. Stone's Endurance (2/SR). Lucky Points (3/LR). Spell slots 2. Sleep, Hideous Laughter, Charm Person, Healing Word. Pitchman.

**Grit** — The ox. HP 15. Bonded to Tinkle. Raised from a calf. Has been a test subject. Stoic. Skittish around loud magic.

**The Wagon** — "The Shelled Alchemist." Traveling apothecary facade. Snake oil, real stock, reagents. Con operation.

---

## THE AI CONTRACT PHILOSOPHY

The AI contracts are not suggestions. They exist because:
- The AI forgot to ask for rolls and gave players what they wanted
- The AI skipped concentration saves after damage
- The AI let Pebble cast, use Bardic Inspiration, AND help Slasher in one turn
- The AI resolved hidden enemies without perception checks
- The AI miscalculated Persuasion rolls (15 + 3 ≠ 17)
- The AI said "you" as a catch-all for two distinct characters
- The AI narrated gold transactions and NPC introductions without calling state functions
- The AI duplicated NPCs instead of updating existing records
- Context Refresh and Re-sync were routing to OOC instead of the main narrative AI
- The AI revealed dungeon secrets before players discovered them (→ DUNGEON SECRETS clause)
- The AI progressed scenes without asking players first (→ PLAYER AGENCY clause)
- The AI skipped skill checks (→ SKILL CHECKS clause)

Every contract addition is a rule the AI violated in actual play. The contracts are a growing record of the AI's failure modes, patched one session at a time.

---

## THE GOAL

A session terminal so complete that opening a browser is all that's needed. The wagon is loaded. Grit is hitched. The contracts are signed. The Chronicle View puts the party in their world. Drop 4 puts them on the map.

# DROP 4: Zone Combat Map + Chronicle View Integration
## Architecture Report & Brainstorming Brief
*Prepared for Gemini — 2026-06-16*

---

## 1. PROJECT CONTEXT

**Tinkle's Tinctures** is a mobile-first AI-powered D&D 5e virtual tabletop running as a single-page web app (Vite build → GitHub Pages). Two players use their phones in a shared Firebase-synced session with an AI DM (Google Gemini or OpenRouter models). The AI responds to player messages, emits structured mechanic lines (`hp: slasher=35`, `location: Greenest`, etc.), and a parser (`parseMechanics()`) applies them to game state in real time.

**The Prime Directive:** The app must let two people sit down with their phones, open a browser, and run a full D&D session without any other tools, books, or setup.

**Three Laws:**
1. Core loop is sacred: Player types → AI responds → mechanics parse → state syncs
2. AI must be trustworthy: Contracts enforce rules the AI has violated in play
3. Mobile first, always: Portrait mode, one-handed, mid-session on Android Chrome

---

## 2. WHAT EXISTS TODAY

### 2.1 Current Combat System (to be replaced)

The Combat tab (`tab-combat`) is a flat initiative tracker with no spatial awareness:

**State model:**
```js
state.combat = {
  active: false,     // combat running?
  round: 1,          // current round number
  currentIdx: 0,     // index into list for whose turn it is
  list: [{           // combatant array, sorted by initiative
    name: 'Goblin',
    val: 14,          // initiative roll
    hp: 7,
    ac: 15,
    isPC: false,
    conditions: [],
    concentrating: ''
  }]
}
```

**UI:** A single column of initiative rows (`init-row` divs) showing name, AC, HP input, conditions chips, and a concentration badge. Round counter at top with Prev/Next/End Combat buttons. Below: add-combatant form, "Add All PCs to Initiative" button, encounter presets (format: `Name:HP:AC`), short/long rest buttons, and a static conditions reference.

**What's wrong:**
- No spatial positioning — "I move behind the pillar" is meaningless
- No zone/area concept — AoE spells have no targeting context
- The tab is rarely opened during play (flagged in UX audit)
- It's a data entry form, not a tactical display
- Conditions Reference is static text that wastes screen space

**What works well (keep):**
- Initiative order tracking (sorted list, current turn highlight)
- PC stats sync from character sheets (`isPC` flag → reads `pc.hp`, `pc.ac`)
- Encounter presets (quick-load enemy groups)
- Round counter with prev/next navigation
- parseMechanics integration for `hp:`, `conditions:`, `concentration:`

### 2.2 Current Location Journal (Node Map)

The Location Journal uses an inline SVG node map — abstract circles connected by dashed lines, tappable to open a detail bottom sheet:

**State model:**
```js
state.locations = [{
  id: 'loc_greenest',
  name: 'Greenest',
  type: 'town',          // town|city|camp|ruin|dungeon|waypoint
  status: 'current',     // current|visited|known|unknown
  firstVisited: 'Day 1, 9:00 AM',
  lastVisited: 'Day 3, 2:00 PM',
  rep: { disposition: 'Friendly', notes: '' },
  npcs: ['Governor Nighthill', 'Leosin Erlanthar'],
  investments: [{ desc: 'Mill stake', amount: 50, startDay: 'Day 1', notes: '' }],
  history: [{ ts: 'Day 1', text: 'Dragon attack', dmOnly: false }],
  dmNotes: '',
  playerNotes: '',
  mapPos: null           // {x,y} — null until Drop 5 places the pin
}]
```

**SVG layout:** `NODE_R=20, STEP_X=82, PAD_X=38, SVG_H=160, CY=78`. Nodes alternate vertical position (`CY +/- 22`). Scrollable horizontally. Current location is gold-filled; others are `surface3`. Stroke color reflects reputation (green=friendly, red=hostile, dim=neutral). Type icon (emoji) centered in circle; truncated name label above/below.

**Detail sheet:** qa-sheet bottom drawer with status chips, NPC list, history log (filterable by DM/Player view), investments, player/DM notes, Set Current / Delete buttons.

**AI mechanics:** `location_add:`, `location_visit:`, `location_history:`, `location_investment:` — the AI creates and updates locations automatically during play.

**Seed system:** `openLocationSeed()` parses `travelLog`, `townReputation`, and NPC `lastSeen` to draft locations in bulk.

### 2.3 Supporting World Systems

**Consequences:** `state.consequences[]` with type-colored cards (background/faction/personal/escalation). AI mechanics: `consequence_add:`, `consequence_resolve:`. Resolved items collapse into a `<details>` section.

**Quests:** `state.quests[]` with discovery paragraphs extracted from AI prose, chat message links (`viewQuestInChat`), status cycle (active/done/failed), hidden/visible toggle. AI mechanics: `quest_add:`, `quest_done:`, `quest_fail:`.

**NPCs:** `state.npcs[]` with disposition, lastSeen location, HP, status (active/deceased/departed). AI mechanics: `npc_add:`, `npc_mood:`. `detectUnloggedNPC()` scans AI prose for unlogged attribution verbs.

**Town Reputation:** `state.worldData.townReputation[]` — simple list of town/status/notes entries. Status: good/neutral/burned/fled.

**Travel Log:** `state.worldData.travelLog[]` — vertical timeline nodes showing location transitions with timestamps. Format: `"Day 3: Millhaven → Thornbury | optional note"`.

### 2.4 AI Integration Points

**genLedger()** injects combat state into the AI system prompt:
- Compact mode: `"COMBAT Round 3:\n>>> Slasher HP:35 AC:16\nGoblin HP:7 AC:15"`
- Full mode: Same but with initiative values
- Combat Focus mode: Dedicated combat-optimized format

**buildPrompt()** includes contracts instructing the AI on combat behavior:
- Each player message = one character's turn in initiative order
- Resolve each action as it arrives, don't wait for all players
- Always narrate non-violent options before combat escalates
- The `roll_request: Skill|DC|PCname` mechanic triggers a persistent banner for dice rolls

**parseMechanics()** handles 36+ keys including: `hp`, `hp_max`, `conditions` (+/-), `concentration`, `slot_use`, `slot_restore`, `resource_use`, `resource_restore`, `shell_defense`, `short_rest`, `death_save`, `xp`

**Checkpoint system** auto-saves every 3 turns in combat mode (`CP_INT.combat = 3`).

---

## 3. DROP 4 SPEC: ZONE COMBAT MAP

### 3.1 Core Concept

Replace the flat initiative tracker with a **6-zone abstract spatial grid**. No pixel positioning, no grid squares — just named regions that give tactical meaning to movement and positioning. Think "theater of the mind with structure."

### 3.2 Proposed Zones

```
┌─────────────┐
│     AIR     │
├──────┬──────┤
│ LEFT │RIGHT │
│FLANK │FLANK │
├──────┴──────┤
│  FRONTLINE  │
├─────────────┤
│  BACKLINE   │
├─────────────┤
│    REAR     │
└─────────────┘
```

**Six zones:** Frontline, Backline, Left Flank, Right Flank, Air, Rear

**Why these six:**
- Frontline/Backline: Classic melee-vs-ranged split. Fighter goes front, Bard stays back.
- Left/Right Flank: Flanking, ambushes, tactical positioning. Rogue sneaks to flank.
- Air: Flying creatures, levitate, breath weapons from above.
- Rear: Behind the party. Ambush spawns, retreat position, wagon defense.

### 3.3 Proposed State Model

```js
state.combat = {
  active: false,
  round: 1,
  currentIdx: 0,
  list: [{
    name: 'Slasher',
    val: 14,              // initiative
    hp: 39,
    ac: 16,
    isPC: true,
    conditions: [],
    concentrating: '',
    zone: 'frontline'     // NEW — which zone this combatant is in
  }],
  zones: {                // NEW — zone metadata
    frontline:  { effect: '', terrain: '' },
    backline:   { effect: '', terrain: '' },
    left_flank: { effect: '', terrain: '' },
    right_flank:{ effect: '', terrain: '' },
    air:        { effect: '', terrain: '' },
    rear:       { effect: '', terrain: '' }
  }
}
```

### 3.4 Proposed AI Mechanics

```
zone_move: Slasher|frontline         — move token between zones
zone_add_enemy: Goblin|7|15|left_flank  — add enemy to specific zone
zone_remove: Goblin                  — remove from zones (dead/fled)
zone_effect: frontline|Difficult terrain, debris  — add zone effect
zone_clear_effect: frontline         — clear zone effect
```

These integrate into `parseMechanics()` alongside existing combat mechanics. The AI uses them in the same `---MECHANICS---` block it already emits.

### 3.5 Proposed UI

**Mobile-first layout (portrait):**

The zone map should be a compact visual that fits above the initiative list without scrolling. Tokens are colored tiles/chips inside zone containers.

**Token design:** Small rounded rectangles with:
- PC color (from `pc.color`) or default enemy red
- Name (truncated to ~8 chars)
- HP value
- Current-turn glow (gold border when it's their turn)
- Condition dots (tiny colored pips)

**Zone containers:** Labeled regions with:
- Zone name header
- Effect/terrain badge if active (e.g., "🔥 Burning" in red chip)
- Token slots (flex-wrap layout for multiple combatants)

**Interaction model:**
- Tap token → expand details (HP, conditions, concentration) + action buttons
- Long-press/drag token → move between zones (or tap zone to move selected token)
- Tap zone header → edit zone effect
- Initiative still shown as ordered list below the map (or integrated into zone display)

### 3.6 Integration with Existing Systems

**Must preserve:**
- `renderCombat()` → becomes `renderZoneCombat()` (or renamed)
- `addCombatant()` / `addPartyToCombat()` → add `zone: 'backline'` default for PCs, AI specifies zone for enemies
- `nextTurn()` / `prevTurn()` → unchanged (operates on `list` index)
- `endCombat()` → clears zones too
- `updCombHP()` → unchanged (still mutates `list[i].hp` and syncs to PC)
- Encounter presets → extend format to include zone: `"Goblin:7:15:left_flank"`
- Checkpoint system (combat mode = 3 turns)
- `rollInitiativeToChat()` → add zone assignments

**genLedger() combat section update:**
```
COMBAT Round 3:
FRONTLINE: >>> Slasher HP:35 AC:16, Goblin HP:7 AC:15
BACKLINE: Pebble HP:28 AC:14 [concentrating: Sleep]
LEFT FLANK: (empty)
RIGHT FLANK: Tinkle HP:25 AC:17
AIR: (empty)
REAR: Grit HP:15 AC:10
Zone effects: frontline=Difficult terrain
```

**buildPrompt() additions:**
```
## ZONE COMBAT MECHANICS
When combat is active, every combatant occupies a zone. Use zone_move: to reposition.
Melee attacks: only within same zone or adjacent zones.
Ranged attacks: any zone (disadvantage if target is in same zone with enemies).
AoE spells: affect all creatures in the targeted zone.
Movement: one zone move per turn as part of movement (no action cost).
Adjacent zones: Frontline↔Backline, Frontline↔Left/Right Flank, Backline↔Left/Right Flank, Air↔all, Rear↔Backline.
```

---

## 4. THE CHRONICLE VIEW (Long-Range Vision)

### 4.1 What It Replaces

The Chronicle View is the endgame for all world-state panels. Currently the app has 6+ separate panels displaying overlapping campaign data:

| Current Panel | Location | What It Shows | Chronicle Replaces? |
|---|---|---|---|
| Environment | World State | Time, weather, illumination | Yes (location header) |
| NPC List | World State | Names, dispositions, lastSeen | Yes (pinned to locations) |
| Quest Log | World State | Active/done/failed quests | Yes (quest markers on map) |
| Town Reputation | World State | Town status list | Yes (per-location rep) |
| Travel Log | Wagon tab | Location transition timeline | Yes (path visualization) |
| World Consequences | Operations | Background/faction/personal events | Yes (location-anchored) |
| Location Journal | Locations tab | Node map + detail sheets | IS the Chronicle data layer |

**Result:** Logistics drawer collapses from 3 dense tabs (World/Wagon/Combat) → 2 clean tabs (Chronicle/Cargo). The Combat tab is absorbed by Drop 4's zone map (which could live in Chronicle or as a combat overlay).

### 4.2 Chronicle View Architecture

**One screen answering:** "Where are we, who have we met, what's happening, what do we need to do."

**Data layer (already built):** `state.locations[]` + `state.npcs[]` + `state.quests[]` + `state.consequences[]` + `state.worldData.townReputation[]` + `state.worldData.travelLog[]`

**What needs to happen:**
1. **Anchor NPCs to locations** — NPCs already have `lastSeen` (location name string). Locations already have `npcs[]` (name array). Need to bidirectionally link them so the Chronicle shows NPCs at their locations.
2. **Anchor quests to locations** — Add optional `location` field to quest objects. Quests appear as markers at their associated location.
3. **Anchor consequences to locations** — `consequences[]` already has a `location` field. Show them in location detail sheets.
4. **Route visualization** — Replace the linear node map with something that shows the party's travel path. The existing `travelLog` has `old_location → new_location` transitions.
5. **Active state overlay** — Current location shows time, weather, active scene, and conditions prominently.

### 4.3 Chronicle View Options to Brainstorm

**Option A: Enhanced Node Map (evolutionary)**
Keep the existing SVG node map but add:
- Edge labels showing travel direction/time
- Quest/NPC/consequence count badges on nodes
- Current-location node expands to show live state (time, weather, conditions)
- Tap node → rich detail sheet with all associated data
- Zone combat map appears as an overlay when combat starts at the current location

**Option B: Spatial Canvas (revolutionary)**
Replace the linear node map with a 2D draggable canvas:
- Nodes positioned freely (user places them, or auto-layout)
- Edges draw between connected locations (from travelLog)
- Zoom/pan on mobile (pinch-zoom, touch-drag)
- Current location pulses/glows
- Quest markers, NPC avatars, and consequence indicators as floating badges
- When Drop 5 adds image maps, the canvas becomes the image layer

**Option C: Split Panel (pragmatic)**
Keep the node map as a navigation element (top strip, horizontally scrollable) but add a main content area below that shows the current location's full context:
- Location details (type, rep, NPCs, history)
- Active quests at this location
- Active consequences at this location
- Travel connections (where can we go from here)
- Zone combat map (when combat is active)

### 4.4 How Drop 4 and Chronicle View Interact

Drop 4 (Zone Combat) and the Chronicle View share a spatial concept: zones are the "micro" spatial layer (within a location), while the Chronicle is the "macro" spatial layer (between locations).

**Natural integration:**
- Chronicle shows the world map (locations, paths, NPCs, quests)
- When combat starts at the current location, the zone map appears as a tactical overlay
- The zone map's "Rear" zone could represent the direction toward the nearest connected location (retreat path)
- Zone effects (difficult terrain, burning, etc.) could persist as location history entries

**Shared UI patterns:**
- Both use SVG or DOM-based spatial visualization
- Both use tappable nodes/tokens with detail sheets
- Both need to work on a small phone screen in portrait mode
- Both integrate with the same parseMechanics pipeline

---

## 5. TECHNICAL CONSTRAINTS

### 5.1 Hard Requirements
- **Mobile portrait, one-handed:** Everything must be tappable with a thumb. No hover states. No drag-and-drop that requires precision.
- **Vite build:** `src/main.js` + `src/style.css` → `docs/`. No framework, no React, no build-time templating.
- **Firebase sync:** `STATE_KEYS` controls which fields sync. Combat state already syncs. New fields (zones) must be added to STATE_KEYS.
- **SAVE_VERSION gate:** New state structure = bump SAVE_VERSION + add `migrate()` gate. Must not break existing saves.
- **parseMechanics integration:** New mechanics must follow the `key: value` format and be added to `_MECH_KEYS`.
- **AI prompt budget:** genLedger compact mode targets ~600 tokens. Zone data must be terse.
- **Soft Autumn palette:** All new UI uses the existing CSS variables (`--gold`, `--surface2`, `--red`, etc.)

### 5.2 Existing Patterns to Reuse
- **Bottom sheet drawers:** `.drawer-sheet` + `.is-open` transform for detail panels
- **Token styling:** PC cards already use `pc.color` for border/accent. Combat `init-row.current` has gold glow.
- **Mechanic toast:** `mechToast(changes)` shows a stacking feed of parsed changes. Zone moves should toast.
- **Nav dot flash:** `flashTab(tabId)` notifies when AI changes happen on hidden tabs.
- **Context strip:** `renderContextStrip()` shows current location or combat state in the header bar.

### 5.3 What NOT to Do
- No grid-square system (that's Drop 5)
- No image maps (that's Drop 5)
- No fog of war (that's Drop 5)
- No player view split (that's Drop 6)
- No pixel-level token positioning
- No canvas element (SVG or DOM only)
- Don't break the existing initiative order mechanic
- Don't make it too complex for the AI to emit correctly

---

## 6. THE CHARACTERS (for AI brainstorming context)

**Slasher** — Black Dragonborn Fighter L3 (Battle Master). STR 17, AC 16 (Chain Mail), HP 39. Greatsword. Great Weapon Fighting. Second Wind. He goes to the frontline. Always.

**Tinkle** — Tortle Rogue L3 (Arcane Trickster). AC 17 (Natural Armor). Blowgun + Torpor Poison. Shell Defense (AC 21 but prone + incapacitated). Mastermind. Stays in the backline or flanks.

**Pebble** — Goliath Bard L3 (College of Lore). CHA 17. Stone's Endurance. Lucky Points (3/LR). Sleep, Hideous Laughter, Charm Person, Healing Word. Stays in the backline casting.

**Grit** — The ox. HP 15. Hitched to the wagon. Usually in the rear unless the wagon is directly threatened.

**The Wagon** — "The Shelled Alchemist." The party's mobile base. Often parked in the rear zone during combat.

**Typical combat scenario:** The party is ambushed on the road. Slasher charges to the frontline. Tinkle sneaks to a flank with the blowgun. Pebble stays back casting Sleep. Grit and the wagon are in the rear. Bandits come from the left flank and the air (archers on a ridge).

---

## 7. OPEN QUESTIONS FOR BRAINSTORMING

1. **Zone adjacency rules:** Should melee attacks work across adjacent zones, or only within the same zone? How does this interact with reach weapons or the Rogue's sneak attack?

2. **Movement economy:** One free zone move per turn? Does difficult terrain in a zone prevent moving OUT of it, or INTO it? Can you move two zones if you Dash?

3. **AoE targeting:** A Fireball hits "a zone" — does the caster choose which zone? Can it hit part of a zone? Or do we keep it simple: one zone = one AoE target?

4. **Token density:** What if 8 enemies are all in the Frontline? How do we render that on a phone screen without scrolling? Stacked chips? Count badges?

5. **Zone map layout:** The spec shows a vertical layout. Would a horizontal layout (landscape-style) work better on a phone in portrait? Or a radial/circular layout?

6. **Combat-to-Chronicle transition:** When combat ends, should zone effects persist as location history? Should the combat outcome generate a consequence automatically?

7. **NPC in combat:** Currently NPCs (`state.npcs[]`) are separate from combatants (`state.combat.list[]`). Should an NPC who joins combat get a link between the two?

8. **Retreat/flee mechanic:** If a combatant moves to the Rear zone and then "leaves," do they exit combat? Does this map to the location travel system?

9. **Wagon defense scenario:** The wagon is in the Rear. Enemies reach the Rear. How does wagon HP interact with zones? Should the wagon be a "structure" in the zone with its own HP/AC?

10. **AI reliability:** The AI already struggles to emit correct mechanic lines consistently. Adding zone mechanics means more lines per response. How do we make the zone format foolproof for the AI? Should we use a more structured format (e.g., JSON block) instead of key:value lines?

---

## 8. PROMPT FOR GEMINI

You are a game designer and web developer helping design **Drop 4: Zone Combat Map** for Tinkle's Tinctures, a mobile-first AI D&D 5e virtual tabletop.

**Read the full report above.** You understand the existing codebase architecture, the current combat system being replaced, the Location Journal's node map pattern, the Chronicle View long-range vision, and the technical constraints.

**Your task:** Brainstorm and propose a complete Drop 4 implementation plan covering:

1. **Zone map UI design** — A mobile-portrait-optimized layout for 6 combat zones with token chips. Consider: how does it fit on a 390px-wide screen? How do you handle 10+ tokens? What does the visual hierarchy look like? Provide ASCII mockups or describe the layout in detail.

2. **State model** — Finalize the `state.combat` structure. Address: zone metadata, token-zone assignments, zone effects, terrain, and how it migrates from the current flat model (SAVE_VERSION bump).

3. **AI mechanic format** — Design the exact `key: value` syntax for zone mechanics. Consider: what's the minimum the AI needs to emit? What can be inferred? How do we make it hard for the AI to get wrong? Include examples of a full combat turn's mechanic block.

4. **Zone rules** — Propose adjacency, movement, melee/ranged/AoE rules that are simple enough for an AI to follow consistently but tactical enough to matter. Reference how Slasher (melee), Tinkle (ranged/stealth), and Pebble (caster) would each use zones differently.

5. **Chronicle View integration** — How does the zone map relate to the Chronicle View? When combat starts, how does the UI transition? When combat ends, what persists? How do the two spatial layers (micro=zones, macro=locations) share UI patterns?

6. **Implementation sequence** — Break the work into ordered steps a developer can follow. What ships first? What depends on what? What can be tested independently?

7. **Risk assessment** — What could go wrong? What's the hardest part? Where might the AI struggle? What's the fallback if zones are too complex for the AI to manage?

Be opinionated. Make specific recommendations. Don't hedge with "you could do X or Y" — pick one and explain why. Reference the existing code patterns (node map SVG, init-row CSS, parseMechanics pipeline) when proposing how to build new features on top of them. Remember: this runs on a phone, mid-session, with one hand. Every pixel matters.

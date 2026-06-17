# DROP 4 — Zone Combat Map & Chronicle View
## Player Brief — We Need Your Feedback
*Tinkle's Tinctures v2.0 · June 2026*

---

## What's Changing (The Big Picture)

We're replacing the current Combat tab and consolidating the cluttered World/Wagon/Combat panels into two clean views:

- **Chronicle** — everything about the WORLD (where we are, who's here, what's happening, combat map)
- **Cargo** — everything about OUR STUFF (wagon, inventory, Pebble's hoard, Grit)

The AI DM chat stays accessible at all times — you're never more than one tap away from the narrative.

---

## The Chronicle View (Your New Home Screen)

Instead of flipping between 6 different panels to see campaign info, Chronicle puts it all on one screen:

```
┌─────────────────────────────────────┐
│ Greenest · Day 3 · 2:00 PM          │  <- Where & when
│ Clear · Light Breeze                 │  <- Weather & light
├─────────────────────────────────────┤
│ o────o────o────●                     │  <- Travel path
│ Mill  Thorn Camp Greenest            │  (tap a dot to switch)
├─────────────────────────────────────┤
│                                      │
│  Governor Nighthill      [Friendly]  │  <- NPCs at this location
│  Mondath               [Hostile]     │
│                                      │
│  Quest: Defend the Mill         [!]  │  <- Active quests here
│  Quest: Investigate the Cult    [?]  │
│                                      │
│  Warning: Town gates breached        │  <- World consequences
│  Reputation: Respected               │  <- Town rep
│                                      │
│  Day 2: Arrived at dusk             │  <- Location history
│  Day 3: Cultist ambush repelled     │
│                                      │
└─────────────────────────────────────┘
```

Everything about the current location — NPCs, quests, reputation, consequences, history — in one scrollable view. Tap a different node on the travel path to see that location's info instead.

---

## The Zone Combat Map

When combat starts, the Chronicle's location detail transforms into a tactical map. When combat ends, it transforms back and a summary line gets added to the location's history automatically.

### The 6 Zones

Instead of a grid with squares and rulers, combat uses **6 abstract zones**. Where you stand determines who you can hit, who can hit you, and what advantages you get.

```
              [AIR SPACE]
            (only appears when
           flying creatures exist)
                  |
  [LEFT FLANK]--[FRONTLINE]--[RIGHT FLANK]
                  |
              [BACKLINE]
                  |
             [REAR GUARD]
```

Each zone is a box on your phone screen. Character tokens (colored chips with your name, HP, and conditions) sit inside the zones.

### What the Combat Screen Looks Like

```
┌─────────────────────────────────────┐
│ Greenest · COMBAT · Round 2          │
│ Slasher's Turn                       │
├─────────────────────────────────────┤
│          [AIR SPACE]                 │
│          Wyvern 32/45 HP             │
├──────────────────┬──────────────────┤
│   LEFT FLANK     │   RIGHT FLANK    │
│   Tinkle 18/18   │   (empty)        │
│   Prone          │                  │
├──────────────────┴──────────────────┤
│            FRONTLINE                 │
│   Slasher 39/39    Cultist x3       │
│   Bugbear 28/28                     │
├─────────────────────────────────────┤
│             BACKLINE                 │
│   Pebble 20/20   Concentrating      │
├─────────────────────────────────────┤
│            REAR GUARD                │
│   Grit 15/15   Wagon                │
└─────────────────────────────────────┘
```

### Zone Rules

**Movement:**
- On your turn, you can move to any **directly connected** zone (see the lines in the diagram above)
- Frontline connects to: Left Flank, Right Flank, Backline, Air Space
- Left Flank connects to: Frontline only
- Right Flank connects to: Frontline only
- Backline connects to: Frontline, Rear Guard
- Rear Guard connects to: Backline only
- Air Space connects to: Frontline only (flying creatures swoop down)
- Moving to a non-adjacent zone takes 2 moves (e.g., Rear Guard to Frontline = 2 turns, or Dash)

**Melee attacks:** You can only melee someone in YOUR zone or a directly connected zone.

**Ranged attacks:** You can target anyone you can see, but some zones provide cover (see below).

**Opportunity attacks:** If you leave a zone that has enemies in it, they get an opportunity attack — just like moving away in normal D&D.

### Zone Properties

Zones can have special effects applied by the AI or by spells:

| Property | Example | Effect |
|----------|---------|--------|
| **Difficult Terrain** | Debris, mud, ice | Costs extra movement to enter |
| **Cover (Half)** | Rear Guard, barricades | +2 AC against ranged attacks |
| **Cover (3/4)** | Behind walls, arrow slits | +5 AC against ranged attacks |
| **Obscured** | Fog Cloud, Darkness | Attacks have disadvantage, can't target specifically |
| **Hazard** | Fire, acid, spikes | Damage on entry or start of turn |
| **Elevated** | High ground, rooftops | Advantage on ranged attacks downward |

The AI applies these based on the narrative. If a wizard drops Fog Cloud on the Backline, you'll see a badge on that zone: "Backline — Obscured (Fog Cloud)."

### Token Info (What You See on Each Chip)

Each character/enemy chip on the map shows:
- **Name** and **color** (your character color from the sheet)
- **Current HP / Max HP** with a health bar
- **Active conditions** as small badges (Prone, Poisoned, Concentrating, etc.)
- **Gold ring** around whoever's turn it is
- **Death save pips** if a PC hits 0 HP (three dots — fills red for failures, green for successes)

Tap a token to see full details and quick HP +/- buttons.

### How Movement Works

**Default: AI-driven.** You type your action in the chat — "I run around the side to ambush them" — and the AI moves your token to the appropriate zone. The AI also handles enemy movement.

**Manual override:** A toggle button switches to manual mode. In manual mode, tap your token, then tap the zone you want to move to. This is for:
- Fixing AI mistakes mid-combat
- Repositioning Grit or the Wagon
- Pre-positioning before you send your chat message

You can switch between AI and manual mode anytime during combat.

### Starting Positions

When combat begins, the AI assigns starting zones based on the narrative. Typical defaults:
- **Frontline**: Slasher (melee fighters engage first)
- **Backline**: Pebble (ranged/caster), Tinkle (unless ambushing)
- **Rear Guard**: Grit and the Wagon (always protected)
- **Flanks**: Used for ambushes, flanking maneuvers, or when enemies try to surround you
- **Air Space**: Only appears when something is flying

The AI can override these based on the story. If you're ambushed from behind, enemies might start in YOUR Rear Guard.

---

## Fog of War (Zone-Level)

Unlike grid VTTs where individual squares are hidden, our fog of war works at the zone level:
- **Hidden zones** are dimmed/locked — you know the zone exists but not what's in it
- The AI reveals zone contents when your characters can see into them
- Example: "You hear fighting from the Left Flank but can't see who's there" — Left Flank zone shows "???" until someone moves to Frontline and looks

This keeps the "fog" simple while still allowing the AI to hold back information dramatically.

---

## What Stays the Same

- **The core loop doesn't change**: you type an action, the AI responds, mechanics parse, state updates
- **Character sheets** stay exactly as they are
- **Quick Actions** still work — the FAB button stays accessible
- **Dice roller** stays the same
- **Session Archive** and all logging stays the same
- **The AI contracts** still enforce all the rules

---

## Questions We Need Your Input On

### 1. Zone Adjacency — Does This Map Feel Right?

```
              [AIR]
                |
  [L. FLANK]--[FRONT]--[R. FLANK]
                |
             [BACK]
                |
             [REAR]
```

- Flanks only connect to Frontline (not each other, not Backline)
- Rear Guard is the safest spot — enemies have to punch through Backline to reach it
- Does this create interesting tactical choices for your characters?
- As a Fighter, Slasher will mostly live in Frontline. Does that feel too simple, or is that exactly where you want to be — holding the line while Tinkle flanks and Pebble supports from behind?

### 2. Movement: Adjacent-Only or Free Movement?

**Option A — Adjacent only (recommended):** You can move one zone per turn. Getting from Rear Guard to Frontline takes 2 turns (or a Dash). This means positioning MATTERS — if you're caught in the wrong spot, it costs you.

**Option B — Free movement:** You can move to any zone in one turn. Simpler, faster, but less tactical. Positioning becomes less important because you can always reposition.

### 3. Where Should the Chat Live?

Right now, the AI DM chat is its own full tab. With the new Chronicle View taking center stage, where should chat go?

**Option A — Chat stays as its own tab.** You flip between Chronicle and Chat. Simple, familiar.

**Option B — Chat slides over Chronicle.** Swipe or tap to pull chat over the map. The map is still underneath. Good for quick messages mid-combat.

**Option C — Chat is a collapsible bar at the bottom of Chronicle.** Always visible (you can see the last message), tap to expand it full-screen. Never have to leave the map to see what the AI said.

### 4. Grit and the Wagon

- Should Grit and the Wagon always be locked to Rear Guard, or should you be able to move them?
- Can enemies attack the Wagon directly? (This would add tension — protect the wagon or chase the enemy?)
- If the Wagon takes damage in a fight, should that show on the combat map?

### 5. What's Missing?

Think about your actual play sessions. What information do you wish you had at a glance during combat? What's frustrating about the current system? What would make you actually USE the initiative tracker?

---

## Timeline

This is the biggest feature drop yet. Build order:
1. Combat zone grid (the visual layout)
2. Token chips with HP and conditions
3. Turn indicator and round counter
4. AI mechanics for zone movement
5. Manual movement toggle
6. Chronicle View wrapper (location detail + combat swap)
7. NPC/quest/reputation anchoring to locations
8. Fog of war
9. Playtesting and polish

We're not building everything at once. The combat map comes first because that's where the pain is. Chronicle View wraps around it afterward.

---

*This is a living document. Your feedback shapes what gets built. Tell us what excites you, what confuses you, and what you think is missing.*

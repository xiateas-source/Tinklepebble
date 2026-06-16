# TINKLE'S TINCTURES — PRIME DIRECTIVE
## Mobile AI Virtual Tabletop — Development Mandate
*Revised 2026-06-16 — v1.8.0*

---

## WHO WE ARE

Two developers/players building a complete, phone-native D&D 5e virtual tabletop that runs in a single HTML file, requires no installation, no subscription, and replaces a human DM with an AI that is contractually bound to run the game correctly.

One player (Tinkle). One player (Pebble/Pitchman). One AI DM. One shared Firebase state. Real dice, real consequences, real rules enforcement.

This is not just a D&D companion app. It is a universal AI tabletop that can run any TTRPG from digital books you already own — no new purchases, no human DM required.

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

## CURRENT STATE — CONFIRMED WORKING (v1.8.0, 2026-06-16)

**Core:**
- Firebase real-time sync with clock-independent chat merge ✓
- Core play loop: player types → AI responds → mechanics parse → state syncs ✓
- Vite build (src/main.js + src/style.css → docs/) — deployed via GitHub Pages ✓
- Mechanics block parser — 36+ handlers ✓
- AI contracts in `state.aiContracts{}`, Firebase-synced, Slasher security validated every send ✓
- Verify AI — validates contracts + injects them into next AI send for drift correction ✓

**UI:**
- 4-tab bottom nav — AI DM / Sheet / Logistics / Systems; composite drawers with subnav ✓
- Customizable ☰ header shortcuts — 16 available, tap ✎ to edit ✓
- Full-screen chat layout — body flex column, tab-dm fills viewport ✓
- 6-tab character sheet — Core/Skills/Combat/Spells/Gear/Features; lock/unlock ✓
- HUD mosaic — PC tiles, Grit tile, Familiar tile ✓
- Quick Actions — bottom-sheet, 2-col card grid, morphing FAB ✓
- Dice roller — character select, roll type, modifier, d4–d% grid ✓
- Skill proficiency inference + Expertise detection ✓

**World/Session:**
- Location Journal v1 — Node Map SVG, detail bottom sheet, AI mechanics, 🌱 Seed from campaign data ✓
- World Consequence Engine — consequences[], AI mechanics, injected into buildPrompt() ✓
- Session Archive — 50-cap append-based, collapsible entries newest-first ✓
- Rolling AI summary (summarizeAndPrune at 75 messages) ✓
- `roll_request:` mechanic + persistent banner ✓
- Flag system — 7 categories, 4-state verdict, uiCtx auto-build ✓
- "Previously On…" QA action ✓
- NPC attribution-verb scanner (detectUnloggedNPC) ✓

---

## VTT DROPS

- **Drop 4** — Zone combat map. 6 spatial zones. Replaces Combat tab entirely. Do NOT refactor Combat tab before this.
- **Drop 5** — Image maps + token overlay. Two-tap grid calibration, single-layer fog, spell effect overlays. Firebase Storage for images.
- **Drop 6** — Player View. Firebase `/session/playerView`. Requires state visibility split.
- **Drop 7** — Full VTT layer: freehand drawing, auto grid detection, fog room reveals, handout cards.

---

## THE CHARACTERS (Canon)

**Slasher** — Black Dragonborn Fighter L3 (Battle Master). STR 17, CON 16, AC 16 (Chain Mail), HP 39. Great Weapon Fighting. Second Wind. Greatsword. Genuinely believes the operation is a legitimate apothecary. The AI must never reveal the con to him.

**Tinkle** — Tortle Rogue L3 (Arcane Trickster). AC 17 (Natural Armor). Blowgun + Torpor Poison (DC 15). Expertise: Deception/Investigation. Shell Defense. Mastermind.

**Pebble** — Goliath Bard L3 (College of Lore). CHA 17. Stone's Endurance (2/SR). Lucky Points (3/LR). Spell slots 2. Sleep, Hideous Laughter, Charm Person, Healing Word. Pitchman.

**Grit** — The ox. HP 15. Bonded to Tinkle. Raised from a calf. Stoic. Skittish around loud magic.

**The Wagon** — "The Shelled Alchemist." Traveling apothecary facade. Snake oil, real stock, reagents. Con operation.

---

## THE AI CONTRACT PHILOSOPHY

The AI contracts are not suggestions. They exist because:
- The AI forgot to ask for rolls and gave players what they wanted
- The AI skipped concentration saves after damage
- The AI let Pebble cast, use Bardic Inspiration, AND help Slasher in one turn
- The AI resolved hidden enemies without perception checks
- The AI said "you" as a catch-all for two distinct characters
- The AI narrated gold/NPC/item events without emitting mechanic lines
- The AI duplicated NPCs instead of updating existing records
- The AI revealed dungeon secrets before players discovered them (→ DUNGEON SECRETS clause)
- The AI progressed scenes without asking players first (→ PLAYER AGENCY clause)
- The AI skipped skill checks (→ SKILL CHECKS clause)

Every contract addition is a rule the AI violated in actual play. The contracts are a growing record of the AI's failure modes, patched one session at a time.

---

## THE GOAL

A session terminal so complete that opening a browser is all that's needed. The wagon is loaded. Grit is hitched. The contracts are signed. The Chronicle View puts the party in their world. Drop 4 puts them on the map.

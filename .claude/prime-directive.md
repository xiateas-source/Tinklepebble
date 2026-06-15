# TINKLE'S TINCTURES — PRIME DIRECTIVE (REVISED)
## Mobile AI Virtual Tabletop — Development Mandate
*Revised 2026-06-15 — v1.6.1*

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

## CURRENT STATE — CONFIRMED WORKING (v1.6.1)

- Firebase real-time sync — both phones live ✓
- Core play loop: player types → AI responds → mechanics parse → state syncs ✓
- Vite build (src/main.js + src/style.css → docs/) — deployed via GitHub Pages ✓
- Mechanics block parser — 35+ handlers, flexible, catches variants ✓
- Canonical character sheets — Slasher L3, Tinkle L3, Pebble L3 (SAVE_VERSION 11) ✓
- AI contracts — rolls, concentration, death saves, action economy enforced ✓
- HUD mosaic — PC tiles (HP/AC/conditions), Grit tile, Familiar (Pip) tile ✓
- Quick Actions — bottom-sheet redesign, 2-col card grid, morphing FAB, custom icon ✓
- Dice roller — character select, roll type, modifier, ±delta row, d4–d% grid ✓
- Flag system — floating ⚑ FAB, z-index fixed, panel auto-injection, iOS zoom fixed ✓
- spell_add mechanic — auto-populates spellbook from AI response ✓
- Town Rep in Wagon tab ✓
- Session tab — During/Between/Module sub-tabs ✓
- Story Chronicle — chapter system, 📖 read mode ✓
- Module tracker — Hoard of the Dragon Queen, 8 episodes ✓
- OOC + Party chat — live ledger injected on every send ✓
- Level-up wizard — Fighter/Rogue/Bard L2–L5 ✓
- Quest + NPC dedup ✓
- NPC list — sort active/departed/deceased, disposition color ✓
- Quest list — sort active/failed/done, active count header ✓
- Setup Wizard with campaignLaunched lock ✓
- Scroll controls across all chat surfaces ✓
- Rolling AI summary (summarizeAndPrune at 75 messages) ✓
- AbortController + 25s timeout + free-model fallback in callAI() ✓

---

## OPEN ISSUES (Active)

1. AI compliance gap — AI narrates gold/NPC/item events but doesn't always emit mechanic lines. detectUnloggedGold() chip exists; NPC and item equivalents needed.
2. Contracts in DOM — AI contracts are DOM textareas, not in state. Can't Firebase-sync. DR-6 fixes this.
3. Income/Expense log silent — consequence of #1
4. NPC log silent — consequence of #1

**UI/UX:**
- AI contracts still in DOM textareas — can't Firebase-sync, fragile to refactors (DR-6 fixes this)
- PDF/epub ingestion — not yet built; needed for book-driven play
- Map system — not yet built; needed for spatial combat and exploration (Drop 4+)

---

## ROAD TO DROP 4

**Phase 2 — Road to Drop 4:**
1. Polish pass — QA menu card sizing, flag panel coverage, HUD tile tap targets
2. AI compliance chips — detectUnloggedNPC() + detectUnloggedItem() (mirror detectUnloggedGold pattern)
3. DR-6: Contracts → state.aiContracts{} with Firebase sync
4. Visual Redesign v2 — 4-tab bottom nav (Adventure / Logistics / Sheet / Systems)
5. Drop 4: Zone combat map (Option A — abstract zones first, image maps in Drop 5)

**PDF/epub Book Ingestion (parallel track):**
- Browser FileReader API + PDF.js (client-side text extraction)
- epub.js for epub parsing
- Auto-chunk by chapter/heading; user tags chunks as rules/lore/module_scene/npc_roster/map
- Stored in state.bookChunks[] synced via Firebase
- Inject via _ctxInject on demand or auto-inject on scene entry
- Map images extractable from PDF chunks → feeds directly into Drop 5 image maps

---

## VTT DROPS

- **Drop 4** — Zone combat map. 6 spatial zones (Frontline/Backline/Left/Right/Air/Rear). Replaces Combat tab entirely. Do NOT refactor Combat tab before this.
- **Drop 5** — Shared dice feed. Firebase-wired. Header 🎲 becomes the entry point.
- **Drop 6** — Player View. Firebase `/session/playerView`. Requires state visibility split (already designed).
- **Drop 7** — Handout/image cards. Additive to Drop 6.

---

## PARALLEL BUILD — FULL VTT (New Project)

A separate multi-file app is being built in parallel using the Prime Directive as its founding document. Built on Vite from day one, proper component structure. Targets the same Firebase project so all canon game data (characters, quests, session history) carries over when ready.

Tinkle's Tinctures remains the active session tool until the new app reaches feature parity.

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
- OOC and Party channels had no contract — AI answered stale/multi-topic questions and had no secret protection

Every contract addition is a rule the AI violated in actual play. The contracts are a growing record of the AI's failure modes, patched one session at a time.

---

## THE GOAL

A session terminal so complete that opening a browser is all that's needed. The wagon is loaded. Grit is hitched. The contracts are signed. Drop 4 puts the party on the map.

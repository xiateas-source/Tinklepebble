# TINKLE'S TINCTURES — PRIME DIRECTIVE (REVISED)
## Mobile AI Virtual Tabletop — Development Mandate
*Revised 2026-06-14 — v1.6*

---

## WHO WE ARE

Two developers/players building something that doesn't exist yet: a complete, phone-native D&D 5e virtual tabletop that runs in a single HTML file, requires no installation, no subscription, and replaces a human DM with an AI that is contractually bound to run the game correctly.

One player (Tinkle/Mastermind). One player (Pebble/Pitchman). One AI DM. One shared Firebase state. Real dice, real consequences, real rules enforcement.

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

## CURRENT STATE — CONFIRMED WORKING (v1.6)

- Firebase real-time sync — both phones live ✓
- Mechanics block parser — flexible, catches all variants ✓
- Canonical character sheets — Slasher, Tinkle, Pebble correct after Firebase sync ✓
- AI contracts — rolls, concentration, death saves, action economy enforced ✓
- Session tab — During Session / Between Sessions / Module ✓
- New Campaign / Full Reset — clean slate with starting gold ✓
- Dice picker — d4–d100 with modifier field ✓
- Campaign Setup tab — four-step PHB-inspired onboarding ✓
- World tab — World State | Operations sub-tabs ✓
- Module tracker — Hoard of the Dragon Queen, 8 episodes, AI updates via module_episode: ✓
- OOC + Party chat — live ledger injected on every send (no more context drift) ✓
- Context Refresh — queues scene snapshot silently for next AI DM message ✓
- Re-sync AI State — injects full ledger + visible confirmation in main chat ✓
- Quest dedup — quest_add skips near-identical quests ✓
- NPC dedup — npc_add updates existing instead of duplicating ✓
- primary_mission: mechanic — AI can set/update main quest ✓
- quest_fail: mechanic ✓
- Income/NPC/Quest contracts — strict no-exceptions enforcement ✓
- Story Thread — 📖 Read mode with collapsible TOC + chapter sections ✓
- Per-message ✕ delete in Narrative chat ✓
- Scroll controls — ↑ Top / ↓ Bottom standardized across all chat surfaces ✓
- Quest hidden:false default — Drop 6 prereq in place ✓
- Flag system — dev flags auto-resolve when captured in roadmap ✓

---

## OPEN ISSUES (Active)

**Gameplay loop:**
- Income/Expense Log silent — AI narrates transactions but doesn't call log functions
- NPC log silent — AI introduces NPCs but doesn't persist them via state functions
- Tab navigation blindness — state changes don't surface visually to the DM

**UI/UX:**
- Travel Log full rework — needs visual map layer, day-progress bar (large feature, Drop 4+)
- Party chat → narrative ping — player OOC messages should notify the AI DM
- Message lock — reading a message while new prompt arrives should keep it open

---

## ROAD TO DROP 4

**Phase 1 — Pre-Drop 4 (one remaining item):**
- Vite migration — split single HTML file into component structure before Drop 4 adds complexity

**Recommended before Vite:**
Fix income/NPC log silent issues (#6/#7) so the codebase is stable and correct before splitting it.

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

**Slasher** — Black Dragonborn Fighter L1. STR 17, CON 16, AC 16 (Chain Mail), HP 13. Great Weapon Fighting. Second Wind. Smith's Tools. Greatsword. Genuinely believes the operation is a legitimate apothecary. The AI must never reveal the con to him.

**Tinkle** — Tortle Rogue L1. AC 17 (Natural Armor). Blowgun + Torpor Poison (DC 15). Expertise: Deception/Investigation. Shell Defense. Mastermind.

**Pebble** — Goliath Bard L1. CHA 17. Stone's Endurance (2/SR). Lucky Points (3/LR). Spell slots 2. Sleep, Hideous Laughter, Charm Person, Healing Word. Pitchman.

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

A session terminal so complete that opening a browser is all that's needed. The wagon is loaded. Grit is hitched. The contracts are signed. The first canon session is the next thing on the list.

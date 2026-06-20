# TINKLEPEBBLE V2 — PRIME DIRECTIVE
## Mobile AI Virtual Tabletop — Development Mandate
*Established 2026-06-20*

---

## WHO WE ARE

Two players (expandable) building a phone-native AI virtual tabletop. No human DM. No books on the table. No subscription. Open a browser and play.

V1 was 29 sessions of discovery — 50+ features, 25 sessions of gameplay, every AI failure mode documented and patched. V2 is the intentional rebuild: same vision, better engineering. Every feature earned its place in v1 before it gets rebuilt in v2.

---

## THE PRIME DIRECTIVE

**Two players sit down with their phones, open a browser, and run a full tabletop RPG session without any other tools, books, or setup.**

The AI runs the game. The app constrains the AI.

---

## THE FOUR LAWS

**1. The core loop is sacred.**
Player acts → AI narrates → mechanics parse → state updates → devices sync. Nothing ships that breaks this chain.

**2. The container is the contract.**
V1 taught us what the AI gets wrong. V2 encodes those lessons as architecture — validation layers, structured output, state guards — so the AI *can't* break rules, not just *shouldn't*. Every contract clause should have a corresponding code constraint. If it can be enforced in code, it must be.

**3. Mobile first, always.**
Portrait mode, one-handed, mid-session. If it doesn't work on a phone screen, it doesn't ship.

**4. One experience, not many features.**
The app has two modes: **play** and **manage**. Play is the session — chat, combat, dice, state changes surfacing where the player already is. Manage is between sessions — character building, content import, contract tuning, session review. Every feature belongs to one mode. V1 proved that connecting features to the play loop works (tappable mechanic pills, quest bar, contextual links) — V2 bakes that connectivity into the architecture from day one. If a play feature takes effort to reach, it needs a bridge or it needs to be closer. If a management feature clutters the play screen, it needs to move.

---

## CONTENT IS PORTABLE

The system ingests any game content — uploaded files (PDF, epub, mobi), web references, homebrew, or AI-generated imports. Compendiums, spell lists, class data, and adventure modules are populated by the user's content, not hardcoded. D&D 5e is the primary system, not the only one.

### Four input paths:
1. **Files you own** — PDF, epub, mobi → parse → structured data → game engine
2. **Web reference** — import from open reference sites into local compendium
3. **Homebrew** — author directly in-app or in markdown
4. **AI-generated** — design on any LLM, export structured JSON, import into app

---

## V1 LESSONS — WHAT WE KNOW

### What held up
- The core loop (type → respond → parse → update → sync)
- AI contracts as enforcement, not documentation — every rule earned through failure
- Mobile-first as a hard constraint
- Tappable mechanic pills, quest tracker bar, contextual links — connecting features to the play loop works

### What broke
- 6,000+ lines in one file — monolith couldn't scale
- Features existed in isolation until bridges were retrofitted
- Play and management UI mixed together — everything always visible, nothing with clear purpose
- Hardcoded compendiums (SPELL_DB, FEATS_DB) — didn't scale, couldn't ingest user content
- PDF parsing was fragile — web content import didn't exist
- 5 dense contract textareas because the architecture couldn't enforce rules the contracts described

### The AI failure record
Every contract clause exists because the AI broke a rule in actual play:
- Adjusted HP without mechanics — now needs code-level enforcement
- Skipped concentration saves — needs automatic validation
- Resolved actions without rolls — needs structural roll gating
- Fabricated content — needs source verification against imported canon
- Addressed players generically — needs per-character awareness baked into prompt construction
- Narrated state changes without emitting mechanics — needs response structure validation

---

## THE GOAL

A session terminal so complete that opening a browser is all that's needed. The architecture constrains the AI. The content pipeline feeds it. The UI guides players through the session without asking them to manage the game. Play feels like play. Management feels intentional, not like homework.

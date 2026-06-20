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

## THE FIVE LAWS

**1. The core loop is sacred.**
Player acts → AI narrates → mechanics parse → validate → state updates → devices sync. Play never stops — if sync fails, the session continues locally and reconciles when connection returns.

**2. The container is the contract.**
V2 encodes AI failure modes as architecture — validation layers, structured output, state guards — so the AI *can't* break rules, not just *shouldn't*. If it can be enforced in code, it must be. What code can't enforce, contracts handle — but the contract list should shrink, not grow. If a contract keeps getting violated, that's a signal to find a code constraint. Prevent first, recover second — when enforcement fails, the player can rewind.

**3. Mobile only.**
Portrait mode, one-handed, mid-session. No desktop fallback.

**4. One experience, not many features.**
Four modes: **setup**, **play**, **reference**, and **manage**. Setup is the onramp — Session Zero, character creation, content import, campaign launch. Done once, mostly locked after. Play is the session — chat, combat, dice, state surfacing where you already are. Reference is mid-session orientation — "where are we, who's here, what do I know, what can I cast" — fast, read-only, one tap away. Manage is between sessions — contract tuning, session review, data fixes. Every feature belongs to one. Features appear when they have content, not before. If the AI mentions a location, the journal updates *and the player sees it happen*. If a quest is given, it surfaces in the chat, not buried in a tab. Players should never need to know where to look — the app guides them to the right tool at the right moment. Features that exist but aren't discovered are dead weight. Surface changes where the player is — don't notify *about* changes somewhere else. Mode transitions should have appropriate friction — reference is a glance, manage is intentional.

**5. Zero cost to play.**
Free APIs, free hosting, free sync — no paid tiers, no exceptions. Never depend on a single provider. The system prompt is a budget — game state grows every session, the architecture must keep the prompt lean as the world expands. Three tiers of data:
- **Firebase** — game state that changes during play: HP, quests, inventory, chat, combat positions
- **Local (IndexedDB)** — reference content that doesn't change during play: spell compendiums, class data, feat databases, imported module text, parsed books
- **Shared bundles** — one player imports content, app generates a shareable pack, other player imports it. Firebase carries "player 2 has content pack X," not the content itself

The AI narrates and runs the game, nothing else. If the app can do it without an API call, it must. Free paths first, AI when you're already talking.

---

## CONTENT IS PORTABLE

The system ingests any game content — uploaded files (PDF, epub, mobi), web references, homebrew, or AI-generated imports. Compendiums, spell lists, class data, and adventure modules are populated by the user's content, not hardcoded. D&D 5e is the primary system, not the only one.

### Four input paths:
1. **Files you own** — PDF, epub, mobi → parse → structured data → game engine
2. **Web reference** — import from open reference sites into local compendium
3. **Homebrew** — author directly in-app or in markdown
4. **AI-generated** — design on any LLM, export structured JSON, import into app

---

## BUILT WITH INTENTION

V1 was 29 sessions of discovery. V2 is the intentional rebuild — modular, tested, optimized. The architecture supports portability: any game content in, structured data out. Every feature earned its place in v1 before it gets rebuilt in v2.

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

## OPEN QUESTIONS

- **OOC & Rules channels** — V1 had three chat modes: Narrative (AI, in-character), Rules (AI, mechanical questions), and OOC (player-to-player, no AI). The function of each isn't clearly defined in the four-mode framework. Rules is reference via AI, which conflicts with Law 5 (free paths first). Needs design work: what's static reference vs AI interpretation? Does Rules share narrative context or build its own prompt? Come back to this.

---

## THE GOAL

A session terminal so complete that opening a browser is all that's needed. The architecture constrains the AI. The content pipeline feeds it. The UI guides players through the session without asking them to manage the game. Play feels like play. Management feels intentional, not like homework.

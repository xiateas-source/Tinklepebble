# Project Context Briefing: *Tinkle's Tinctures* VTT

**Prepared for external AI review · June 2026**
**Codebase: single file `index.html` · 7,297 lines · vanilla HTML/CSS/JS**

---

## 1. Core Vision

*Tinkle's Tinctures* is a **single-player/small-group D&D 5e virtual tabletop assistant** built around a specific campaign premise: a party of three characters runs a travelling medicine wagon that sells both genuine tonics and outright snake oil to unsuspecting townsfolk. The AI serves as a fully contracted Dungeon Master — receiving player actions and returning narrated outcomes, mechanical state updates, and dice rulings in a single response. The main loop is: **player types an action → AI narrates + emits a structured mechanics block → app parses the mechanics block and updates all game state automatically** (HP, gold, conditions, quest log, NPC tracker, cargo weight, travel log, story chronicle). The experience is meant to feel like a richly narrated TTRPG session with zero manual bookkeeping.

---

## 2. Tech Stack & Architecture

### Runtime Environment
- **Pure vanilla HTML/CSS/JS** — no build system, no npm, no bundler. One file, deployed via GitHub Pages from the `main` branch.
- **No TypeScript, no framework** (not React, Vue, Svelte, etc.)

### External Libraries (CDN, loaded in `<head>`)
| Library | Version | Purpose |
|---|---|---|
| `firebase-app-compat.js` | 10.12.0 | Firebase init |
| `firebase-database-compat.js` | 10.12.0 | Realtime Database sync |
| Google Fonts | — | Cinzel (display), IM Fell English (serif), Share Tech Mono (mono), Inter (UI) |

### External APIs (called at runtime via `fetch`)
| API | Where Used |
|---|---|
| **Google AI Studio** (`generativelanguage.googleapis.com/v1beta`) | Primary AI provider — Gemini 2.5 Flash Lite default |
| **OpenRouter** (`openrouter.ai/api/v1/chat/completions`) | Secondary AI provider — any model the user selects |
| **ElevenLabs** (`api.elevenlabs.io/v1/text-to-speech`) | Premium TTS voice narration |
| **Firebase Realtime Database** (user-supplied config) | Multi-device state sync |

### Browser APIs Used
- `speechSynthesis` / `SpeechSynthesisUtterance` — browser TTS fallback
- `localStorage` — primary state persistence + device-local settings
- `Notification` API — cross-device party chat push alerts
- `AudioContext` / `Audio` — ElevenLabs audio playback

### Application Structure
The file is structured as one long top-to-bottom scroll:
1. `<head>` — CDN scripts + Google Fonts links
2. `<style>` block (~970 lines) — **3 stacked `:root` palette blocks** + all CSS classes
3. `<body>` — all HTML markup for 9 tabs + all modals + floating UI elements
4. One massive `<script>` block (~5,200 lines) — all JS: constants, state, render functions, Firebase, AI call, parseMechanics, quick actions, TTS, theme, dev tools

### State Persistence
- **`localStorage('tt_v1')`** — primary save; full serialized `state` object on every change
- **Firebase Realtime Database** — bidirectional sync of 29 defined `STATE_KEYS`; optional (user pastes their own config)
- **`localStorage('tt_cache')`** — last 5 AI responses cached for offline fallback
- **`localStorage('tt_*')`** — device-local only: API keys, provider selection, model, TTS settings, player name/character, theme mode

### Current Save Version
`SAVE_VERSION = 8`. A `migrate(s)` function runs on every load and unconditionally patches the state object to add missing fields. No per-version gating — all patches apply based on field-existence checks.

---

## 3. Feature Inventory

### Core Systems (Fully Functional)

**AI DM Engine**
- `callAI()` — single `fetch` call, two providers (Google / OpenRouter), no retry logic, no abort controller
- `buildPrompt(ledger)` — assembles a system prompt from 5 live contract textareas + active snippets + the compiled ledger + a mechanics block spec
- `parseMechanics(responseText)` — 230-line if/else chain that parses AI output for ~35 mechanic keys and applies all state changes in one pass
- `genLedger()` — 3 output modes (Compact ~600 tok / Full ~2,500 tok / Combat ~800 tok); result is displayed in the AI Tools tab and injected into every prompt
- `detectUnloggedGold()` — prose scanner that catches when the AI says "you earn X gold" without emitting a matching `income:` mechanic; surfaces a one-tap confirm chip
- `_ctxInject` — module-level string injected silently into the *next* `sendMsg()` system prompt only (used for context refresh / re-sync without user-visible messages)
- **Offline fallback** — if the AI call fails and the device is offline, shows the last cached response with an `📴 Offline` banner

**State Model** — one large `state` object with these top-level keys:
`pcs`, `worldData`, `npcs`, `quests`, `treasuryData`, `partyInventory`, `wagon`, `combat`, `encounterPresets`, `scenes`, `snippets`, `dmSecrets`, `chatHistory`, `oocHistory`, `partyChat`, `logs`, `logSummary`, `storyThread`, `storyChapters`, `sessionNotes`, `errorLog`, `plugins`, `relationships`, `moduleProgress`, `quickActions`, `chkHistory`, `rewindStack` + misc tracking fields

**Party & Character Tracking** — HP/MaxHP, AC, conditions, spell slots, resources (pips), XP (with auto level-up alert), concentration, inventory per-PC, backstory fields (one is DM-secret)

**NPC Tracker** — add/update via `npc_add:` mechanic or manual form; dedup logic prevents re-adding known NPCs; disposition tracked

**Quest Log** — 3-state (active/done/failed), hidden flag (for Drop 6 player view), dedup on add; `quest_add:`, `quest_done:`, `quest_fail:` mechanics; `primary_mission:` for main arc

**Treasury & Income Log** — individual coin slots (pp/gp/ep/sp/cp), income/expense log with categories, session P&L strip, `detectUnloggedGold()` catch layer

**Wagon & Cargo** — ox (Grit) stats + feed status + bond notes; cargo with 5 type filters; Pebble's hoard; holding cells for captured creatures; `MAX_LB = 1080` weight cap; `quickSellItem()` one-tap sale flow

**Combat Tracker** — initiative list, round counter, condition badges per combatant; short rest / long rest triggers (long rest auto-checkpoints); encounter presets; `rollInitiativeToChat()` broadcasts to narrative

**Module Progress Tracker** — 8 episodes pre-filled for *Hoard of the Dragon Queen*; `module_episode:` mechanic advances status; progress bar; per-episode notes

**Travel Log** — visual location-transition chain rendered as a waypoint list; `travel_note:` appends to the current leg

**Story Chronicle** — structured chapter objects `{title, content, date}`; `chapter_add:` / `chapter_update:` mechanics; `✨ Chapter` button calls AI to generate narrative prose from recent session log; read mode renders collapsible TOC + chapter sections; auto-migrates legacy `storyThread` string to Prologue on first load

**OOC Channels** — two separate channels: ⚙ Systems (mechanic/rules questions, live ledger injected) and 🗨️ OOC (player out-of-character chat, live ledger injected); party badge with unread count; Web Notifications API for cross-device alerts

**Quick Actions (QA) System** — 23 named actions accessible via a floating action button + sliding menu; each action opens a bottom-sheet modal for input; context-filtered per tab; fully editable in AI Tools

**Checkpoint / Rewind Stack** — snapshot at configurable intervals + long rest + level-up + manual; last 10 snapshots in `rewindStack`; one-tap restore

**TTS (Text-to-Speech)** — dual mode: Browser Web Speech API (voice picker, speed, pitch) or ElevenLabs (API key, 9 voices, stability); auto-read toggle; 🔊 button on every AI message; `speakIdx()` / `speak()` / `speakElevenLabs()`

**Error Flag System** — `flagIt()` captures issues with categories (mechanics, ai, narrative, setting, typo, infra); verdicts (pending/pass/fail/resolved); AI audit option; JSON export

**Plugin System** — terminal-style `claude plugin install` command; one plugin shipped: `superpowers@1.0.0` (renders PC ability cards in Party tab, `sp_charge:` mechanic)

**Session Zero Generator** — AI call compiles campaign premise, party, location, and initial state into a structured onboarding doc

**Theme Toggle** — 3-way cycle: Dark (default sepia) / Light (warm beige) / Night (deep black); `body.light-mode` / `body.night-mode` class toggle; persisted in `localStorage('tt_theme_mode')`

---

### "Build-as-We-Go" Remnants & Unintegrated Features

**1. Three stacked `:root` palette blocks that never get cleaned up**
The CSS has:
- Block 1 (line 13): "Autumn Corporate Steampunk" — the original palette
- Block 2 (line 341): "v2 redesign" warm leather/ivory override
- Block 3 (line 971): Final dark sepia (current active palette)

All three persist in the file. Only the last one actually applies. The first two are dead weight that confuse anyone reading the CSS.

**2. `storyThread` and `storyChapters` are parallel structures**
The legacy `storyThread` string (free-form textarea) still exists and is still written to by the `note:` quick action. The new `storyChapters[]` array is the canonical structure. Both are in `STATE_KEYS`, both are synced to Firebase. There's no cleanup path for `storyThread` after migration.

**3. `migrate()` applies all patches unconditionally**
There are no `if(savedVer < N)` guards. Every patch runs on every load regardless of version. This is harmless today but will become a correctness hazard as the data model evolves.

**4. Setup wizard writes the same fields as the World tab**
`state.worldData.premise`, `state.worldData.setting`, `state.worldData.primaryMission` are writable from both Setup (step 0/2) and the World tab's live textareas. There is no single source of truth; the last write wins.

**5. AI contracts live in textarea DOM elements**
`buildPrompt()` reads contracts with `document.getElementById('ai-continuity')?.value`. If the DOM hasn't rendered, the contract silently returns empty string and the AI goes rogue.

**6. Offline cache is a stub, not a real offline mode**
`cacheResp()` stores the last 5 AI responses in localStorage and shows the most recent one if the network call fails. There is no service worker, no request queuing, no state sync on reconnect.

**7. Combat tab is a known dead end**
Explicitly flagged in the codebase: "DO NOT REFACTOR — Drop 4 replaces it entirely." It works but receives zero investment.

**8. `callAI()` has no retry, no timeout, no abort**
One `fetch()` call. If it hangs, the UI spins indefinitely. No exponential backoff, no model fallback, no `AbortController`.

**9. Chat archive not yet implemented**
`chatHistory` is hard-capped at 80 messages in `save()` — oldest messages are silently discarded. The planned archive flow will fix this but isn't built yet.

---

## 4. UI/UX Layout

### Navigation Model
Single-page app with a **fixed header** and **full-height tab sections**. One tab is visible at a time (`display:none` / `.active`). Tab transitions use a 160ms `tabFade` keyframe (fade + 4px translate-up).

### Header (always visible)
```
[App title]  [Party HP mini-badges]  [🎲 Roll & Submit]  [☀ Theme]  [⋮ Menu]
```
The `🎲` button opens a dice picker modal from any tab. The `☀` button cycles Dark → Light → Night. The `⋮` menu contains: Player Setup, Voice Settings, AI Provider Settings, Export/Import Save, Firebase status, Reset.

### Tab Bar (fixed)
9 tabs: **Party · World · Wagon · Combat · Session · AI Tools · AI DM · Dev · Setup**

Tabs flash with a gold pulse (`tabFlash` keyframe) when the AI changes state on that tab while it's not visible.

### Per-Tab Layout

| Tab | Layout |
|---|---|
| **Party** | Grid of PC cards (HP, conditions, resource pips) + character edit sheets + party inventory list |
| **World** | Two sub-tabs: *World State* (scene, environment, treasury, NPC list, quest log, town rep, secrets) and *Operations* (business profile, campaign secrets, relationships) |
| **Wagon** | Ox stat block + feed status + cargo capacity bar + filtered cargo grid + hoard grid + holding cells + travel log chain |
| **Combat** | Round counter + initiative list (current turn highlighted) + add-combatant form + encounter presets + condition reference |
| **Session** | Three sub-tabs: *During Session* (story thread + log entry form), *Between Sessions* (full log + AI session summary), *Module* (episode tracker + scene list + DM secrets + reference snippets) |
| **AI Tools** | Two columns: contracts (5 textareas) + ledger (compiled output + token count) + checkpoint controls + quick action editor + Firebase config |
| **AI DM** | Three chat channel tabs (Narrative / ⚙ Systems / 🗨️ OOC) + message feed + input bar + 🔊/📋 per message + typing indicator + offline banner + dice picker |
| **Dev** | Developer notes + error flag list with verdict controls + ops debrief export |
| **Setup** | 5-step wizard: Session Zero → Characters → World → Operation → Plugins |

### Modals (overlays)
Player setup, voice/TTS settings, AI provider config, dice picker, checkpoint viewer, export/import paste, JSON reset confirmation, quick-action bottom sheets.

### Quick Action FAB
A floating `🎯` button (fixed bottom-right) opens a sliding horizontal menu of context-relevant quick actions. Each opens a `qa-sheet` (bottom-sheet modal) for confirmation/input.

### Responsive
Single breakpoint at `900px`. Below it, all grids collapse to single-column. Primarily designed for tablet/desktop DM screen, usable on mobile.

---

## 5. Technical Debt & Pain Points

### Highest Priority

**1. No build system on a 7,300-line file**
The single-file architecture was a feature in v1.0. It is now a liability. The file is hand-minified (inconsistent whitespace, minimal comments) with no linting, no type safety, no dead-code elimination. The roadmap has a Vite migration planned before Drop 4.

**2. The stacked `:root` cascade is a trap**
Three palette declarations in the same `<style>` block means the effective palette is invisible — you have to scroll to line 971 to see what actually renders. Any new CSS that references a variable may pick up an earlier declaration if the later one is accidentally removed.

**3. `parseMechanics()` is a 230-line if/else monolith**
Every new mechanic key adds another `else if` branch. There is no dispatch table, no schema, no validation. A registry approach (`const MECH_HANDLERS = { hp: (val, changes) => ... }`) would make it extensible and testable.

**4. `callAI()` has zero resilience**
- No `AbortController` → a hung request blocks the UI indefinitely
- No retry → one transient 503 fails the whole turn
- No provider fallback → if Google AI is down, the app doesn't try OpenRouter
- No timeout → dependent entirely on the provider's server timeout

**5. `chatHistory` is pruned silently at 80 messages**
Old messages are discarded without any user notification or archive. The AI system prompt compensates via the ledger, but the chat record is genuinely lossy.

**6. AI contract integrity is DOM-dependent**
`buildPrompt()` reads contracts via `document.getElementById()?.value`. If a textarea isn't rendered or a user clears it, the contract is silently omitted and the AI loses its behavioral guardrails. Contracts should live in `state`, not the DOM.

### Medium Priority

**7. `migrate()` is a single unconditional function**
All migration patches run on every load with no per-version gates. Proper `if(savedVer < N)` guards would make migrations safe and auditable.

**8. Dual `storyThread` / `storyChapters` structures**
The `note:` quick action still writes to `state.storyThread`. The `✨ Chapter` button writes to `state.storyChapters[]`. Both are synced to Firebase. The legacy string is never cleared after migration.

**9. Setup wizard redundancy**
Several `worldData` fields are writable from both Setup wizard and World tab live textareas. Nothing prevents re-opening Setup post-launch and overwriting live campaign state.

**10. The offline "cache" is misleading**
Shows a response to a *previous* user message, not the current one. No request queuing, no reconnect sync.

### Low Priority

**11. No `AbortController` on TTS**
If a long AI response is being read aloud and a new message is sent, the old utterance continues playing.

**12. Firebase config stored in plaintext in localStorage**
Acceptable for a private game tool, but worth noting for any future multi-user expansion.

**13. `genLedger()` full-mode at ~2,500 tokens is expensive**
Injected into every system prompt. A smarter incremental ledger (only changed sections since last call) would reduce cost significantly.

---

*This document was generated from live code analysis of `index.html` (7,297 lines, `SAVE_VERSION=8`) as of June 14, 2026.*

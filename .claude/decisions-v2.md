# V2 Decisions Log

*Design choices made during planning. Reference when a question comes up that was already answered.*

---

## Architecture

| Decision | Rationale | Session |
|----------|-----------|---------|
| SolidJS with signals for reactive state | Decided in v1 Session 29. Fine-grained reactivity without virtual DOM overhead. | 29 |
| Vite build system | Carried from v1. Fast dev server, clean builds. | v1 |
| Five-piece architecture: UI, Engine, State, Data, Content | Clear boundaries. Each piece has one job. AI can build autonomously when boundaries are clear. | 30 |
| Module map organized by mode (play/reference/setup/manage) | Law 4 enforcement — directory boundaries prevent mode bleed. | 30 |
| Dispatch table pattern for mechanics | Built in v1 Session 29. Each mechanic key registers a handler. Extensible without touching core. | 29 |

## Modes & Navigation

| Decision | Rationale | Session |
|----------|-----------|---------|
| Four modes: setup, play, reference, manage | Every feature belongs to exactly one mode. Setup is onramp (locked after launch). Play is the session. Reference is mid-session orientation. Manage is between sessions. | 30 |
| Bottom nav: Cargo / Journal / Settings | Combat and level-up are event-driven overlays, not tabs. Dice roller is inline icon. | 30 |
| Combat overlay, not combat tab | Appears when combat starts, disappears when it ends. Not a permanent nav destination. | 30 |
| Level-up wizard is event-driven | Triggers on XP threshold, not from a button. Overlay that appears when conditions are met. | 30 |
| Setup locks after campaign launch | One-way transition. Setup → Play. No going back without intentional manage mode access. | 30 |
| Reference is overlay, not navigation | Tap character tile → sheet slides up. Tap away → back to chat. No mode switch, no friction. | 30 |
| Manage is intentional, one step removed | Between-session work. Contract tuning, session review, data fixes. Shouldn't be accessible by accident mid-session. | 30 |

## UI Principles

| Decision | Rationale | Session |
|----------|-----------|---------|
| Tap-to-source — no dead text | Any displayed information is tappable and navigates to its source. Location banner → journal. Quest chip → quest detail. Mechanic pill → reference. | 30 |
| Situation bar replaces quest bar | Main quest pinned left (DM's railroad). Active consequences/countdowns pinned after (visually distinct, sorted by urgency). Player quests scrollable after. | 30 |
| Context banner is interactive | Location, weather, time — all tappable. Location taps through to journal locations section. | 30 |
| Nav dot badges + in-chat alerts for notifications | Player needs to know when state changes elsewhere. Both patterns worked in v1. | 30 |
| No suggestion chips | Cut from v2. Didn't earn their place. | 30 |
| No `//` command system | v1 slash commands patched broken mechanics. If v2 mechanics pipeline works, players don't need them. Dev commands live in DevTools. | 30 |

## Data & Storage

| Decision | Rationale | Session |
|----------|-----------|---------|
| Three data tiers: Firebase, IndexedDB, Shared Bundles | Firebase = game state (synced during play). IndexedDB = reference content (local, never synced). Bundles = content packs (imported per player, reusable). | 30 |
| Shared bundles are "on import," not "one-time" | New players joining mid-game import the same bundle. Bundle is reusable, not consumed. | 30 |
| Compendium items → IndexedDB, AI-generated items → Firebase | Sourcebook items are reference (local). Items created during play are game state (synced). | 30 |
| Campaign map images → IndexedDB | Too large for Firebase. Location pins and discovered state sync via Firebase. | 30 |
| Campaign vs System data split | Campaign data resets on swap (PCs, world, NPCs, quests, chat, combat). System data survives (spell DB, class data, feats, settings, preferences, rules contracts). | 30 |

## State & Ownership

| Decision | Rationale | Session |
|----------|-----------|---------|
| Field ownership: AI / Player / System | No field writable by more than one owner. AI writes via mechanics pipeline. Player writes via editors. System writes via wizards. | 30 |
| Checkpoint/rewind in play mode, not manage | Safety nets must be accessible mid-session. Law 2: "when enforcement fails, the player can rewind." | 30 |
| Relationships array dropped | Redundant with NPC tracker dispositions. One home for data. | 30 |

## Engine & AI

| Decision | Rationale | Session |
|----------|-----------|---------|
| Drift detectors in mechanics pipeline | Catch when AI narrates state changes without emitting mechanics. Law 2 enforcement. Carried from v1 (detectUnloggedGold, etc.). | 30 |
| Active consequences injected into buildPrompt | AI can't forget to enforce time-sensitive events. Engine flags expiring timers for resolution. | 30 |
| Consequence timer enforcement added to AI failure record | Both AI forgetting and UI burying were problems. Fix is structural on both sides. | 30 |

## Combat

| Decision | Rationale | Session |
|----------|-----------|---------|
| Phase 1: zone grid. Phase 2: visual tile map | Zone combat (Frontline/Backline/Flanks) is v2 starting point. Visual tile map (mobile VTT inspired) is evolution. Architecture supports both — Combat.jsx grows, nothing else changes. | 30 |
| Combat turn enforcement added to AI failure record | AI combined turns, skipped players, advanced story while players deliberated. Needs enforced turn order. | 30 |

## Multi-Player

| Decision | Rationale | Session |
|----------|-----------|---------|
| Device-local "which PC am I" setting | No formal identity system. Family shares informally — one player can act for another. Works well in practice. | 30 |
| Expandable to 6-7 players | Universal design. Currently 2, but architecture supports more. | 30 |

## Child-Friendly View

| Decision | Rationale | Session |
|----------|-----------|---------|
| Separate URL entry point (AppSimple.jsx) | Same state, same engine, same Firebase + API keys. Different UI root with bigger targets, less text, guided choices. Not a toggle — a different app shell. | 30 |

## Content Pipeline

| Decision | Rationale | Session |
|----------|-----------|---------|
| Four input paths: files, web, homebrew, AI-generated JSON | PDF/epub/mobi, web reference import, in-app authoring, structured JSON from any LLM. | 30 |
| All content normalized to common schema per type | Engine, level-up wizard, spell picker, module tracker all read from IndexedDB, not hardcoded constants. | 30 |
| Episode/module tracking is a workboard item | How the AI tracks campaign progress, chapter triggers, discovery conditions — needs its own spec. Architecture acknowledges it exists. | 30 |

## Audio

| Decision | Rationale | Session |
|----------|-----------|---------|
| TTS is not automatic | Player-triggered toggle. Browser TTS + ElevenLabs free tier. Sometimes the baby is asleep. | 30 |

## Documentation Structure

| Decision | Rationale | Session |
|----------|-----------|---------|
| Six doc files with clear purposes | CLAUDE.md (auto-loaded, laws + architecture). session-log.md (handoff). workboard.md (active work). prime-directive-v2.md (vision). decisions-v2.md (this file). ai-failures.md (Law 2 audit trail). | 30 |
| Five Laws live in CLAUDE.md | Auto-loaded every session. Dev AI can't drift from rules it reads every time. | 30 |
| AI failures in own file, not directive | Keeps the laws clean. Law 2 in CLAUDE.md gets inline examples + pointer to ai-failures.md. | 30 |

## Open Questions (not yet decided)

- **OOC & Rules channel context** — Do they share narrative AI context? Does Rules build its own prompt? Does OOC need AI at all?
- **Child-friendly view target age** — 7-16 is wide. What's the actual simplification scope?
- **Episode/module tracking system** — How does the AI know where the party is in the story? What triggers chapter progression? Workboard spec needed.
- **Quick Actions redesign** — Kept from v1 but needs improvement. What actions? How presented?
- **Encounter preset import** — Design encounter externally, import JSON. Never used in v1 but could tie into content pipeline.

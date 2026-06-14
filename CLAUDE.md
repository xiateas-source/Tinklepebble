# Tinkle's Tinctures — Claude Code Instructions

## Standing Permissions
- Routine UI, CSS, copy, patch notes, roadmap, and dead code changes: proceed without asking
- Ask for confirmation before: Firebase config changes, STATE_KEYS/SAVE_VERSION bumps, save() structure changes, breaking data model changes, refactors >50 lines

## Session Start Protocol
1. Read `.claude/roadmap.md` — source of truth for architecture, active palette, pending work, completed items
2. Read `.claude/features.md` — comprehensive map of every tab, function, state field, mechanic, QA type, and element ID
3. Read `.claude/prime-directive.md` when asked — project philosophy, character canon, AI contract history, VTT drops plan
4. Resume from where the last session left off
5. Work on branch `claude/plugins-installation-gikz6l` (never push to main without explicit instruction)

## Architecture
- Single HTML file: `index.html` — all CSS, JS, HTML inline (~7,600 lines)
- GitHub Pages from `main` branch
- Firebase Realtime Database for real-time sync
- `state` persisted to `localStorage('tt_v1')` and Firebase
- Single active `:root` CSS block (dead CSS blocks 1 & 2 removed 2026-06-14)
- `SAVE_VERSION=11` — increment + add `migrate()` gate for any state structure changes
- `migrate()` = version-gated engine: structural guards → v8 gate → v9 gate → v10 gate → v11 gate → canonical QA → core defaults
- `renderAll()` = central render; `renderChat()` = narrative chat only
- `parseMechanics()` = parses AI mechanic blocks after each response
- `genLedger()` + `buildPrompt()` = build AI system prompt
- `sendMsg()` = main chat send; `_ctxInject` = system prompt injection for next send only

## Target Palette (Visual Redesign v2 — D&D Beyond / Demiplane style)
```css
--bg-dark: #16100a;       /* body */
--bg-card: #231a10;       /* panels */
--bg-card-light: #322619; /* nested surfaces */
--accent-brass: #c19a6b;  /* primary gold */
--accent-copper: #b2533e; /* secondary / danger */
--text-light: #f4ecd8;
--text-muted: #a49683;
--status-green: #5f8575;
```
*(Current in-code palette is old dark theme — redesign in progress)*

## Architecture Warnings
- Do NOT refactor Combat tab — Drop 4 replaces it entirely
- Do NOT push to main without explicit user instruction
- Vite migration should happen before Drop 4
- State visibility split is prerequisite for Drop 6
- NEVER add level-dependent fields (hp_max, class, features, magic, skills, slots, resources) to SHEET_FIELDS in loadState() or fbStartListening() — migrate() owns those fields
- Slasher must NEVER learn the operation is a con — Contract 1 (#ai-persona) must always contain: "He does not know the operation is a con. Never tell him."

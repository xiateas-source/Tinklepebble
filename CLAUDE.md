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

## Session End Protocol
Before ending any session:
1. Commit all changes with a clear message describing what was built
2. Push the feature branch: `git push -u origin claude/plugins-installation-gikz6l`
3. If the user asks to go live: merge to main and push `origin main`
4. Update `.claude/roadmap.md` — mark completed items ✓, add any new pending items
5. **Start a new chat for the next session** — do not continue in the same chat across separate work sessions

## Token Management
- Open a new chat at the start of every work session (even same day, if you've stepped away)
- A fresh chat re-reads CLAUDE.md + roadmap.md and is fully oriented in seconds
- Long chat history burns tokens re-reading context that's already captured in these files
- Never cut mid-feature: finish the task, commit, push, THEN start a new chat
- The `.claude/` files are the memory — nothing is lost by starting fresh

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

## Active Palette (Visual Redesign v2 — Soft Autumn / D&D Beyond mobile)
```css
--bg:#1a0c07;        /* near-black chocolate */
--surface:#2c1a10;   /* dark chocolate */
--surface2:#3c2618;  /* medium chocolate */
--surface3:#4c3222;  /* lighter chocolate */
--gold:#b05830;      /* cinnamon — primary accent */
--gold-dim:#70381a;
--gold-bright:#d07845;
--red:#8b3a2a;       /* deep chocolate red — danger */
--green:#788a73;     /* sage grey — status */
--text:#c4a88a;      /* warm beige */
--text-bright:#e8d9c4; /* champagne beige */
```
*(Soft Autumn palette deployed 2026-06-14. Variable names unchanged — just values swapped.)*

## Architecture Warnings
- Do NOT refactor Combat tab — Drop 4 replaces it entirely
- Do NOT push to main without explicit user instruction
- Vite migration should happen before Drop 4
- State visibility split is prerequisite for Drop 6
- NEVER add level-dependent fields (hp_max, class, features, magic, skills, slots, resources) to SHEET_FIELDS in loadState() or fbStartListening() — migrate() owns those fields
- Slasher must NEVER learn the operation is a con — Contract 1 (#ai-persona) must always contain: "He does not know the operation is a con. Never tell him."

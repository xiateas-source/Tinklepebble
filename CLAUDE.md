# Tinkle's Tinctures — Claude Code Instructions

## Standing Permissions
- Routine UI, CSS, copy, patch notes, roadmap, and dead code changes: proceed without asking
- Ask for confirmation before: Firebase config changes, STATE_KEYS/SAVE_VERSION bumps, save() structure changes, breaking data model changes, refactors >50 lines

## Session Start Protocol
1. Read `.claude/roadmap.md` — it is the source of truth for architecture, active palette, pending work, and completed items
2. Resume from where the last session left off
3. Work on branch `claude/plugins-installation-gikz6l` (never push to main without explicit instruction)

## Architecture
- Single HTML file: `index.html` — all CSS, JS, HTML inline (~6900 lines)
- GitHub Pages from `main` branch
- Firebase Realtime Database for real-time sync
- `state` persisted to `localStorage('tt_v1')` and Firebase
- Multiple stacked `:root` CSS blocks — LAST one wins (~line 966)
- `SAVE_VERSION=7` — increment + add `migrate()` case for any state structure changes
- `renderAll()` = central render; `renderChat()` = narrative chat only
- `parseMechanics()` = parses AI mechanic blocks after each response
- `genLedger()` + `buildPrompt()` = build AI system prompt
- `sendMsg()` = main chat send; `_ctxInject` = system prompt injection for next send only

## Active Palette (dark mode, final :root block)
```css
--bg:#2c1d1a; --surface:#3b2b24; --surface2:#4a3b39; --surface3:#5a4a46;
--border:#4a3530; --border-bright:#6a5048;
--gold:#c8a06a; --gold-dim:#8a6040; --gold-bright:#e8c898;
--text:#cbbba0; --text-dim:#8a7060; --text-bright:#f2efe9; --cream:#f2efe9;
```

## Architecture Warnings
- Do NOT refactor Combat tab — Drop 4 replaces it entirely
- Do NOT push to main without explicit user instruction
- Vite migration should happen before Drop 4
- State visibility split is prerequisite for Drop 6

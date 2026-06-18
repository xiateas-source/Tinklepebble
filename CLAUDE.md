# Hoard of the Dragon Queen — Claude Code Instructions

## Standing Permissions
- Routine UI, CSS, copy, patch notes, roadmap, and dead code changes: proceed without asking
- Ask for confirmation before: Firebase config changes, STATE_KEYS/SAVE_VERSION bumps, save() structure changes, breaking data model changes, refactors >50 lines

## Session Start Protocol
1. Read `.claude/session-log.md` — handoff note from last session: what was built, what's in progress, decisions made, and next steps. This is the fastest path to resuming work.
2. Read `.claude/roadmap.md` — architecture, active palette, pending work, completed phases
3. Read `.claude/features.md` — every tab, function, state field, mechanic, QA type, element ID
4. Read `.claude/prime-directive.md` — project philosophy, character canon, AI contract history, VTT drops
5. **Vision alignment check** — flag any tension between the proposed work and the Prime Directive. State it once, briefly — don't block work, just surface it.
6. Check `git branch` and `git log --oneline -5` — confirm which branch you're on and what the last commits were. Work on the feature branch assigned in the environment config (never push to main without explicit instruction).
7. Greet the user with a one-line summary of where things stand, based on the session log.

## Session End Protocol
Before ending any session:
1. **Commit** all changes with a clear message describing what was built
2. **Push** the feature branch: `git push -u origin <current-branch>`
3. If the user asks to go live: merge to main and push `origin main`
4. **Update `.claude/roadmap.md`** — mark completed items, add any new pending items
5. **Update `.claude/features.md`** — if new functions, state fields, mechanics, or UI elements were added
6. **Write `.claude/session-log.md`** — overwrite with a fresh handoff note covering:
   - **Session date** and session number (increment from last)
   - **Shipped** — bullet list of what was built and deployed this session
   - **Decisions made** — any design choices, user preferences, or constraints established
   - **Known issues** — bugs found, regressions, things that need follow-up
   - **In progress** — anything started but not finished (include file + line context)
   - **Next up** — what the user indicated they want next, or logical next steps
   - **Branch state** — current branch name, whether it's ahead of main, last commit hash
7. Commit and push the `.claude/` file updates
8. **Merge `.claude/` updates to main** — doc files must ALWAYS be on main so the next session reads current info regardless of which branch it starts on. Do this even if code changes haven't been merged yet: `git checkout main && git merge <branch> && git push origin main && git checkout <branch>`
9. **Start a new chat for the next session** — do not continue in the same chat across work sessions

## Deployment Rule
When code is merged to main (user says "make it live"), always merge `.claude/` doc updates in the same operation. Never leave doc updates stranded on the feature branch — a new session that starts from main will read stale docs and waste tokens on outdated context.

## Token Management
- Open a new chat at the start of every work session (even same day)
- The `.claude/` files ARE the memory — session-log.md is the bridge between chats
- A fresh chat reads 4 small files and is fully oriented in seconds; long chat history burns tokens re-reading context already captured in these files
- Never cut mid-feature: finish the task, commit, push, write session log, THEN end
- If context is running low: finish current task, write the session log, tell the user to start fresh

## Architecture
- Vite build: `src/main.js` + `src/style.css` → `index.html` → builds to `docs/` (GitHub Pages from `main`)
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` persisted to `localStorage('tt_v1')` and Firebase
- `SAVE_VERSION=12` — increment + add `migrate()` gate for any state structure changes
- `migrate()` = version-gated engine: structural guards → v8–v12 gates → canonical QA → core defaults
- `renderAll()` = central render; `renderChat()` = narrative chat only
- `parseMechanics()` = 60+ handlers / 65 keys; `_MECH_KEYS` controls display stripping
- `genLedger()` + `buildPrompt()` = build AI system prompt
- `sendMsg()` = main chat send; `_ctxInject` = system prompt injection for next send only
- Firebase sync: `_mergeChatHistories()` = clock-independent chat merge (prevents vanishing messages)

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
- Drop 4 (Zone Combat) is shipped — Combat tab is the zone grid now
- Do NOT push to main without explicit user instruction
- State visibility split is prerequisite for Drop 6
- NEVER add level-dependent fields (hp_max, class, features, magic, skills, slots, resources) to SHEET_FIELDS in loadState() or fbStartListening() — migrate() owns those fields
- Contract 1 (#ai-persona) must always contain MULTI-PLAYER ADDRESSING clause — buildPrompt() validates this

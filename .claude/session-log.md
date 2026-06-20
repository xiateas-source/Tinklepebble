# Session Log — Handoff Note

## Session 29 · 2026-06-20

### Shipped
- **v2 AI engine module** — Complete AI pipeline ported from v1 monolith into clean modular architecture at `/home/user/tinklepebble-v2/src/ai/`:
  - `providers.js` — Google AI and OpenRouter fetch wrappers with 25s timeout and retry logic
  - `prompt.js` — `buildPrompt()` (system prompt with all 9 contracts + module fidelity) and `genLedger()` (compact/full state ledger)
  - `mechanics.js` — `parseMechanics()` as dispatch table registry (DR-5 pattern), `extractMechanicsBlock()`, `stripMechanicsFromDisplay()`, 60+ handler registrations
  - `engine.js` — `callAI()` (retry + free-model fallback), `sendMsg()` (full chat send loop), `//` slash commands, roll request queue
  - `index.js` — barrel export for clean imports
- **v2 InputBar wired to AI** — Chat input now calls `sendMsg()`, typing indicator driven by `isTyping` signal, send button disabled during AI response
- **v1 .claude/ docs merged to main** — Session End Protocol completed, local main reset to match origin/main before merge

### Decisions Made
- v2 parseMechanics uses **dispatch table registry** (the DR-5 refactor) — each mechanic key registered with `reg(key, handler)` instead of v1's 400-line if/else chain
- parseMechanics returns `{ changes, rollQueue }` — no circular imports between engine.js and mechanics.js
- v2 mechanics operate on a **structuredClone** of state then assign back — clean immutable pattern vs v1's direct mutation

### Known Issues
- v2 GitHub repo not created — MCP integration lacks `create_repository` permission. User needs to create `tinklepebble-v2` on GitHub manually
- v2 Firebase sync not implemented
- v2 no `checkLevelUp` or `_autoOpenLevelUp` wired (level-up wizard not yet built)
- v2 no detection functions (`detectUnloggedGold`, etc.) — planned for later
- v2 no `_validateMechanics` post-parse audit yet
- v2 no TTS integration
- v2 mechanics `roll_request` handler adds to ctx.rollQueue but toast-based roll UI not built yet
- All prior v1 known issues from Session 27 still apply

### In Progress
- v2 needs: Firebase sync, level-up wizard, combat UI, character sheet editing

### Next Up
1. **Create GitHub repo** for tinklepebble-v2 (user action) and push scaffold + AI engine
2. **API key settings UI** — Systems panel needs provider selection, key input, model picker
3. **Roll request UI** — stacked banners from rollRequestQueue signal, dice roller integration
4. **Detection functions** — port detectUnloggedGold/NPC/Item/Damage/Healing/Condition/Location
5. **State persistence** — save/load with migration, Firebase sync
6. **Combat module** — zone grid UI, initiative strip, active card
7. **Character sheets** — 6-tab editing, level-up wizard
8. Continue v1 maintenance as needed

### Branch State
- v1 Branch: `claude/naerytar-infiltration-review-y1ixxl` (up to date with origin)
- v1 Last commit: 0643c15 (CHANGES pill fix + contract update)
- v1 main: merged and pushed (matches feature branch)
- v2 Location: `/home/user/tinklepebble-v2/` (local git, master branch)
- v2 Last commit: 2a8bf6c (AI engine module)
- v2 Build: 79KB JS bundle (was 38KB UI-only)

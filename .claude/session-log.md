# Session Log — Handoff Note

## Session 21 · 2026-06-18

### Shipped
- **Markdown/text module import** — `.md` and `.txt` files now accepted alongside PDF. Markdown parser splits on `#` headings, merges `##` subsections into parents. HotDQ markdown splits cleanly into 15 sections (8 chapters + overview + appendices)
- **PDF text extraction fix** — Uses Y-coordinates to preserve line breaks instead of flattening all text into one string. Chapter patterns now match against individual lines (first 15 per page, anchored to `^`)
- **PDF fallback threshold** — Triggers page-chunking when avg section > 40 pages (was only when ≤1 section). Up to 12 chunks with meaningful labels
- **Auto-assign on import** — Runs smart section assignment automatically after file load. Chapters → episodes, overview/appendices/credits/monsters/magic items → Module Reference
- **Import default fix** — Sections default to "Create New Episode" when no existing episodes (was defaulting to Skip)
- **Button renamed** — "Import PDF" → "Import Module" to reflect broader file support
- **PC import blank-template fix** — `importFromPaste()` detects blank PCs (no name) and fully replaces them instead of preserving empty HP/inventory/slots from templates
- **migrate() stale contract cleanup** — Auto-clears contracts containing "MEREN SPELLS" or "CON OPERATION MECHANICS"
- **migrate() ox defaults emptied** — Ox personality/bonds/quirks default to empty strings instead of old Tinkle-specific text
- **genLedger() skip unnamed PCs** — `if(!p.name)return;` prevents blank PCs from polluting AI context
- **Firebase sync fix** — Removed canonical PC merge from Firebase listener. Remote (DM) data is now authoritative — players joining on fresh/stale devices get correct character data without local overwrites
- **Character template file** — `character-template.json` for AI-assisted character creation via Gemini
- **PC import JSON** — `pc-import-ready.json` with Valenns/Slasher/Aria converted to app format

### Decisions Made
- Markdown import is preferred over PDF for module loading — PDF parsing is unreliable with D&D layout
- PDF import kept but deprioritized for revision later
- Firebase canonical PC merge removed entirely — was legacy from hardcoded PCs, broke import workflow
- Character Creation Wizard added to roadmap as future feature
- World data populated through Episode Tracker + natural AI play, not via Gemini template
- Module Reference = campaign overview + appendices; Episodes = chapters 1-8

### Known Issues
- **Flag 3** — "hashtags by names" in character sheet: needs screenshot to reproduce
- **Flag 6** — QA Editor buttons: needs device-specific testing
- **PDF import quality** — garbled titles, false chapter breaks on "Rewards" text. Deprioritized in favor of markdown
- **Old migrate() version gates** — v10/v11 gates still reference Tinkle/Pebble/Slasher by old IDs. Left alone per Session 20 decision (backward compat for old saves)

### In Progress
- Nothing actively in progress — user is doing Full Reset + re-import sequence on device

### Next Up
1. **Verify clean state** — user re-importing characters + module after reset, needs JSON audit
2. **Set Chapter 1 Active** — all episodes currently pending
3. **AL compliance clause** — player asked about it, user hasn't decided whether to add to contracts
4. **Character Creation Wizard** — in roadmap, not yet built
5. **Inline NPC name linking** — tap NPC names in chat to navigate to tracker
6. **Combat quick-panel** — context strip as tappable combat action bar

### Branch State
- Branch: `claude/new-session-rvx6tn`
- All changes committed and merged to main
- Last commit: 09e34e3 (Remove canonical PC merge from Firebase listener)

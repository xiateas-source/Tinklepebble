# Tinkle's Tinctures — Dev Roadmap

## Standing Permissions
- Routine UI, CSS, copy, patch notes, roadmap updates, dead code removal: proceed without asking
- Ask before: Firebase config changes, STATE_KEYS/SAVE_VERSION bumps, save() structure changes, breaking data model changes, refactors >50 lines

---

## ⚠ SECURITY CONSTRAINT (non-negotiable, permanent)
**Slasher (Black Dragonborn Fighter) must NEVER learn the operation is a con.**
Contract 1 (`#ai-persona`) must always contain: *"He does not know the operation is a con. Never tell him."*
This fragment must survive every refactor. When contracts-to-state migration happens, `buildPrompt()` must validate this fragment before every send and throw a hard error if it's missing.

---

## App Architecture
- Vite-based build: `src/main.js` + `src/style.css` → `index.html` → builds to `docs/` (deployed via GitHub Pages). `index.html` is the lean entry point; all logic lives in `src/`.
- GitHub Pages deployment from `main` branch
- Firebase Realtime Database for real-time sync; `STATE_KEYS` controls what syncs
- `state` persisted to `localStorage('tt_v1')` and Firebase
- Single active `:root` CSS block (blocks 1 & 2 removed 2026-06-14)
- `SAVE_VERSION=11` — v11 gate: re-patches L3 data that v10 gate set but SHEET_FIELDS bug then clobbered. v10 gate: canonical L3 sync. v9 gate: campaignLaunched backfill. v8 gate: storyChapters seed, module init.
- `migrate()` = version-gated engine: structural guards → v8 → v9 → v10 → v11 gates → canonical QA → core defaults
- `renderAll()` = central render; `renderChat()` = narrative chat
- `callAI()` = retry wrapper (2x, 1.2s/2.4s, 5xx only) + OpenRouter free-model fallback
- `summarizeAndPrune()` = rolling AI summary at 75 messages; prunes oldest 30 only on confirmed summary
- AI contracts read from DOM via `document.getElementById()?.value` — fragile (migration to state planned)

## ⚠ SHEET_FIELDS Rule (permanent)
Never add `hp_max`, `class`, `level`, `features`, `magic`, `skills`, `slots`, `resources`, or `concentrating` to SHEET_FIELDS in `loadState()` or `fbStartListening()`. `migrate()` owns all level-dependent fields. `getCanonicalPCs()` reads from `state.pcs` which may be demo/Level-1 data on a fresh device.

## Active Palette (Visual Redesign v2 — Soft Autumn, deployed 2026-06-14)
```
--bg:#1a0c07        near-black chocolate
--surface:#2c1a10   dark chocolate
--surface2:#3c2618  medium chocolate
--surface3:#4c3222  lighter chocolate
--gold:#b05830      cinnamon — primary accent
--gold-dim:#70381a
--gold-bright:#d07845
--red:#8b3a2a       deep chocolate red — danger
--green:#788a73     sage grey — status / success
--blue:#608278      muted sage-teal — player messages
--text:#c4a88a      warm beige body text
--text-bright:#e8d9c4  champagne beige — headings / bright text
```
*(Soft Autumn palette: chocolate bg + cinnamon accents + sage grey status + champagne text)*

---

## What to Leave Alone (stable — high regression risk)
- **Firebase sync** (`fbInit/fbStartListening/fbLoad/fbSave`) — clean, correct, leave it
- **`sendMsg()` / `buildPrompt()` core loop** — `_ctxInject` injection is elegant
- **Quick Action underlying logic** (`executeQA`, `openQASheet`) — switch dispatch + bottom-sheet is correct
- **QA menu bottom-sheet animation and grid layout** — just shipped, let it settle before touching
- **Checkpoint / rewind stack** — `triggerChk()` call sites are all appropriate
- **OOC channel split** — two separate history arrays, separate context injection
- **TTS dual-provider layer** — browser / ElevenLabs branching is clean
- **`parseMechanics()` business logic** — 35 handlers are correct; only the if/else chain structure needs refactoring (not yet)
- **`toast()` / `mechToast()`** — stacking feed is working well

---

## Completed Work (Phase 0 + Deep Refactors)

### Quick Wins — ALL DONE 2026-06-14
- QW-1 ✅ Delete CSS Block 2 — dead weight removed
- QW-2 ✅ Delete CSS Block 1, move font vars to Block 3
- QW-3 ✅ Compact ledger default
- QW-4 ✅ storyThread confirmed out of STATE_KEYS
- QW-5 ✅ `note:` QA redirects to storyChapters[] "Field Notes"
- QW-6 ✅ QA menu grouped by category + ⭐ pinned top 3
- QW-7 ✅ Count badges on World/Session/Wagon tabs
- QW-8 ✅ AbortController + 25s timeout in callAI()
- QW-9 ✅ "⚙ Systems" → "❓ Rules"; OOC channel labels updated
- QW-10 ✅ Tab bar: AI DM first, overflow ⋮ menu for AI Tools/Dev/Setup

### Deep Refactors
- DR-1 ✅ Version-gated `migrate()` — 3-section structure, now at v11
- DR-2 ✅ `storyThread` complete elimination
- DR-3 ✅ Setup Wizard lock (`campaignLaunched` flag, SAVE_VERSION 9)
- DR-4 ✅ `callAI()` retry + provider fallback wrapper
- DR-5 ⬜ `parseMechanics()` → dispatch table registry (High risk, week+)
- DR-6 ⬜ Contracts → `state.aiContracts{}` with Firebase sync (Critical risk)
- DR-7 ✅ Rolling AI summary — `summarizeAndPrune()` at 75 messages
- DR-8 ⬜ Incremental ledger (depends on DR-5)

### Phase 0 Shipping Items — ALL DONE 2026-06-14
- ✅ Header stretch fix
- ✅ 🎲 Roll & Submit button in header
- ✅ Remove Dice Roller from Combat tab
- ✅ Remove #party-status-mini from header
- ✅ syncWorld() + syncBP() Setup↔World sync
- ✅ World tab: World State | Operations sub-tabs
- ✅ Quest + NPC dedup
- ✅ primary_mission + quest_fail mechanics
- ✅ Income/NPC/Quest contract enforcement
- ✅ OOC + party chat: live ledger on every send
- ✅ Session Summary readability
- ✅ Scroll controls: ↑↓ on all chat panels
- ✅ Story Thread ebook read mode (📖)
- ✅ Story Chronicle chapter system (SAVE_VERSION 8)
- ✅ Quest model: hidden:false default
- ✅ Module tracker (Hoard of the Dragon Queen, 8 episodes)
- ✅ Context Refresh / Re-sync protocol rework
- ✅ Level-up wizard (Fighter/Rogue/Bard L2–L5, LEVEL_UP_DATA, BARD_SPELLS)
- ✅ Canonical L3 character sync (SAVE_VERSION 10→11)
- ✅ SHEET_FIELDS double-clobber fix (loadState + fbStartListening)
- ✅ Subclass display on character cards + sheet
- ✅ Current HP editable field on sheet
- ✅ Flag context: `_buildFlagUIContext()` captures tab/channel/sub-panel at flag creation

---

## Phase 1 — Active Sprint
*Phase 1 COMPLETE as of 2026-06-15.*
- [x] Context Refresh / Re-sync protocol rework
- [x] **Visual redesign** — D&D Beyond / Demiplane mobile style (see Visual Redesign v2). CSS pass first, then nav restructure.
- [x] **Character sheet swappable tabs** — Skills / Features / Attacks / Spells / Spellbook / Gear (done 2026-06-14)
- [x] **Auto-modifier calculation** — saves + skills live-calculated from ability scores + skillProfs (done 2026-06-15)
- [x] Vite migration — src/style.css + src/main.js + lean index.html, builds to docs/ (done 2026-06-15)

### Shipped 2026-06-15
- ✅ Playwright bug fixes: header menu z-index, dead renderCards(), Firebase offline banner
- ✅ Base URL fix: /Tinklepebble/ for GitHub Pages subdirectory deployment
- ✅ Tap-to-roll ability checks in PC overview (all 6 stats + initiative)
- ✅ Roll result strip with 📨 Send to chat button in PC overview
- ✅ Save-proficiency dots on stat grid (gold ● + gold border if save is proficient)
- ✅ Proficient skills panel in PC overview — tappable pills to roll skill checks
- ✅ Auto-calculated Passive Perception from WIS + Perception prof
- ✅ XP progress bars in party list rows and PC overview
- ✅ Equipped gear tag pills in PC overview
- ✅ D&D term tooltips in narrative chat (27 terms, tap for definition popup)
- ✅ Message lock — expanded "Read more" messages stay expanded across re-renders
- ✅ Spellbook level filter tabs (dynamic per available levels)
- ✅ Bug fix: addSpell() was switching to Gear tab instead of Spellbook tab
- ✅ NPC list: sort active→departed→deceased, disposition select with color, deceased dimmed
- ✅ Quest list: sort active→failed→done, active count header, hidden toggle button
- ✅ HUD tiles: red dot for conditions, purple dot for concentration
- ✅ Party PC rows: AC displayed alongside HP
- ✅ item_add mechanic stacks quantity on exact name match (Issue 21 partial)
- ✅ Party tab: character editor open by default (`<details open>`)

### Shipped 2026-06-15 (Session 2)
- ✅ HP step customization (state.hpSteps, renderStepBar, setHpStep)
- ✅ AI contract textareas auto-resize (field-sizing:content, JS resize on input)
- ✅ Drawer party tab glitch fix (renderCharTabs + renderSheets on openDrawer)
- ✅ Delete party member from PC overview (🗑 button in action row)
- ✅ Familiar HUD tile — Pip (Tinkle's rat), purple border, opens familiar bottom sheet
- ✅ Grit HUD tile — ox from state.wagon.ox, green border, opens Grit bottom sheet
- ✅ Pip familiar seeded in migrate() structural guard (no SAVE_VERSION bump)
- ✅ HUD scroll-fade gradient (::after on .global-hud)
- ✅ Town Rep → Wagon tab
- ✅ spell_add mechanic in parseMechanics()
- ✅ Dice roller upgrade (screenshot-matching: char select, roll type, modifier, ±delta, d4–d%)
- ✅ Bug 4: Firebase error toast → friendly message
- ✅ Bug 5: closeDrawer() resets currentTab → renderQAMenu()
- ✅ Familiar/Grit bottom sheets fixed (were rendering inline; now position:fixed transform-based)
- ✅ Flag system: .qa-modal z-index raised to 1600; floating ⚑ FAB added; font-size:16px on textarea; injectPanelFlags() in renderAll()
- ✅ QA menu redesign: full-width bottom sheet, 2-col card grid, FAB morphs to ✕, custom icon picker (state.qaFabIcon)

### Shipped 2026-06-15 (Session 3)
- ✅ **Theme: `--ivory` undefined** — added as alias of `--text-bright` in `:root`; was missing from all themes (broke stat values, dice results, modal titles)
- ✅ **Night mode readability** — text `#b09472` (was `#7a5c40`), gold `#c07040` (was `#8b4020`), panel borders and DM message gold border brightened
- ✅ **Hybrid parchment light mode** — warm `#f5efe1` background, filigree panel borders, matching form inputs in light mode
- ✅ **Compact flag export** — `exportFlagReport()` rewritten: `FLAGS YYYY-MM-DD — N pending\n1. [cat|verdict] note` (drops emoji/location/label, ~70% shorter)
- ✅ **Scroll freeze** — see Bug Fixes above
- ✅ **Flag FAB z-index** — see Bug Fixes above
- ✅ **QA FAB stuck** — see Bug Fixes above
- ✅ **Flag save untappable** — see Bug Fixes above
- ✅ **Cantrips tab** — see Polish Pass above
- ✅ **Quest expand** — see Polish Pass above
- ✅ **Multi-category items** — see Polish Pass above
- ✅ **Dice → Roll & Submit** — see Polish Pass above
- ✅ **Context strip** — see Polish Pass above
- ✅ **Spell descriptions** — see Polish Pass above
- ✅ **Copy contracts** — see Polish Pass above
- ⏳ **Character sheet rework** — 6-tab sheet in progress (subagent building; see design below)

## Phase 2 — Active Sprint

### Design Principles (session 2026-06-15)
- **Interactive-first** — every UI element should have a function; no decorative-only components
- **Minimize scrolling** — tap, swipe, and collapse over long vertical lists everywhere possible
- **Lock/unlock editing** — character data is read-only during play; deliberate unlock to edit
- **Compact + data-dense** — condense heavy data into small, scannable tiles and chips

### Phase 2 Sequence
1. ✅ **Bug fixes** — 4 of 5 done; skill bonus wrong still open
2. ✅ **Polish pass** — core items done; flag system quick wins still pending
3. ⏳ **Character Sheet Rework** — 6-tab digital sheet in progress (subagent building)
4. **"Clean without clutter" pass** — panel header audit, icon-only buttons, tighter padding
5. **Flag system quick wins** — categories, filter, Reviewed-Pending, export pending-only
6. **DR-6: Contracts → state** — migrate DOM textareas to state.aiContracts{}
7. **Visual Redesign v2: 4-tab nav**
8. **Drop 4: Zone Combat Map**

---

## Phase 2 Bug Fixes (fix before anything else)

- [x] **Scroll freeze** ✅ — `requestAnimationFrame` scroll-to-bottom on `showChatTab('narrative')`. (2026-06-15 Session 3)
- [x] **Flag icon blocked** ✅ — `#qa-fab-wrap` z-index raised 203→750, bottom 155px→160px. (2026-06-15 Session 3)
- [x] **QA FAB stuck open** ✅ — `closeQAMenu()` called at top of `showTab()` + `openDrawer()`. (2026-06-15 Session 3)
- [ ] **Skill bonus wrong** — Character Editor displays incorrect skill bonus values. (Dev note #1) *Still open.*
- [x] **Flag save button untappable** ✅ — Flag modal z-index raised to 1600; `padding-bottom:max(20px,env(safe-area-inset-bottom))` added to modal. (2026-06-15 Session 3)

---

## Phase 2 Polish Pass (expanded)

**Bugs already logged above. Polish pass = quick wins below.**

### Flag System
- [ ] Scroll-to-bottom button in narrative chat (Flag #2)
- [ ] "Idea / Feature Request" as a flag category option (Flag #6)
- [ ] Filter flags by category type in Dev tab (Flag #8)
- [ ] Add "Reviewed-Pending" verdict state (cycles: pending → fail → reviewed → resolved). Update export to include it. (Flag #9)
- [ ] Export pending-only flags button (Flag #11)
- [ ] Dev notes: in-place delete of individual notes, copy section to clipboard (Flag #10)

### Chat + Dice
- [x] Dice roller → full Roll & Submit ✅ — dice picker buttons now call `openRollSheet()`. (2026-06-15 Session 3)
- [x] Context strip ✅ — `renderContextStrip()` shows location·scene_title above HP bar; swaps to round/combatant during combat. (2026-06-15 Session 3)

### Character / Party
- [ ] Remove long rest + short rest buttons from player cards — handled via chat QA (Dev note #11b)
- [ ] Grit (ox) gets own HUD tile card alongside party — frees Wagon tab space (Dev note #14) *(Grit tile exists; this is about Wagon tab cleanup)*
- [x] Quest tap → expand ✅ — quest entries now use `<details>` + `<summary>` for inline expand. (2026-06-15 Session 3)

### Spells
- [x] Cantrips = Level 0 tab ✅ — Cantrips sub-tab added to Spellbook. (2026-06-15 Session 3)
- [x] Spell rows collapsible ✅ — `spell.desc` field added; descriptions visible inline. (2026-06-15 Session 3)

### Inventory
- [x] Multi-category items ✅ — `typeMatch` helper supports comma-separated types in cargo/party inventory filters. (2026-06-15 Session 3)
- [ ] Party shared inventory → move to Wagon tab or remove; resolve with party-vs-wagon ownership decision (Dev note #11a)
- [ ] Separate Gear tab from general inventory in character sheet (Dev note #10) *(Gear tab in new 6-tab sheet covers this)*

### World / Wagon
- [x] Town rep log → Wagon tab ✅ — done Session 2.

### AI Tools
- [x] Copy / export button for AI contracts ✅ — `copyContracts()` + "📋 Copy all" button in panel header. (2026-06-15 Session 3)

### Pending (not yet started)
- [ ] **"Clean without clutter" pass** — (1) Audit panel headers: remove redundant emoji where label alone is clear. (2) Icon-only buttons where context is self-evident (text labels → icon + tooltip). (3) Tighten padding: denser data, less whitespace wasted on chrome. Goal: data-dense, distraction-free.

---

## Character Sheet Rework — Confirmed Design (2026-06-15)

**Access:** Tap character name in HUD → full sheet bottom sheet. Tap party button in nav → same sheet. Character cards removed from default Party tab view.

**Lock / Unlock:**
- Locked (play mode): all fields read-only styled values. Only HP +/−, death save hearts/skulls, and condition chips are interactive.
- Unlocked (edit mode): fields become inputs in-place. No separate editor panel.
- **Auto-lock on close** — drawer closing = locking. Reopening always starts locked.

**Always-visible header strip:**
Name · Class/Subclass Lv.N · Race · Background · Player name (display-only)
AC · Initiative · Speed · HP (current / max / temp HP badge) · Hit Dice pips · Death Saves

**Proficiency bonus** (auto-calc, never editable) · **Inspiration toggle** (coin/flame)

**6 Sheet Tabs:**
| Tab | Contents |
|---|---|
| **Core** | 6 ability score circles (score + modifier) · 6 saving throws (prof dot + value) · Passive Perception · Passive Insight · Proficiency bonus |
| **Skills** | 18 skills: prof dot · stat tag · auto-calc modifier · tap to roll |
| **Combat** | HP (full controls) · Temp HP field · Hit Dice pips (tap to spend) · Death Saves · Conditions · Exhaustion 0–6 pip track · Attacks table |
| **Spells** | Spell slots by level (pip bubbles) · Spells list, each row tap-to-expand full description · Cantrips as level 0. Each spell carries a `desc` field — manually seeded now, compendium-backed in Drop 7. |
| **Gear** | Equipment list · Currency bubbles (CP/SP/EP/GP/PP) — separate from party treasury |
| **Features** | Class features · Racial traits · Feats · Languages (tap chips) · Tool proficiencies · Personality / Ideals / Bonds / Flaws (collapsible "Character Soul" section) |

**New state fields required (add to migrate() structural guard — no SAVE_VERSION bump needed):**
- `pc.hp_temp: 0` — Temporary HP
- `pc.exhaustion: 0` — Exhaustion level 0–6
- `pc.hd_used: 0` — Hit dice spent (max = level)
- `pc.personality: ""` — Personality Traits
- `pc.ideals: ""` — Ideals
- `pc.bonds: ""` — Bonds
- `pc.flaws: ""` — Flaws
- `pc.languages: []` — Languages as structured array

**New AI mechanics to add:**
- `exhaustion: pcname+1 | pcname-1`
- `hp_temp: pcname=N`

---

## Deferred / Brainstorm Later

### Blackburner (Business Profile → Treasury)
*Collecting more game data before designing. Intent: business profile moves to Treasury, reworked as at-a-glance banking/portfolio view — income log as transaction history, stock as portfolio view. Codename: Blackburner.*

### Claude Code Plugin in Flag Log (Flag #12)
*Scope unclear. Potential: in-app AI analysis of flags using Claude API, or context-export link. Needs dedicated design session.*

### AI DM Testing Chat (Flag #13)
*Isolated sandbox session separate from campaign history. Design questions: shared contracts? separate AI key? export format for test sessions? Needs dedicated design session.*

---

## Compendium Integration — Long-range Architecture (Drop 6+)

**Vision:** The app imports PDFs/epubs (PHB, Xanathar's, sourcebooks), parses them into structured compendium data, and uses that data to inject accurate rule context into every AI send. The AI gets the source text; the game gets AI-interpreted output. A bidirectional grounding loop.

**Data flow:**
```
PDF/epub import → parse → structured compendium (spells, items, features, rules)
                                    ↓
              pc.magic[] / pc.inventory[] reference compendium entries by ID
                                    ↓
              buildPrompt() injects relevant entries as context per send
              (active spells, current conditions, queried terms)
                                    ↓
              AI responds with source-grounded narration + mechanics
```

**Storage:** IndexedDB (not Firebase/localStorage — source data is too large). Compendium IDs live in state; full text lives in IndexedDB.

**What already supports this:**
- `state.snippets[]` — manual proto-compendium; active snippets already inject into every prompt. Same architecture, hand-authored.
- `state.magic[]` per PC — spell lists already tracked; need description field added now.
- `buildPrompt()` / `genLedger()` injection pipeline already exists.

**Seed now (before Drop 6), don't redesign later:**
- Each spell in `pc.magic[]` should carry a `desc` field (short description). Populated manually for now; replaced by compendium parser later.
- `state.snippets[]` is the manual compendium for custom rules, house rules, module-specific content — keep expanding it.
- Compendium injection logic: only inject entries relevant to the current context (active spells, applied conditions, referenced items) — not the full SRD every send.

**Parse targets (priority order):**
1. Spells (name, level, school, casting time, range, components, duration, description)
2. Conditions (name, effect text) — already partially in ALL_CONDS
3. Class features (name, level, description)
4. Items / equipment (name, type, properties, description)
5. Full rulebook chapters (for term lookup / compendium browse)

**Drop sequence:**
- Drop 6 prerequisites: state visibility split, player view
- Drop 7: Full compendium import + injection pipeline (IndexedDB, PDF parser, context-aware injection)

---

## Visual Redesign v2 — D&D Beyond / Demiplane Mobile
*In progress — 4-tab nav is the first deliverable. Card styling and bottom sheet animations already live from QA menu redesign.*

**Key visual patterns:**
- Cards: `border-left: 3px solid var(--accent-brass)` + `border-radius: 8px` + drop shadow
- Header: sticky, `border-bottom: 2px solid brass`, HP vital badge left + pulse-dot AI status right
- Bottom nav: 4 tabs replacing current 9-tab top bar
- Chat bubbles: DM dark-left / player brass-right / roll result centered copper-dashed
- Action pills: horizontal scroll row above chat input (replaces FAB menu)
- D20 FAB: floating copper circle, right side, above bottom nav
- Bottom sheets: `border-top: 3px solid brass`, `border-radius: 16px 16px 0 0`, slide-up animation

**Tab mapping (9 current → 4 bottom nav):**
| Bottom Nav | Current tabs | Sub-nav preserved |
|---|---|---|
| ⚔ Adventure | AI DM | Narrative / Rules / Party OOC |
| 📦 Logistics | World + Wagon + Combat | World State / Ops / Wagon / Combat |
| 📜 Sheet | Party | PC cards + edit sheets |
| ⚙ Systems | AI Tools + Session + Dev + Setup | existing sub-tabs |

---

## Character Sheet Rework — Reference Design

Inspired by D&D Beyond digital sheet + official WotC physical sheet. This is the canonical information hierarchy players expect:

**Identity row** (always visible at top):
Name · Class & Level · Race · Background · Alignment · XP/XP-to-next

**Vital stats row** (always visible, HUD-style):
AC · Initiative · Speed · HP (current/max/temp) · Hit Dice · Death Saves (3 success hearts / 3 failure skulls)

**Proficiency Bonus** · **Inspiration** toggle

**Sheet tabs (horizontal scroll):**
| Tab | Contents |
|---|---|
| **Stats** | 6 ability scores (score + modifier circle) · Saving throws (6, prof dots) |
| **Skills** | 18 skills with proficiency dot + calculated modifier (stat-based auto-calc) |
| **Combat** | Attacks & Spellcasting (weapon name, ATK bonus, damage/type) · Conditions |
| **Spells** | Spell slots by level (bubbles) · Spells known list |
| **Inventory** | Items list · Currency (CP/SP/EP/GP/PP) |
| **Features** | Class features · Racial traits · Feats · Proficiencies & Languages |

**Key UX from D&D Beyond:**
- Ability score = large circle with score inside, modifier displayed prominently below
- Saving throw = small dot (filled=proficient, empty=not) + calculated value
- Skill = same dot system, stat abbreviation, total modifier
- Death saves = hearts (successes) and skulls (failures), tap to toggle
- Attacks show: Name · Range · Hit/DC · Damage · Notes
- Currency shown as 5 coin types in labeled bubbles (CP/SP/EP/GP/PP)

**Implementation notes:**
- Most data already in state (stats, skills, attacks, spells, inventory, currency)
- Death saves: state.pcs[i].death_saves = {successes:0, failures:0} — add to migrate() structural guard
- Inspiration: state.pcs[i].inspiration (boolean) — add to migrate()
- Currency is already state.treasuryData.coins (GP/SP/CP) — EP/PP optional
- This rework is part of Visual Redesign v2 (Phase 2, step 4)

---

## Feature Backlog
*Inspired by D&D Beyond + Demiplane mobile UX. Prioritized by effort vs daily-use value.*

### Near-term
- ✅ Sheet swappable tabs — done 2026-06-14
- ✅ Auto-modifier calculation — done 2026-06-15
- ✅ Dice rolling in sheet — tap stats / attacks, roll + send to chat (done 2026-06-15)
- ✅ Chat term tooltips — 27 D&D terms, tap for popup, DM messages only (done 2026-06-15)
- ✅ Spell/inventory filter sliders — Spellbook level filter done 2026-06-15; wagon already had type filters
- **Expand term glossary** — Add 50+ more terms (class features, conditions, action types). Low effort.
- **Compendium quick-lookup** — Search bar in Rules tab or as modal; offline SRD snippets.
- **Inventory UX overhaul (Issue 21)** — subcategories, fuzzy dedup at item_add, name truncation fix.

### Medium-term
- **Character Builder wizard** — Guided: race → class → background → stats → skills → equipment. Reuses level-up wizard architecture. Medium effort.
- **Offline Compendium snippets** — Curated rules in `state.snippets` (already exists), browseable + searchable. Conditions, spell descriptions, class features. Low-medium effort.

### Long-term / Drop-level
- **Maps** — Drop 4 (Zone combat map). Do NOT touch Combat tab until then.
- **Full offline rulebook storage** — PDFs/epubs via IndexedDB + in-document search. High effort; Drop 6–7.
- **Full spell/item compendium** — Complete SRD with school/level/class/cost filtering. Needs data pipeline. High effort.

---

## VTT Drops
- **Drop 4**: Zone combat map (replaces Combat tab entirely — do NOT refactor Combat tab)
- **Drop 5**: Shared dice feed + image maps (Firebase Storage; token overlay on uploaded map images)
- **Drop 6**: Player View — needs World State/Operations split + state visibility audit first
  - `buildPlayerView()` computes player-safe snapshot → Firebase `/session/playerView`
- **Drop 7**: Handout/image cards + full VTT layer (grid snap, fog of war, room reveals)

---

## Map Architecture

Three tiers, built incrementally:

**Tier 1 — Drop 4: Zone Combat (abstract)**
No image. Six named zones as a styled 2×3 grid. Tokens are colored tiles. AI controls position via `zone_move:` mechanic. Replaces Combat tab. Ships fast, works without a map image.

**Tier 2 — Drop 5: Image Maps + Token Overlay**
Upload any image (screenshot, photo of book map, PDF-extracted map). Tokens placed on image with tap-to-move. Firebase Storage for image URLs. Module maps become playable.

**Tier 3 — Drop 7+: Full VTT Layer**
Grid snap, fog of war, room reveals. Full Roll20 feature set. Tiers 1 and 2 architecture grows naturally into this.

**Three Map Types (same renderer, different data):**
| Type | Use Case | Scale | AI mechanic |
|---|---|---|---|
| Combat Map | Active fight — zones or battle image | Room | `zone_move:` / `token_move:` |
| Dungeon Map | Room exploration, reveals as entered | Building | `room_reveal:` / `room_enter:` |
| Area/World Map | Overworld travel, wagon routes, regions | Regional | `travel_to:` / `waypoint_add:` |

The wagon tracker IS a map (Area scale). Waypoints = towns/camps. Wagon position = current location. Travel log entries anchor to map positions.

**Drop 4 Scope — Option A: zone only (fast)**
Abstract 6-zone grid ships first. Image maps follow in Drop 5. Firebase Storage config required before image maps — confirm before touching.

**Zone definitions:**
| Zone | Role |
|---|---|
| Frontline | Melee range, high danger — fighters, tanks, aggressive enemies |
| Backline | Ranged/support range — bards, rogues, archers |
| Left Flank | Flanking position |
| Right Flank | Flanking position |
| Air | Elevated/flying — flying enemies, area spells |
| Rear | Behind enemy lines — sneak attack, ambush |

**New AI mechanics for Drop 4 (add to parseMechanics):**
- `zone_move: CharName|ZoneName`
- `zone_add_enemy: Name|HP|AC|ZoneName`
- `zone_remove: Name`
- `zone_effect: ZoneName|Description`

**State addition (`state.combat.zones`):**
Each zone is an array of `{ name, type:'pc'|'enemy', hp, hp_max, ac, color }`. Initialize in migrate() structural guard.

---

## QA Testing Checklist (Session 2 rework)

Run on-device before merging Phase 2 to main:

**QA Menu Redesign**
- [ ] Tap ⚡ — bottom sheet slides up, 2-col card grid visible
- [ ] Cards show correct icons and labels for current tab
- [ ] FAB shows ✕ when menu is open
- [ ] Tap ✕ or backdrop — menu slides down, FAB icon restores
- [ ] AI Tools → Quick Actions → FAB Icon input — type emoji, FAB updates immediately
- [ ] Preset icon buttons (🎲🗡🔮 etc.) update FAB
- [ ] Reload — custom icon persists

**Flag System**
- [ ] Tap ⚑ (small gold circle below ⚡) — flag modal opens
- [ ] Tap text box — keyboard appears, no iOS zoom
- [ ] Panel headers have faint ⚑ buttons
- [ ] Flag modal opens above the drawer when drawer is open

**HUD Tiles**
- [ ] Pip (familiar) tile visible in HUD after PC tiles
- [ ] Grit tile visible after Pip
- [ ] Tap Pip — familiar bottom sheet slides up
- [ ] Tap Grit — Grit overview slides up
- [ ] HUD scrolls horizontally if tiles overflow screen

**Dice Roller**
- [ ] Roll & Submit sheet: character dropdown + dice grid visible
- [ ] ±delta buttons adjust modifier value
- [ ] Roll d20 — result shows with nat-20/nat-1 detection
- [ ] Send to chat posts result to narrative

**Other**
- [ ] Wagon tab has Town Rep section (NOT in World tab)
- [ ] Party drawer opens with character editor panel visible by default
- [ ] HP ± dock buttons use customizable step values

---

## State Visibility (for Drop 6)
PUBLIC: `pcs[*]` (name/color/hp/hp_max/ac/conditions — NOT backstory_secret), worldData (time/season/weather/location/scene_title/travelLog/premise/primaryMission), quests (hidden!==true), chatHistory, combat.list, treasuryData coins.
DM-ONLY: worldData.secrets/plot/timers/campaignSecrets, dmSecrets, pcs[*].backstory_secret, businessProfile.realStock/snakeOil.

Open questions (answer before Drop 6):
1. Town reputation — player-visible?
2. Income log — player-visible?
3. NPC dispositions — DM-only meta?
4. Hidden quests — DM-planted objectives?

---

## Open Gameplay Issues
4. Tab navigation on state change — ADDRESSED (tab-flash + count badges)
5. Chat log archive — DONE (summarizeAndPrune, DR-7)
6. Income/Expense Log silent — PARTIALLY ADDRESSED (detectUnloggedGold confirm-chip). Root cause: AI compliance gap, not parser.
7. NPC log silent — Same compliance pattern. Deferred until gold chip proves the pattern.
8. Quest "Primary Goal" rename — ✅ DONE (already says "Main Quest")
9. Travel Log — ✅ DONE (in Wagon tab)
15. Party chat → narrative ping — ✅ DONE (ooc_echo bar in narrative feed)
16. Message lock — ✅ DONE (2026-06-15, _expandedMsgs Set)
21. **Inventory UX overhaul** — Three interlocked problems:
    - Name truncation in party + PC inventory
    - No subcategories/grouping (wagon cargo has filter tabs; party inventory has nothing)
    - Semantic duplicate gap (e.g. "Sedative Bolt" vs "Tranquilizer Darts" created as separate items). Need fuzzy dedup at item_add: similar to npc_add dedup.

---

## Recurring AI Failure Patterns
**Pattern 1 — State Drift:** AI narrates events but doesn't emit matching mechanics lines. Root cause: AI compliance gap, not parser. Fix: `detectUnloggedGold()` confirm-chip at point of miss. Extend to items/NPCs later.
**Pattern 2 — Navigation Blindness:** State changes in background tabs not visible. Fix: tab-flash + count badges (shipped).

---

## Key Redundancies (to resolve)
1. `state.worldData.premise` — written by Setup→Session Zero AND World tab textarea
2. `state.worldData.setting` — written by Setup AND World tab
3. Business Profile — Setup step 3 AND World tab bp_* panel
Fix: Setup steps become deep-links into World tab when `campaignLaunched`.

---

## Dead Code / Bug Fixes Log
- Theme editor block — REMOVED 2026-06-14
- CSS Blocks 1 & 2 — REMOVED 2026-06-14
- `state.storyThread` — ELIMINATED 2026-06-14
- ⋮ overflow menu clipping — FIXED 2026-06-14
- Header menu stuck-open on mobile — FIXED 2026-06-14
- Flag context blind spot — FIXED 2026-06-14 (`_buildFlagUIContext()`)
- Canonical L3 character sync — DONE 2026-06-14 (SAVE_VERSION 10→11)
- SHEET_FIELDS double-clobber — FIXED 2026-06-14 (both loadState + fbStartListening)
- Subclass display on cards + sheet — DONE 2026-06-14
- Current HP field on sheet — DONE 2026-06-14
- HP step customization (state.hpSteps, renderStepBar, setHpStep) — DONE 2026-06-15 (Session 2)
- AI contract textareas auto-resize (field-sizing:content, JS resize on input) — DONE 2026-06-15 (Session 2)
- Drawer party tab glitch (renderCharTabs + renderSheets on openDrawer) — FIXED 2026-06-15 (Session 2)
- Delete party member from PC overview (🗑 button in action row) — DONE 2026-06-15 (Session 2)
- Familiar HUD tile — Pip (Tinkle's rat), purple border, opens familiar bottom sheet — DONE 2026-06-15 (Session 2)
- Grit HUD tile — ox from state.wagon.ox, green border, opens Grit bottom sheet — DONE 2026-06-15 (Session 2)
- Pip familiar seeded in migrate() structural guard (no SAVE_VERSION bump) — DONE 2026-06-15 (Session 2)
- HUD scroll-fade gradient (::after on .global-hud) — DONE 2026-06-15 (Session 2)
- Town Rep moved to Wagon tab — DONE 2026-06-15 (Session 2)
- spell_add mechanic in parseMechanics() — DONE 2026-06-15 (Session 2)
- Dice roller upgrade (char select, roll type, modifier, ±delta, d4–d%) — DONE 2026-06-15 (Session 2)
- Bug 4: Firebase error toast → friendly message — FIXED 2026-06-15 (Session 2)
- Bug 5: closeDrawer() resets currentTab → renderQAMenu() — FIXED 2026-06-15 (Session 2)
- Familiar/Grit bottom sheets fixed (were rendering inline; now position:fixed transform-based) — FIXED 2026-06-15 (Session 2)
- Flag system: .qa-modal z-index raised to 1600; floating ⚑ FAB added; font-size:16px on textarea; injectPanelFlags() in renderAll() — DONE 2026-06-15 (Session 2)
- QA menu redesign: full-width bottom sheet, 2-col card grid, FAB morphs to ✕, custom icon picker (state.qaFabIcon) — DONE 2026-06-15 (Session 2)

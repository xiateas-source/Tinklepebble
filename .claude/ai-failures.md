# AI Failure Record — Development Reference

*Not a game contract. This is for the development AI and developer — the audit trail for Law 2.*

Every entry is a documented AI failure from v1 gameplay. Each one either needs a code constraint (Law 2: container enforcement) or a contract clause (soft enforcement for what code can't handle). When a failure gets a code fix, the corresponding contract clause can be removed.

---

## Mechanical Failures (code-enforceable)

- **HP without mechanics** — AI adjusted HP in narration without emitting `hp:` mechanic line. Needs: response validation rejects HP changes without mechanic.
- **Skipped concentration saves** — AI dealt damage to a concentrating caster and didn't request a save. Needs: automatic concentration check trigger on any damage to a concentrating PC.
- **Resolved without rolls** — AI resolved actions that require skill checks without requesting a roll. Needs: structural roll gating — certain action types must have a roll_request before resolution.
- **Narrated state without mechanics** — AI narrated gold found, items looted, NPCs met, conditions applied without emitting mechanic lines. State didn't update. Needs: response structure validation — narrated state changes without mechanics flagged or rejected.
- **Action economy violation** — AI let a caster cast a spell, use a bonus action feature, AND help another PC all in one turn. Needs: action economy enforcement — track actions used per turn.
- **Entity duplication** — AI created new NPC entries for characters that already exist in the tracker. Needs: entity dedup — fuzzy match against existing NPCs before creating new ones.
- **HP/stat fabrication** — AI set level, hp_max, class features, or spells via mechanics (should be wizard-only). Needs: field ownership enforcement — system-owned fields reject AI writes.
- **Combined/skipped turns** — AI combined multiple players' turns into one response, skipped players, or advanced the story while players were still deliberating. Needs: enforced turn order in combat — AI waits for all players in initiative order before advancing.
- **Skill check skipping** — AI gave players what they wanted without requiring a skill check. Needs: roll requirement enforcement for action types that demand checks.
- **Consequence timer ignored** — AI forgot to enforce time-sensitive consequences (sleep wearing off, enemies tracking party, environmental countdowns). Players also forgot because consequences were buried behind quests. Needs: active consequences injected into prompt with timers, engine flags expiring timers for resolution before AI moves on, situation bar shows consequences with priority placement.
- **Prose dice rolling** — AI rolled dice in narration text ("the goblin rolls a 15 to hit") instead of using the mechanics system. Needs: detection when AI makes rolls in prose, should go through roll mechanics not narration.

## Information Failures (code-enforceable)

- **Generic addressing** — AI said "you" as a catch-all instead of addressing characters by name. Needs: per-character awareness baked into prompt construction.
- **Hidden enemy resolution** — AI resolved hidden enemies without requiring perception checks first. Needs: information gating — hidden entities not revealed without detection.
- **Dungeon secret leaks** — AI revealed module content (upcoming rooms, plot twists, secrets) before players discovered them through play. Needs: module content gating — imported content has `discovered` flag, AI prompt only includes discovered content.
- **Fabricated content** — AI invented NPCs, locations, items, or lore not in the source material or established campaign. Needs: source verification against imported canon.

## Narrative Failures (contract-only — code can't fully enforce)

- **Scene progression without consent** — AI progressed scenes, moved time forward, or advanced the story without asking players if they were ready. Needs: player agency contract clause.
- **Forgot established personality** — AI changed an NPC's established behavior or disposition mid-scene without reason.
- **Repeated descriptions** — AI gave the same description it already provided in a recent turn.
- **Inconsistent information** — AI told different players different things about the same situation.
- **Misread own ledger** — AI stated wrong HP, gold, or inventory despite correct values in the system prompt.

---

## How This File Works

- **Append-only** — new failures discovered in v2 get added here
- **Never complete** — this list grows as long as we play
- **Audit trail for Law 2** — when a contract clause keeps getting violated, check here, find the pattern, build a code constraint
- **Tracks enforcement status** — once a failure has a working code constraint, mark it ✅ and the contract clause can be removed

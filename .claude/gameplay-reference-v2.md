# V1 Gameplay Reference — For V2 Engine Development

*Exported from Tinkle's Tinctures campaign, Day 7-26. Reference for how the AI actually behaves in practice.*

---

## What Works Well

**Narrative quality is high.** The AI produces vivid, scene-setting prose with sensory detail. It addresses characters by name (Valenns, Slasher, Aria) and gives each one moments. Multi-player addressing is working — the AI speaks to specific characters, not "you" generically.

**Previously On summaries are effective.** Each session archive entry has a tight recap that captures the action and stakes. Format: action summary paragraph + status update. These feed back into buildPrompt as context.

**The AI presents choices.** "How do you proceed?" with 2-3 concrete options. Gives players agency without leaving them lost. Bold headers for each option make scanning easy on mobile.

**Combat and skill moments are dramatic.** The AI narrates the mechanics meaningfully — a stealth check becomes "you melt into the shadows," not "you pass the check."

**Multi-character coordination.** The AI handles split-party situations well (Valenns in the ceiling joists while Slasher/Aria in the kitchens). Uses Message spell for in-character communication between groups.

---

## Patterns to Preserve in V2

**Session archive format:**
```
[Day X, HH:MM] (N msgs)
[Last line of the session's final AI message]

***

**Previously:** [1-2 paragraph recap of what happened]
```

**AI response structure:**
```
[Narrative prose — 2-4 paragraphs, addresses PCs by name]

***

**Previously:** [recap paragraph]

**Status Update / Mechanics:**
- XP earned
- Current state
- Options for next action
```

**Choice presentation:**
```
**You have several options:**
*   **Option A:** Description
*   **Option B:** Description  
*   **Option C:** Description

**How do you proceed?**
```

**Roll request flow:**
```
AI identifies action requiring a roll →
Names the PC, the skill, the context →
"*(Please roll for Slasher's Athletics/Attack to subdue!)*"
→ Roll request banner appears pre-filled
```

---

## Patterns That Need Fixing in V2

**XP delivery varies.** Sometimes XP is encounter-only deltas (correct), sometimes it's cumulative totals or bulk awards. Format: "You have earned 950 XP" vs "Current Total: 1,900 XP" — the second is ambiguous (is it new or cumulative?).

**Mechanics block not visible in this export.** The gameplay log shows narrative + Previously On, but the actual `key: value` mechanics lines aren't shown here. Need to see a raw response with mechanics to capture the format.

**AI sometimes resolves actions without rolls.** "Both of you succeed in reaching the vantage point undetected" — did the AI request stealth rolls for this? Or did it auto-resolve? This is the "resolved without rolls" failure pattern.

**Scene pacing is AI-driven.** The AI advances time and scenes in the Previously On recaps. Good for narrative flow, but the consequence timer problem applies here — time-sensitive events could be skipped in these jumps.

---

## Notes for V2 Contract Writing

The v1 AI responds well to:
- Specific character names in instructions (not "the players")
- Explicit format rules (MECHANICS block format, XP as deltas only)
- "Before narrating X, you MUST Y" patterns (before resolving, request a roll)
- Information gating language ("only reveal content the players have discovered through play")

The v1 AI ignores or drifts on:
- Vague instructions ("be careful with pacing")
- Long contract paragraphs (shorter, rule-per-line format works better)
- Instructions buried in the middle of large text blocks

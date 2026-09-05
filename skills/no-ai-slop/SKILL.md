---
name: no-ai-slop
description: 'Use this skill when editing drafts to remove AI-generated writing patterns, when the user asks to make writing sound less AI, more human, more direct, or more opinionated, or when auditing text for AI slop patterns like "It''s not X. It''s Y.", "Here''s the thing", "studies show", or fake-profound endings. Do not edit prose without this skill loaded.'
license: MIT
metadata:
  version: "1.0.0"
  author: thomiOmi
  credits: "Adapted from petergyang/no-ai-slop (MIT License)"
---

# No AI Slop

Act as a sharp human editor. Preserve the writer's point and personal voice while making the writing clearer and more alive. Remove AI patterns without turning distinctive writing into generic polished prose.

## Two Jobs

**Edit (default).** The user shares a draft to fix. Make the minimum effective edit with the rules below, then return the edited draft plus a "What changed" section.

**Detect.** The user asks whether a piece is AI slop, or asks to audit, scan, or flag a draft without rewriting. Name each pattern from this skill that appears, quote the line, and give the fix in a few words. Do not rewrite, score the draft, or guess whether AI wrote it. AI detectors guess. Named patterns are evidence the user can check. Offer to edit the draft after the report.

## What to Ask For

- If the user has not provided a draft, ask them to paste it.
- If the audience or format is unclear, ask one question: who is this for and where will it be published?
- If the goal is unclear, ask what the reader should think, feel, or do after reading it.

## Editing Principles

- **Preserve the writer's real voice.** Notice the draft's vocabulary, cadence, bluntness, humor, uncertainty, digressions, and level of polish. Keep the traits that feel personal. Do not make every paragraph equally tidy or rewrite distinctive lines merely for consistency.
- **Make the minimum effective edit.** Fix AI patterns, errors, repetition, and unclear passages. Leave strong human sentences alone.
- **Lead with the point when the setup adds nothing.** Cut generic throat-clearing. Keep a personal aside, story, or admission when it creates context, tension, or character.
- **Front-load only when it improves clarity.** Do not force every section into the same point-detail-background shape.
- **Keep the user's meaning.** Never invent claims, examples, stats, or opinions. If something is unclear, ask.
- **Open it up, don't dumb it down.** Keep substance, nuance, and precision. Strip out only what makes it hard to read: jargon, long sentences, abstract nouns, tangled structure.
- **Use active voice.** "The team shipped it Tuesday" beats "the decision emerged." Never let inanimate things do human verbs.
- **Make every sentence earn its place.** Cut empty qualifiers and throat-clearing. Keep "I think," "maybe," or "to be honest" when they express real uncertainty or the writer's spoken rhythm.
- **Untangle without flattening cadence.** Split sentences only when genuinely hard to follow. Keep longer spoken sentences, fragments, and pace changes when they are clear and characteristic.
- **Be concrete and specific.** "The integration improved efficiency" becomes "The integration cut deploy time from 40 minutes to 4." Names, numbers, dates, mechanisms, and examples beat abstractions.
- **Apply the portability test.** If a sentence could move unchanged to another person, company, or product, it is filler. Cut it or replace it with something specific to this subject.
- **Show, don't tell the reader what to think.** Let facts, actions, examples, and consequences carry the emphasis.

## Patterns to Remove

**Binary contrasts.** "It's not X. It's Y." State the positive claim directly.

**Throat-clearing openers.** "Here's the thing," "Let me be clear," "Let's dive in." Delete and start with the point.

**Faux-insight setups.** "What nobody tells you is," "The part everyone misses." Just tell the insight.

**Colon reveals.** "The best part: it learns." Rewrite as a normal sentence.

**Dramatic fragmentation.** "That's it. That's the whole thing." or "X. And Y. And Z." Use complete sentences.

**Superficial analysis.** Cut trailing -ing clauses that pretend to explain meaning: "highlighting," "underscoring," "reflecting," "showcasing." Replace with the actual consequence.

**Importance puffery.** "Stands as a testament," "marks a pivotal moment," "plays a vital role." State the fact and let the reader judge whether it matters.

**Interpretive metadiscourse.** Cut lines that step outside the subject: "That last part matters more than it sounds," "The key point is," "As you can see," and redundant "In other words."

**Weasel attribution.** "Experts agree," "studies show," "many argue." Name the source or cut the claim. If the user has no source, ask instead of inventing one.

**Fake-strong verbs.** Prefer "is" and "has" when clearer. "The app serves as a centralized hub" becomes "The app tracks sponsors, drafts, and approvals in one place."

**Synonym cycling.** If the clear word is right, repeat it. "The agent reviews the draft. The assistant scores the piece." becomes "The agent reviews the draft and scores it."

**Negative listing.** "Not a X. Not a Y. A Z." Just say Z.

**Robotic rhythm.** Vary repeated sentence shapes, identical paragraph structures, and stacked punchy fragments.

**Rhetorical setups.** "What if I told you," "Think about it:", "Plot twist:", and self-answered "Question? Answer." pairs. Drop them and make the point.

**Fake-profound kickers.** Delete the final "deep" line instead of rewriting it into a better metaphor. End on the clearest concrete sentence already in the draft.

**Summary-recap endings.** "In conclusion," "Ultimately," or a final paragraph that restates the piece. End on the last concrete point, takeaway, or next action.

**Formatting slop.** Emoji in headings, bold sprinkled mid-sentence, bullet lists where two sentences of prose read better, and headers over two-sentence sections.

**Em dashes as a rhythm crutch.** In short copy, use none. In longer drafts, one or two are fine only when they clearly beat commas, periods, or parentheses. Remove clusters and decorative dashes.

## Workflow

1. Read the full draft before editing.
2. Identify the core point and the voice traits to preserve. If you cannot identify the core point, ask the user.
3. For a detect request, return the findings report described in Two Jobs and stop.
4. For an edit, make the minimum effective changes, then check the edited draft against the Verification Checklist.
5. If any check fails, fix the draft and run the checks again.
6. Output the full edited draft and a short "What changed" section.

## Verification Checklist

```markdown
- [ ] Preserved the user's point without adding claims, examples, stats, or opinions
- [ ] Preserved distinctive vocabulary, cadence, humor, and level of polish
- [ ] Left strong human sentences alone instead of rewriting them for consistency
- [ ] Cutting is proportional to the actual slop, no aggressive compression
- [ ] Every generic sentence passes the portability test or was made specific
- [ ] Active voice with human subjects where the draft supports it
- [ ] All listed patterns removed or replaced with plain facts
- [ ] Fake-profound kickers deleted, not rewritten into better metaphors
- [ ] No summary-recap ending; piece ends on a concrete point or next action
- [ ] Output includes the full edited draft and a "What changed" section
- [ ] For detect requests: each pattern named with a quoted line, no rewriting or scoring
```

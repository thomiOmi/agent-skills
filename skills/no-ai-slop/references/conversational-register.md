# Conversational Register

Load this reference when cleaning an assistant reply or chat answer rather than a published article. Use it with `no-ai-slop`. Judgement calls here are about shape and tone, not regex matches.

## Why this is separate

A chat reply has a different failure mode from a draft. The writing is usually correct but over-structured: it recaps what the user said, narrates the assistant's process, and wraps a short answer in a long paragraph.

## Checks

### Wall-of-text replies

A block of four or more sentences under 150 words is hard to scan. Break it at thought boundaries: one point per paragraph, with the conclusion in its own short line. Do not split a sentence that is clear just to shorten the paragraph.

### Recap-flattery openers

Openers that restate the user's effort before answering are filler:

- "Thanks for all the legwork here, the migration script..."
- "Great question, let's dive into..."
- "You've clearly put a lot of thought into this..."

Replace with one plain clause about the task, then answer. Keep a real acknowledgement when the user is frustrated or when the context genuinely changes the answer.

### Narrated candor

Phrases such as "I want to be upfront:" or "Let me be honest with you:" announce a caveat instead of giving it. State the caveat directly. Keep explicit disclosure when there is an actual conflict of interest; that is substance, not a stylistic tell.

### Narrated reasoning

Do not describe the work before doing it. Cut "Let me think about this" and "I'll walk through the options" when the answer itself follows. Keep the narration only when the user asked for the reasoning.

### Endings

End on the next concrete action or the answer itself. Remove "In summary", "Let me know if you need anything else", and a final paragraph that restates the reply.

## Verification checklist

```markdown
- [ ] Short answers are not wrapped in one dense paragraph
- [ ] Opener states the task instead of praising the question
- [ ] Caveats are stated directly, with real disclosures kept
- [ ] No narration of reasoning before the answer
- [ ] Ending gives the answer or a concrete next step
```

Source conventions adapted from conorbronsdon/avoid-ai-writing (MIT). Rules are paraphrased; see `no-ai-slop/SKILL.md` for credits.

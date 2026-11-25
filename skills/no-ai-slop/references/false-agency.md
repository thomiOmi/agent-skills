# False Agency

Load this reference when a draft gives inanimate things human verbs or hides the actor behind an abstract noun. It supplies examples for the active-voice principle already stated in `no-ai-slop/SKILL.md`.

## Principle

Name the person or team that acted. If the actor is genuinely unknown or irrelevant to the point, passive voice is fine. The problem is not the passive form itself, it is the missing decision maker.

## Rewrites

- "the decision emerged" -> "we chose X because Y". Name who decided and why.
- "the data tells us that users prefer..." -> "we read the data as evidence that users prefer...".
- "the design speaks for itself" -> state the design choice and the result it produces.
- "nobody designed this to work that way" -> name the team and the trade-off they made.
- "the system wants to retry" -> "the system is configured to retry".
- "best practices suggest..." -> name the source or state the reason directly.
- "it was decided that..." -> "the team decided..." when the team is known.

## When to keep the original

Keep an abstract subject when the institution is the actual actor and naming individuals would mislead, for example "the court ruled" or "the compiler rejected the input". Keep passive voice when the actor was not recorded and the point is the outcome.

Do not replace every passive sentence. Apply this reference only where a human choice was hidden.

## Verification checklist

```markdown
- [ ] Inanimate subjects with human verbs were named or rewritten
- [ ] Hidden decision makers were made explicit where known
- [ ] Legitimate institutional actors were left alone
- [ ] Passive voice was kept when the actor is genuinely unknown
- [ ] No sentence was rewritten only to avoid the passive form
```

Source conventions adapted from hardikpandya/stop-slop (MIT). Rules are paraphrased; see `no-ai-slop/SKILL.md` for credits.

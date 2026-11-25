# Preservation During Editing

Load this reference before editing a draft that contains facts, numbers, quotes, or citations. Use it with `no-ai-slop`. Its job is to stop a style edit from becoming a fact edit.

## Pass limit

Use one editing pass followed by at most one correction pass. A third pass usually adds subjective polish and starts changing meaning. Stop when the listed patterns are gone.

## Before and after check

Compare the edited draft against the original and confirm that all of these are unchanged unless the user approved a change:

- Names of people, places, products, and teams.
- Numbers, units, dates, and comparisons, including the baseline behind a percentage.
- Quotes and their attribution.
- Citations and links.
- Causal claims such as "X caused Y" and the direction of that claim.
- Negative claims, for example "we did not test this".

If a value changed during rewriting, restore it. If the original value was wrong, flag it to the user rather than silently correcting it.

## Unsupported claims

When a sentence asserts a statistic, a source, or a testimonial that the draft does not support:

1. Name the sentence and say which support is missing.
2. Leave it in place if the user must supply the source, or remove it if they prefer.
3. Never invent a source, a number, or a quote to make the line read cleanly.

An unsourced claim is a content problem, not a rhythm problem. Do not solve it by rephrasing.

## Unclear meaning

If a sentence cannot be edited without guessing what the author meant, ask one focused question. "What does this number refer to?" is better than a guess that reads well.

## Verification checklist

```markdown
- [ ] At most one edit pass plus one correction pass
- [ ] Names, numbers, dates, quotes, and links match the original
- [ ] Causal direction and negative claims are preserved
- [ ] Unsupported claims were flagged, not invented
- [ ] Unclear meaning was asked about, not guessed
```

Source conventions adapted from conorbronsdon/avoid-ai-writing (MIT). Rules are paraphrased; see `no-ai-slop/SKILL.md` for credits.

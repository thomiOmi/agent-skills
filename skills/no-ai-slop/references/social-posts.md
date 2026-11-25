# Social Post Tells

Load this reference when editing posts for social platforms (X, LinkedIn, Mastodon, launch threads). Use it with `no-ai-slop`; it extends the pattern list, it does not replace it.

## Why this is separate

Social copy carries artifacts that prose drafts rarely have: generated citation tokens, tracking parameters, unfilled placeholders, and hashtag blocks. They survive a normal slop edit because none of them look like bad writing. Check them explicitly.

## Checks

### Stray generation artifacts

Remove tokens that belong to a tool transcript, not to a published post:

- `citeturn0search0`, `oai_citation`, `contentReference[...]`, and similar bracketed source markers.
- Segments with `utm_source=chatgpt.com` or other campaign tracking parameters. Keep the clean URL.
- Visible prompts or scaffolding such as `As an AI`, `Sure, here is`, or an instruction echo.

If a citation is real, replace the token with a plain source name. If it cannot be verified, remove the claim.

### Placeholders

Flag any of these before publishing:

- `[INSERT SOURCE]`, `[LINK]`, `[NAME]`, `TODO`, `TBD`.
- Date shapes such as `2025-XX-XX` or `<date>`.
- Numbers with no referent, for example `40% faster` with no baseline.

Ask the user for the real value or delete the claim. Never fill a placeholder with a plausible invention.

### Hashtag blocks

More than three or four trailing hashtags read as distribution noise. Keep only tags that name the actual topic. Drop generic tags such as `#AI`, `#innovation`, and `#productivity` unless they are the subject of the post.

### Attention hooks

Openers such as "I can't stop thinking about this" or "This changed everything" need a concrete reason in the next sentence. If the reason is missing, start with the reason instead. Do not replace the hook with a cleverer hook.

## Verification checklist

```markdown
- [ ] No generated citation or reference tokens remain
- [ ] URLs are clean of tracking parameters
- [ ] No unfilled placeholder, TODO, or masked date remains
- [ ] Every number has a real source or was removed
- [ ] Hashtags name the topic and are limited to a few
- [ ] Each hook is followed by a concrete reason
```

Source conventions adapted from conorbronsdon/avoid-ai-writing (MIT). Rules are paraphrased; see `no-ai-slop/SKILL.md` for credits.

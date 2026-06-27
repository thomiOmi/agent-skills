---
name: documentation
description: 'Use this skill when writing, updating, or auditing any developer documentation. Triggers: "update the README", "write docs", "document this", "changelog entry", "write an ADR", "check what is documented", "audit the docs", "OpenAPI spec". Also apply when a code change clearly requires a documentation update.'
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.2.0"
  author: thomiOmi
---

# Documentation

Write for the reader who has zero context from this conversation.
If it only makes sense to you right now, it will confuse someone else later.

---

## References

- `references/readme.md` — README structure, quick-start rules, what to document vs what not to
- `references/changelog.md` — Keep a Changelog format with section types and examples
- `references/adr.md` — Architecture Decision Record template and when to write one
- `references/openapi.md` — OpenAPI spec minimum requirements per endpoint

See `assets/templates.md` for README skeleton, changelog entry, and ADR templates.

---

## Checklist

```
- [ ] README updated if setup, config, or usage changed
- [ ] CHANGELOG entry added under [Unreleased]
- [ ] OpenAPI spec updated if any REST endpoint changed
- [ ] ADR written if a significant architectural decision was made
- [ ] Code examples in docs are verified to work
- [ ] No "TODO: document this" left behind
- [ ] Written for a reader with zero prior context
```

---
name: documentation
description: Use this skill when writing or updating developer documentation — README, changelog, ADR, OpenAPI spec, or setup guides. Triggers: "update the README", "write docs", "document this", "changelog entry", "ADR", "OpenAPI spec". For PRD, SDD, or requirements documents use sdlc-documentation instead.
license: MIT
compatibility: OpenCode, Claude Code, Cursor, and similar AI coding agents.
metadata:
  version: "2.0.0"
  author: thomiOmi
---

# Documentation

Write for the reader who has zero context from this conversation.

See `references/readme.md` for README structure and quick-start rules.
See `references/changelog.md` for Keep a Changelog format and examples.
See `references/adr.md` for Architecture Decision Record template.
See `references/openapi.md` for OpenAPI spec minimum requirements.

---

## Checklist

```
- [ ] README updated if setup, config, or usage changed
- [ ] CHANGELOG entry added under [Unreleased]
- [ ] OpenAPI spec updated if any REST endpoint changed
- [ ] ADR written if a significant architectural decision was made
- [ ] Code examples in docs verified to work
- [ ] No "TODO: document this" left behind
- [ ] Written for a reader with zero prior context
```
